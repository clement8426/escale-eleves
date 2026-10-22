// Le même pont Node fonctionne sans npx ni script spécifique à un système.
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {root} from './stockage.mjs';
import {chromium} from 'playwright';
const kind=process.argv[2],name=kind==='chrome'?'chrome-devtools-mcp':kind==='playwright'?'@playwright/mcp':null;
if(!name)throw Error('Serveur MCP inconnu.');
const dir=join(root,'node_modules',name),pkg=JSON.parse(await readFile(join(dir,'package.json'),'utf8'));
const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin[kind==='chrome'?'chrome-devtools-mcp':'playwright-mcp'];
const args=kind==='chrome'?['--headless','--isolated','--executablePath',chromium.executablePath(),'--no-usage-statistics']:['--headless','--isolated','--executable-path',chromium.executablePath()];
const child=spawn(process.execPath,[resolve(dir,bin),...args],{cwd:root,stdio:'inherit',windowsHide:true,env:{...process.env,CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS:'1'}});
child.on('error',e=>{console.error(e.message);process.exitCode=1;});child.on('exit',code=>process.exit(code||0));process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));
