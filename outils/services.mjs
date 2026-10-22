import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,open,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {root,dataDir,json,save,sourceHash,workspace,copySource,update,state,stamp} from './stockage.mjs';
import {freePort,runNode,runNpm} from './processus.mjs';
const serviceFile=name=>join(dataDir,'services',name+'.json');
export async function status(name){const s=await json(serviceFile(name));if(!s?.health)return null;try{const r=await fetch(s.health,{headers:{Authorization:'Bearer '+s.token},signal:AbortSignal.timeout(1500)});const body=await r.json();return body.pid===s.pid&&body.token===s.token?body:null;}catch{return null;}}
export async function stop(name){const s=await status(name);if(!s)return;await fetch(s.health+'/arreter',{method:'POST',headers:{Authorization:'Bearer '+s.token}});for(let n=0;n<60;n++){if(!await status(name))return;await new Promise(r=>setTimeout(r,100));}throw Error('Le serveur termine son arrêt. Réessayez dans un instant.');}
export async function start(name,work,preferred,dev){
 const existing=await status(name);if(existing?.ready&&existing.work===work&&existing.dev===dev)return existing;
 if(existing)await stop(name);
 const port=await freePort(preferred),token=randomUUID(),stateFile=serviceFile(name);await mkdir(join(dataDir,'services'),{recursive:true});
 const config={root,work,port,dev,token,stateFile,url:`http://127.0.0.1:${port}`};const configPath=join(dataDir,'services',name+'-configuration.json');await save(configPath,config);
 const log=await open(join(dataDir,'services',name+'.log'),'a');const child=spawn(process.execPath,[join(root,'outils/serveur.mjs'),configPath],{cwd:root,detached:true,stdio:['ignore',log.fd,log.fd],windowsHide:true});let failure;child.on('error',e=>failure=e);child.unref();await log.close();
 for(let n=0;n<240;n++){if(failure)throw failure;const s=await status(name);if(s?.error)throw Error('Le site ne démarre pas. Vous pouvez revenir à votre sauvegarde. Détail : '+s.error);if(s?.ready)return s;await new Promise(r=>setTimeout(r,250));}
 throw Error('Le démarrage prend trop de temps. Consultez .atelier/services/'+name+'.log.');
}
export async function assets(dir){await runNode(['outils/illustrations.mjs'],{env:{ESCALE_ASSETS:join(dir,'public/images')}});}
export async function launchMission(id,production=false){
 const dir=workspace(id);if(!existsSync(dir)){await copySource(join(root,'modele'),dir);await update(id,{session:stamp(),step:0});}
 if(!existsSync(join(dir,'public/images/hero.webp')))await assets(dir);
 const previous=await status('boutique');if(previous&&previous.work!==dir)await stop('boutique');
 if(production){await stop('boutique');await runNode(['node_modules/next/dist/bin/next','build',dir],{env:{ATELIER_ROOT:root}});}
 return start('boutique',dir,4211,!production);
}
export async function prepare(){
 const [major,minor]=process.versions.node.split('.').map(Number);if(major<22||(major===22&&minor<12))throw Error('Installez Node.js 24 LTS, puis relancez.');
 await mkdir(dataDir,{recursive:true});const {createHash}=await import('node:crypto');const fingerprint=createHash('sha256').update(await readFile(join(root,'package-lock.json'))).digest('hex');
 const installFile=join(root,'.atelier/installation.txt'),buildFile=join(root,'.atelier/compilation.txt');
 let installed='';try{installed=await readFile(installFile,'utf8');}catch{}
 if(installed!==fingerprint||!existsSync(join(root,'node_modules/playwright/cli.js'))){console.log('1/3 · Je prépare les outils. Le premier lancement peut prendre quelques minutes.');await runNpm(['ci']);await writeFile(installFile,fingerprint);}
 const {chromium}=await import('playwright');if(!existsSync(chromium.executablePath()))await runNode(['node_modules/playwright/cli.js','install','chromium']);
 try{const browser=await chromium.launch();await browser.close();}catch{throw Error('Le navigateur de test ne démarre pas. Sous Linux : node atelier.mjs dependances-linux.');}
 const wanted=await sourceHash(join(root,'app'))+await sourceHash(join(root,'components'))+await sourceHash(join(root,'lib'))+await sourceHash(join(root,'outils'))+fingerprint;
 let built='';try{built=await readFile(buildFile,'utf8');}catch{}
 if(built!==wanted||!existsSync(join(root,'.next/BUILD_ID'))){await stop('atelier');console.log('2/3 · Je prépare votre espace d’apprentissage.');await runNpm(['run','build']);await writeFile(buildFile,wanted);}
 await configureMcp();console.log('3/3 · Atelier prêt.');
}
export async function configureMcp(){
 const command=process.execPath,bridge=join(root,'outils/mcp.mjs');
 const mcpServers={chrome:{command,args:[bridge,'chrome']},playwright:{command,args:[bridge,'playwright']}};
 await save(join(root,'.mcp.json'),{mcpServers});await mkdir(join(root,'.codex'),{recursive:true});
 const quote=s=>JSON.stringify(s);await writeFile(join(root,'.codex/config.toml'),Object.entries(mcpServers).map(([key,v])=>`[mcp_servers.${key}]\ncommand = ${quote(v.command)}\nargs = [${v.args.map(quote).join(', ')}]\n`).join('\n'));
}
