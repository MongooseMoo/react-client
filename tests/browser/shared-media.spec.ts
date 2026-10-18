import {expect,test} from '@playwright/test';
import {build} from 'esbuild';
import {resolve} from 'node:path';
const origin=process.env.PLAYWRIGHT_BASE_URL||'http://localhost:5173';
function wave():Buffer{
  const rate=8000,length=rate*8,bytes=Buffer.alloc(44+length*2);
  bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);
  bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(length*2,40);
  for(let i=0;i<length;i++)bytes.writeInt16LE(Math.round(Math.sin(i/rate*440*Math.PI*2)*8000),44+i*2);
  return bytes;
}
test('native finite HTML joins silently at the current cursor; cancelled future buffer remains silent',async({page,context})=>{
  test.setTimeout(45000);
  const module=await build({bundle:true,write:false,format:'esm',target:'es2022',platform:'browser',stdin:{contents:'export {MediaService} from "./src/audio/MediaService.ts"; export {SharedClock} from "./src/timing/SharedClock.ts";',resolveDir:resolve('.'),loader:'ts'}});
  await context.route('**/shared-media-fixture',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><button id="unlock">Unlock</button>'}));
  await context.route('**/shared-media-fixture.js',route=>route.fulfill({contentType:'text/javascript',body:module.outputFiles[0].text}));
  const bytes=wave();
  let delayed=false;
  const deliver=async route=>{
    if(route.request().url().includes('late')&&!delayed){delayed=true;await new Promise(resolve=>setTimeout(resolve,1200));}
    const range=route.request().headers().range;
    const start=range?Number(/bytes=(\d+)/.exec(range)?.[1]??0):0;
    await route.fulfill({status:range?206:200,headers:{'Content-Type':'audio/wav','Access-Control-Allow-Origin':'*','Accept-Ranges':'bytes',...(range?{'Content-Range':`bytes ${start}-${bytes.length-1}/${bytes.length}`}:{})},body:bytes.subarray(start)});
  };
  await context.route('https://mongoose.world:9080/**',deliver);
  await context.route('**/shared-tone.wav',deliver);
  await page.goto(`${origin}/shared-media-fixture`);
  await page.evaluate(async()=>{
    const {MediaService,SharedClock}=await import('/shared-media-fixture.js');
    const media=new MediaService(undefined,{manageFocus:false});
    const clock=new SharedClock(()=>{});clock.setLocalMapping({clockId:'browser',serverNowMs:performance.now(),performanceNowMs:performance.now()});
    globalThis.media=media;globalThis.clock=clock;globalThis.snapshot=undefined;
    media.configureSharedMedia(clock,request=>queueMicrotask(()=>media.receiveMediaSync({...request,transport:globalThis.snapshot})));
    document.querySelector('#unlock').addEventListener('click',()=>media.cacophony.resume());
  });
  await page.click('#unlock');
  const paused=await page.evaluate(async()=>{
    const transport={version:1,kind:'media',clockId:'browser',sourceId:'paused',revision:1,state:'paused',anchorServerMs:performance.now(),positionMs:2000,durationMs:8000,rate:1,mode:'finite'};
    globalThis.snapshot=transport;
    await globalThis.media.play({key:'tv',name:'shared-tone.wav',url:location.origin+'/',type:'music',transport});
    const playback=globalThis.media.sounds.tv.playbacks[0];
    return {cursor:playback.currentTime,playing:playback.isPlaying};
  });
  expect(paused.playing).toBe(false);expect(paused.cursor).toBeCloseTo(2,2);
  const joined=await page.evaluate(async()=>{
    const transport={...globalThis.snapshot,revision:2,state:'playing',anchorServerMs:performance.now(),positionMs:3000};
    globalThis.snapshot=transport;globalThis.media.update({key:'tv',transport});
    await new Promise(resolve=>setTimeout(resolve,350));
    const playback=globalThis.media.sounds.tv.playbacks[0];
    return {playing:playback.isPlaying,errorMs:Math.abs(playback.currentTime*1000-(3000+performance.now()-transport.anchorServerMs))};
  });
  expect(joined.playing).toBe(true);expect(joined.errorMs).toBeLessThan(250);
  const late=await page.evaluate(async()=>{
    globalThis.media.stop({key:'tv'});
    const transport={...globalThis.snapshot,sourceId:'late',revision:1,state:'playing',anchorServerMs:performance.now(),positionMs:1000};
    globalThis.snapshot=transport;
    await globalThis.media.play({key:'late',name:'shared-tone.wav?late=1',url:location.origin+'/',type:'music',transport});
    const playback=globalThis.media.sounds.late.playbacks[0];
    return {cursor:playback.currentTime,errorMs:Math.abs(playback.currentTime*1000-(1000+performance.now()-transport.anchorServerMs))};
  });
  expect(late.cursor).toBeGreaterThan(2);expect(late.errorMs).toBeLessThan(250);
  const cancelled=await page.evaluate(async()=>{
    globalThis.media.stop({key:'late'});
    const transport={...globalThis.snapshot,sourceId:'future',revision:1,anchorServerMs:performance.now()+1000,positionMs:0};
    globalThis.snapshot=transport;
    await globalThis.media.play({key:'future',name:'shared-tone.wav',url:location.origin+'/',type:'sound',transport});
    const playback=globalThis.media.sounds.future.playbacks[0],context=globalThis.media.cacophony.context;
    const analyser=context.createAnalyser();analyser.fftSize=512;playback.outputNode.connect(analyser);
    const samples=new Float32Array(512);analyser.getFloatTimeDomainData(samples);
    const before=Math.max(...samples.map(Math.abs));globalThis.media.stop({key:'future'});
    await new Promise(resolve=>setTimeout(resolve,1100));analyser.getFloatTimeDomainData(samples);
    const after=Math.max(...samples.map(Math.abs));analyser.disconnect();
    const active=Object.keys(globalThis.media.sounds).length;globalThis.media.shutdown();globalThis.clock.shutdown();
    return {before,after,active};
  });
  expect(cancelled).toEqual({before:0,after:0,active:0});
});
