import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless:true });
const report = { browser:browser.version(),result:'FAIL',errors:[] };
try {
  const context = await browser.newContext({ acceptDownloads:true }); const page = await context.newPage();
  page.on('pageerror',e => report.errors.push(e.message));
  await page.goto('http://localhost:5206/?mode=host');
  const result = await page.evaluate(async () => {
    const { Phase1Hub } = await import('/src/fileSharing/testHarness.ts');
    const { SessionPool } = await import('/src/fileSharing/sessionPool.ts');
    const { OfferTable } = await import('/src/fileSharing/offers.ts');
    const { StorageOwner } = await import('/src/fileSharing/storage.ts');
    const { randomId } = await import('/src/fileSharing/protocol.ts');
    const { ICE_CONFIGURATION } = await import('/src/fileTransfer/createFileTransfers.ts');
    const pcs = [];
    const control = [];
    const createPC = () => { const pc = new RTCPeerConnection(ICE_CONFIGURATION); pcs.push(pc); return pc; };
    const until = async f => { const start = performance.now(); while (!f()) { if (performance.now()-start > 15000) throw new Error('Fixture deadline'); await new Promise(r => setTimeout(r,20)); } };
    const hub = new Phase1Hub(); const ports = [hub.peer('#101'),hub.peer('#102')];
    for (const p of ports) p.peer.send('Hello',{ req:randomId(),endpoint:randomId(),peer:1,files:1,data:1,features:['base'],maxReceiveSize:104857600 });
    await until(() => ports.every(p => p.ready));
    const clients = [];
    for (const port of ports) {
      const key = JSON.stringify(['fixture',randomId(),port.player]);
      const storage = new StorageOwner(key,1,true); await storage.ready;
      const changes = [];
      const table = new OfferTable({ self:port.ready,files:port.files,storage,live:() => true,change:s => changes.push(s),changed:()=>{} });
      const pool = new SessionPool(port.peer,port.ready,() => true,{ authorized:(p,o)=>table.authorized(p,o),control:(s,m)=>{ control.push({ player:port.player,op:m.op }); table.control(s,m); },channel:(s,c)=>table.channel(s,c),established:s=>table.established(s),lost:(s,r)=>table.lost(s,r) },createPC);
      table.attach(pool); clients.push({ port,storage,table,pool,changes,key });
    }
    const [a,b] = clients;
    try {
      const payload = new Uint8Array(3*16384+7); crypto.getRandomValues(payload);
      await a.table.send(new File([payload],'real-rtc.bin'),b.port.ready.self,104857600);
      await until(() => b.table.snapshots().length === 1); await b.table.accept(b.table.snapshots()[0].key);
      await until(() => a.table.snapshots()[0].state === 'complete' && b.table.snapshots()[0].state === 'complete');
      const receipt = (await b.storage.receipts())[0];
      const blob = await b.storage.readForExport(receipt.sender,receipt.offer);
      const actual = new Uint8Array(await blob.arrayBuffer());
      if (actual.length !== payload.length || !actual.every((x,i) => x === payload[i])) throw new Error('Payload differs');
      const details = b.table.details()[0]; if (details.outcome !== 'verified') throw new Error('Missing verified receipt');
      await b.table.save(details.key);
      if (b.table.details()[0].outcome !== 'browser-download') throw new Error('Missing browser handoff receipt');
      return { bytes:payload.length,transport:'real RTCPeerConnection',storage:'dedicated workers and native IndexedDB',receipt:'verified before explicit Save',export:'browser-download',sender:a.table.snapshots()[0].state,receiver:b.table.snapshots()[0].state };
    } catch(error) { throw new Error(JSON.stringify({ error:String(error),control,pcs:pcs.map(p => ({ connection:p.connectionState,ice:p.iceConnectionState,local:p.localDescription?.type,remote:p.remoteDescription?.type })),clients:clients.map(c => ({ snapshots:c.table.snapshots().map(s => ({ ...s,error:s.error?.message })),commands:c.port.peer.sent.map(m => ({ kind:m.kind,reason:m.data.reason })),fileCommands:c.port.files.sent.map(m => m.kind) })) })); }
    finally { for (const c of clients) { c.table.dispose(); c.pool.dispose(); await c.storage.close(); } }
  });
  report.check = result; report.result = 'PASS';
} catch(error) { report.failure = String(error); process.exitCode = 1; }
finally { await writeFile('reports/file-sharing-phase1-v2-fixture.json',JSON.stringify(report,null,2)); await browser.close(); console.log(JSON.stringify(report,null,2)); }
