#!/usr/bin/env node
import {root} from './outils/stockage.mjs';
import {prepare,start,stop} from './outils/services.mjs';
import {runNode} from './outils/processus.mjs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
const [command='demarrer',id]=process.argv.slice(2).filter(a=>a!=='--sans-ouvrir');
try{
 if(command==='aide'){console.log('node atelier.mjs : ouvrir l’atelier\nnode atelier.mjs scene 2 : ouvrir une mission\nnode atelier.mjs auditer 2 : observer sans corriger\nnode atelier.mjs sauvegarder 2 : garder mon essai\nnode atelier.mjs verifier 2 : contrôler mes modifications\nnode atelier.mjs restaurer 2 : retrouver ma sauvegarde\nnode atelier.mjs recommencer 2 : repartir du début de cette mission\nnode atelier.mjs arreter : arrêter les deux serveurs');}
 else if(command==='arreter'){await stop('boutique');await stop('atelier');console.log('Atelier arrêté. Vos essais sont conservés.');}
 else if(command==='dependances-linux'){if(process.platform!=='linux')throw Error('Cette commande est réservée à Linux.');await runNode(['node_modules/playwright/cli.js','install','--with-deps','chromium']);}
 else if(command==='demarrer'||command==='preparer'){
  await prepare();const s=await start('atelier',root,4210,false);console.log('\nVotre atelier : '+s.url+'\nPour arrêter : node atelier.mjs arreter');
  if(command==='demarrer'&&!process.argv.includes('--sans-ouvrir')&&!process.env.CI){const [exe,args]=process.platform==='win32'?['rundll32',['url.dll,FileProtocolHandler',s.url]]:process.platform==='darwin'?['open',[s.url]]:['xdg-open',[s.url]];const p=spawn(exe,args,{stdio:'ignore',detached:true,windowsHide:true});p.on('error',()=>{});p.unref();}
 }else{
  const {action,openMission}=await import('./outils/atelier.mjs');
  if(command==='scene'){const s=await openMission(id);console.log(s?.url||'Mission 4 : ouvrez la fiche de discussion dans l’atelier.');}
  else if(['auditer','verifier'].includes(command)){const {audit}=await import('./outils/audit.mjs');await audit(Number(id),command==='auditer'?'constat':'verification');}
  else if(['sauvegarder','restaurer','recommencer'].includes(command)){await action({action:command,id:Number(id)});console.log('Votre demande est terminée. Actualisez l’atelier.');}
  else throw Error('Commande inconnue. Pour les commandes : node atelier.mjs aide.');
 }
}catch(error){console.error('\n'+error.message);process.exitCode=1;}
