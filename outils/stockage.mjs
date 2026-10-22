import {fileURLToPath} from 'node:url';
import {resolve,join,sep,relative} from 'node:path';
import {mkdir,readFile,writeFile,readdir,lstat,copyFile,rename,realpath} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
export const root=resolve(/* turbopackIgnore: true */ process.env.ATELIER_ROOT||process.cwd());
const testSession=process.env.ESCALE_TEST_SESSION;
if(testSession&&!/^[a-zA-Z0-9-]+$/.test(testSession))throw Error('Session de test invalide.');
export const dataDir=testSession?join(root,'.atelier','tests',testSession):join(root,'.atelier');
export const workRoot=testSession?join(dataDir,'travail'):join(root,'travail');
export function missionId(value){const id=Number(value);if(!Number.isInteger(id)||id<1||id>6)throw Error('Choisissez une mission entre 1 et 6.');return id;}
export const workspace=value=>join(workRoot,'bloc-'+missionId(value));
export const stamp=()=>new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,6);
export async function json(file,fallback=null){try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
export async function save(file,value){await mkdir(resolve(file,'..'),{recursive:true});const temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(value,null,2));await rename(temp,file);}
export async function state(){return json(join(dataDir,'progression.json'),{missions:{},active:null});}
export async function update(id,patch){const s=await state();s.missions[id]={...(s.missions[id]||{}),...patch};s.active=id;await save(join(dataDir,'progression.json'),s);return s;}
export function inside(base,path){const b=resolve(base),p=resolve(path);if(!p.startsWith(b+sep))throw Error('Chemin extérieur à l’espace de travail.');return p;}
const generated=p=>p==='node_modules'||p.startsWith('node_modules/')||p==='.next'||p.startsWith('.next/')||p==='.git'||p.startsWith('.git/')||p==='public/images/lourde.png'||p==='public/images/hero.webp'||p.startsWith('public/images/produits/')||p==='next-env.d.ts'||p.endsWith('.tsbuildinfo');
export async function files(base,excludeGenerated=true){
 const found=[];
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name),r=relative(base,p).split(sep).join('/');if(excludeGenerated&&generated(r))continue;if(e.isSymbolicLink())throw Error('Un lien symbolique empêche la sauvegarde : '+r);if(e.isDirectory())await walk(p);else if(e.isFile())found.push(r);}}
 await walk(base);return found.sort();
}
export async function copySource(source,target){await mkdir(target,{recursive:true});for(const name of await files(source)){const to=inside(target,join(target,name));await mkdir(resolve(to,'..'),{recursive:true});await copyFile(join(source,name),to);}}
export async function checkpoint(id,label='Avant mon essai'){
 id=missionId(id);const dir=workspace(id),name=stamp(),target=join(dataDir,'sauvegardes','bloc-'+id,name);
 await copySource(dir,join(target,'code'));await save(join(target,'info.json'),{id,name,label,date:new Date().toISOString()});await update(id,{checkpoint:name});return name;
}
export async function archiveWorkspace(id){
 const work=inside(workRoot,workspace(id));
 const canonical=await realpath(work);if(canonical!==resolve(work))throw Error('L’espace de travail doit être un vrai dossier, sans redirection.');
 const destination=inside(join(dataDir,'essais-conserves'),join(dataDir,'essais-conserves','bloc-'+id+'-'+stamp()));
 await mkdir(resolve(destination,'..'),{recursive:true});await rename(work,destination);return destination;
}
export async function restore(id,reset=false){
 id=missionId(id);const s=await state(),name=s.missions[id]?.checkpoint;
 if(!reset&&!name)throw Error('Créez d’abord une sauvegarde.');
 const source=reset?join(root,'modele'):inside(join(dataDir,'sauvegardes','bloc-'+id),join(dataDir,'sauvegardes','bloc-'+id,name,'code'));
 await files(source); // Vérifier la sauvegarde avant de déplacer l’essai courant.
 const preserved=await archiveWorkspace(id);await copySource(source,workspace(id));
 const old=s.missions[id]||{},history=[...(old.history||[]),...[old.lastAudit,old.lastVerification].filter(Boolean).map(report=>({title:report.phase==='constat'?'Ancien constat':'Ancienne vérification',report}))].slice(-20);
 await update(id,{session:stamp(),step:0,completed:false,lastAudit:null,lastVerification:null,checkpoint:reset?null:name,history,restoredFrom:reset?'départ':name,observation:'',reason:'',verification:''});
 return {preserved};
}
export async function sourceHash(dir){const hash=createHash('sha256');for(const name of await files(dir))hash.update(name).update(await readFile(join(dir,name)));return hash.digest('hex');}
export async function lock(name,fn){
 if(!/^[a-z]+$/.test(name))throw Error('Nom de verrou invalide.');
 await mkdir(dataDir,{recursive:true});const path=join(dataDir,name+'.verrou');
 try{await mkdir(path);}catch(e){
  if(e.code!=='EEXIST')throw e;
  const owner=await json(join(path,'proprietaire.json'));let alive=false;try{if(owner?.pid){process.kill(owner.pid,0);alive=true;}}catch{}
  if(alive)throw Error('Une opération est déjà en cours. Attendez sa fin puis réessayez.');
  const {unlink,rmdir}=await import('node:fs/promises');try{await unlink(join(path,'proprietaire.json'));}catch(e){if(e.code!=='ENOENT')throw e;}await rmdir(path);await mkdir(path);
 }
 await save(join(path,'proprietaire.json'),{pid:process.pid});
 try{return await fn();}finally{const {rmdir,unlink}=await import('node:fs/promises');await unlink(join(path,'proprietaire.json'));await rmdir(path);}
}
