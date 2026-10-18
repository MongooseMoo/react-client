import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createServer as createViteServer} from 'vite';
import {chromium} from '@playwright/test';

// Native OfflineAudioContext observes real output samples through the public
// selected-output APIs. It deliberately does not mock voice or AudioParam calls.
const vite=await createViteServer({server:{middlewareMode:true},appType:'custom'});
const server=createServer((request,response)=>{
  if(request.url==='/probe'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><title>Sequence render probe</title>');}
  else vite.middlewares(request,response);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const wav=Buffer.alloc(44+48000*2);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
wav.writeUInt32LE(48000,24);wav.writeUInt32LE(96000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
wav.write('data',36);wav.writeUInt32LE(wav.length-44,40);
for(let n=0;n<48000;n++)wav.writeInt16LE(Math.round(Math.sin(n*2*Math.PI*261.63/48000)*12000),44+n*2);
const sample=`MIDI.Soundfont.acoustic_grand_piano = {"C4":"data:audio/mp3;base64,${wav.toString('base64')}"}`;
const browser=await chromium.launch();
try{
  const page=await browser.newPage();
  await page.route('https://gleitz.github.io/midi-js-soundfonts/**',route=>route.fulfill({status:200,body:sample,headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto(`${origin}/probe`);
  const result=await page.evaluate(async()=>{
    const {virtualMidiService}=await import('/src/VirtualMidiService.ts');
    const {SoundfontOutput}=await import('/src/midi/SoundfontOutput.ts');
    const {SequencePartGraph}=await import('/src/midi/SequenceGraph.ts');
    async function render(kind,stopLeft,percussion=false){
      const context=new OfflineAudioContext(2,48000*2,48000);
      await virtualMidiService.setAudioOutput({context,destination:context.destination});
      const port=await virtualMidiService.getVirtualPort();
      if(!port)throw new Error('Virtual output unavailable');
      for(let ch=0;ch<16;ch++)port.send([0xb0+ch,120,0]);
      let font;
      if(kind==='soundfont'){
        font=new SoundfontOutput('MusyngKite',()=>({context,destination:context.destination}),port,()=>{});
        await font.ready();
      }
      const output=font?font.getSequenceOutput():await virtualMidiService.getSequenceOutput();
      if(!output)throw new Error('Independent output unavailable');
      await output.prepare([{id:'p',name:'Piano',kind:percussion?'percussion':'melodic',program:kind==='soundfont'?0:73,notes:[],controls:[],programs:[]}],new AbortController().signal);
      const left=context.createStereoPanner(),right=context.createStereoPanner();left.pan.value=-1;right.pan.value=1;
      left.connect(context.destination);right.connect(context.destination);
      const partLeft=new SequencePartGraph(context,left),partRight=new SequencePartGraph(context,right);
      partLeft.control(7,127,0);partRight.control(7,127,0);
      const options={program:kind==='soundfont'?0:73,percussion,note:percussion?81:60,velocity:100,startTime:0.25};
      const a=output.playNote({...options,destination:partLeft.input});
      const b=output.playNote({...options,destination:partRight.input});
      a.release(0.6);b.release(0.6);
      const cancelled=output.playNote({...options,startTime:0.1,destination:partLeft.input});cancelled.stop();await cancelled.ended;
      const pause=context.suspend(0.35).then(()=>{
        if(stopLeft){a.stop();partLeft.control(7,0,context.currentTime);}
        // Live channel cleanup must not alter either score's independently owned handle.
        for(let ch=0;ch<16;ch++)port.send([0xb0+ch,120,0]);
        if(font){font.send([0xb0,7,0]);font.send([0xb0,10,0]);font.send([0xb0,120,0]);}
        return context.resume();
      });
      const audio=await context.startRendering();await pause;
      await Promise.race([Promise.all([a.ended,b.ended]),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Voice release did not complete')),2000))]);
      const channels=[...Array(2)].map((_,ch)=>Array.from(audio.getChannelData(ch)));
      output.dispose?.();partLeft.dispose();partRight.dispose();font?.close();
      await virtualMidiService.dispose();
      return channels;
    }
    const results={};
    for(const kind of ['virtual','soundfont']){
      for(const percussion of [false,true]){
      const base=await render(kind,false,percussion),stopped=await render(kind,true,percussion);
      results[`${kind}-${percussion?'percussion':'melodic'}`]={
        onsetSilent:base.every(ch=>ch.slice(0,12000).every(value=>Math.abs(value)<1e-7)),
        audible:base.every(ch=>ch.slice(12500,16000).some(value=>Math.abs(value)>0.001)),
        cancelled:stopped[0].slice(18000).every(value=>Math.abs(value)<1e-7),
        isolated:base[1].every((value,index)=>value===stopped[1][index]),
      };
      }
    }
    return results;
  });
  for(const [kind,renderResult]of Object.entries(result)){
    assert.deepEqual(renderResult,{onsetSilent:true,audible:true,cancelled:true,isolated:true});
    console.log(`${kind}: native shared-context onset, future cancellation, source stop, release and part isolation passed`);
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await vite.close();}
