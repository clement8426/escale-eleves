import {join} from 'node:path';
import {existsSync} from 'node:fs';
import {readFile,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {root,dataDir,json,save,state,update,workspace,missionId,checkpoint,restore,stamp,lock} from './stockage.mjs';
import {launchMission,status,stop} from './services.mjs';
import {missions,promptFor} from '../lib/missions.mjs';
export async function openMission(value){
 const id=missionId(value);if(id===4){await update(id,{session:stamp(),step:0});return null;}
 return lock('boutique',async()=>{const service=await launchMission(id);const s=await state();await update(id,{url:service.url,directory:workspace(id),session:s.missions[id]?.session||stamp()});return {url:service.url,port:service.port};});
}
export async function rollback(id,reset){return lock('boutique',async()=>{const current=await status('boutique');if(current?.work===workspace(id))await stop('boutique');const result=await restore(id,reset);return result;});}
export async function queueAudit(value,phase){
 const id=missionId(value);if(id===4)throw Error('Cette mission est une discussion, sans audit de visiteurs.');
 const jobFile=join(dataDir,'tache.json'),previous=await json(jobFile);
 if(previous?.status==='en-cours'){
  let alive=false;try{process.kill(previous.pid,0);alive=true;}catch{}
  if(alive)throw Error('Un contrôle est déjà en cours. Attendez le résultat.');
 }
 const job={id:stamp(),mission:id,phase,status:'en-cours',message:id===6?'Préparation de la version de production, puis mesures réelles. Cela peut prendre quelques minutes.':'Le navigateur rejoue le parcours. Vous pouvez rester sur cette page.',started:Date.now()};
 await save(jobFile,job);
 const child=spawn(process.execPath,[join(root,'outils/audit.mjs'),String(id),phase,job.id],{cwd:root,detached:true,stdio:'ignore',windowsHide:true});child.on('error',async e=>save(jobFile,{...job,status:'erreur',message:e.message}));child.unref();job.pid=child.pid;await save(jobFile,job);return job;
}
export async function view(){
 const s=await state(),job=await json(join(dataDir,'tache.json')),service=await status('boutique');
 if(job?.status==='en-cours'&&Number.isInteger(job.pid)){let alive=false;try{process.kill(job.pid,0);alive=true;}catch{}if(!alive){job.status='erreur';job.message='Le contrôle a été interrompu. Vos fichiers sont conservés ; vous pouvez le relancer.';await save(join(dataDir,'tache.json'),job);}}
 const safeService=service?.ready?{url:service.url,work:service.work,mode:service.dev?'développement':'production'}:null;
 return {progress:s,job,service:safeService};
}
export async function action(body){
 const id=missionId(body.id);
 const job=await json(join(dataDir,'tache.json'));
 if(job?.status==='en-cours'&&!['progression','prompt'].includes(body.action)){
  let alive=false;try{process.kill(job.pid,0);alive=true;}catch{}
  if(alive)throw Error('Laissez le contrôle se terminer avant de changer ou restaurer la mission.');
 }
 if(body.action==='ouvrir')return openMission(id);
 if(body.action==='sauvegarder')return {name:await checkpoint(id)};
 if(body.action==='restaurer')return rollback(id,false);
 if(body.action==='recommencer')return rollback(id,true);
 if(body.action==='auditer'||body.action==='verifier')return queueAudit(id,body.action==='auditer'?'constat':'verification');
 if(body.action==='prompt'){
  const s=await state(),m=s.missions[id]||{};
  return {prompt:promptFor(id,body.phase,{url:m.url,directory:workspace(id)})};
 }
 if(body.action==='progression'){
  const patch={};for(const key of ['observation','reason','verification'])if(typeof body[key]==='string')patch[key]=body[key].slice(0,5000);
  if(Number.isInteger(body.step)&&body.step>=0&&body.step<=4)patch.step=body.step;
  if(body.completed===true){const s=await state(),m={...(s.missions[id]||{}),...patch};if([m.observation,m.reason,m.verification].some(x=>!x||x.trim().length<10))throw Error('Complétez vos trois phrases pour terminer.');if(id!==4&&!m.lastVerification?.passed)throw Error('Refaites le contrôle après correction avant de terminer.');patch.completed=true;}
  return update(id,patch);
 }
 throw Error('Action inconnue.');
}
