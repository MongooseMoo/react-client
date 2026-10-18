import { chromium, expect } from '@playwright/test';
import { writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = process.env.FILE_TEST_ORIGIN || 'http://localhost:5206';
const reportPath = process.env.FILE_TEST_REPORT || 'reports/file-sharing-phase1-browser.json';
const report = { browser:'',identities:[],checks:[],errors:[],speech:'Not tested',v2Live:'Not tested; the production flag remains off' };
const browser = await chromium.launch({ headless:true }); report.browser = browser.version();
try {
  const contexts = await Promise.all([browser.newContext({ acceptDownloads:true }),browser.newContext({ acceptDownloads:true })]);
  const pages = await Promise.all(contexts.map(c => c.newPage()));
  for (const [i,p] of pages.entries()) {
    p.on('pageerror',e => report.errors.push({ page:i,error:e.message }));
    await p.goto(`${origin}/?username=guest&password=guest`);
    await p.waitForFunction(() => window.mudClient?.connected && window.mudClient?.gmcp?.sessionReady,{},{ timeout:30000 });
    // The sole identity evidence is THIS page's own response to look me.
    await p.evaluate(() => window.mudClient.sendCommand('look me'));
    await expect(p.locator('body')).toContainText(/\w+_Guest is carrying nothing/, { timeout:15000 });
    const own = (await p.locator('body').innerText()).match(/(\w+_Guest) is carrying nothing/)[1];
    const modules = await p.evaluate(() => window.mudClient.gmcp.handlers['Core.Supports'].advertisedModules());
    assert(modules.includes('Client.FileTransfer 1')); assert(!modules.includes('Client.Peer 1')); assert(!modules.includes('Client.Files 1'));
    report.identities.push({ page:i,own,label:own.replaceAll('_',' '),proof:`${own} is carrying nothing` });
  }
  assert.notEqual(report.identities[0].own,report.identities[1].own);
  for (const p of pages) await p.getByRole('tab',{ name:'Files',exact:true }).click();
  for (const direction of [[0,1],[1,0]]) {
    const [s,r] = direction; const sender = pages[s]; const receiver = pages[r]; const filename = `phase1-v1-${s}-to-${r}.txt`;
    const bytes = Buffer.from(`Phase 1 flag-off legacy direct-send acceptance ${s} to ${r}\n`);
    await sender.getByLabel('File to send',{ exact:true }).setInputFiles({ name:filename,mimeType:'text/plain',buffer:bytes });
    await sender.getByRole('combobox',{ name:'Recipient',exact:true }).fill(report.identities[r].label);
    await sender.getByRole('option').filter({ hasText:report.identities[r].label }).first().click();
    await sender.getByRole('button',{ name:'Send File',exact:true }).click();
    const accept = receiver.getByRole('button',{ name:`Accept ${filename} from ${report.identities[s].label}`,exact:true });
    await expect(accept).toBeVisible({ timeout:20000 });
    const download = receiver.waitForEvent('download',{ timeout:45000 }); await accept.click();
    const file = await download; assert.equal(file.suggestedFilename(),filename); assert.deepEqual(await readFile(await file.path()),bytes);
    await expect(sender.locator('.file-transfer-ui').getByText(`File sent successfully: ${filename}`,{ exact:true })).toBeVisible({ timeout:10000 });
    report.checks.push({ direction,filename,bytes:bytes.length,received:'exact bytes',sender:'complete' });
  }
  report.result = 'PASS';
} catch (error) { report.result = 'FAIL'; report.failure = String(error); process.exitCode = 1; }
finally { await writeFile(reportPath,JSON.stringify(report,null,2)); await browser.close(); console.log(JSON.stringify(report,null,2)); }
