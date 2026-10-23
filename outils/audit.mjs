import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {missionId,dataDir,workspace,state,update,save,json,stamp,sourceHash,lock} from './stockage.mjs';
import {launchMission,status} from './services.mjs';
import {freePort} from './processus.mjs';
export async function audit(value,phase='constat',jobId=null){
 const id=missionId(value);if(id===4)throw Error('La mission comportement reste théorique.');
 if(!['constat','verification'].includes(phase))throw Error('Phase inconnue.');
 const jobFile=join(dataDir,'tache.json');
 try{return await lock('boutique',async()=>{
  const service=await launchMission(id,id===6),url=service.url;
  const s=await state();await update(id,{url,directory:workspace(id),session:s.missions[id]?.session||stamp()});
  const run=phase+'-'+stamp(),dir=join(dataDir,'resultats','bloc-'+id,run),web=`/preuves/bloc-${id}/${run}/`;await mkdir(dir,{recursive:true});
  const report={mission:id,phase,url,date:new Date().toISOString(),sourceHash:await sourceHash(workspace(id)),checks:[],images:[],links:[],metrics:null,passed:false};
  const check=(name,met,detail)=>report.checks.push({name,met:Boolean(met),detail});
  const browser=await chromium.launch();
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'}),page=await context.newPage();
   await page.goto(url);await page.evaluate(()=>{localStorage.setItem('escale-demo-v1',JSON.stringify({cart:[{id:'sac-weekend',qty:1}],profile:null}));sessionStorage.removeItem('escale-order');});
   async function go(path){const response=await page.goto(url+path);if(response&&!response.ok())throw Error('La page ne charge pas. Demandez à l’agent de vérifier la compilation, ou revenez à une sauvegarde.');await page.evaluate(()=>document.fonts.ready);}
   async function shot(name,title){await page.screenshot({path:join(dir,name+'.png'),scale:'device'});report.images.push({url:web+name+'.png',title});}
   await context.tracing.start({screenshots:true,snapshots:true});
   if(id===1){
    await go('/#collection');await page.locator('.card-copy').first().waitFor();const pads=await page.locator('.card-copy').evaluateAll(els=>els.slice(0,3).map(e=>getComputedStyle(e).padding));
    check('Les cartes comparables ont les mêmes marges intérieures',pads.length===3&&new Set(pads).size===1&&parseFloat(pads[0])>0,'Valeurs lues : '+pads.join(' / '));
    await page.locator('#collection').scrollIntoViewIfNeeded();await shot('cartes','Espacements des cartes');
    const styles=[];for(const p of ['/','/produits/sac-weekend','/panier']){await go(p);if(p.includes('produits'))await page.waitForSelector('.detail-title');const b=page.locator('[data-role="ajout-panier"]').first();await b.waitFor();styles.push(await b.evaluate(e=>{const s=getComputedStyle(e);return {padding:s.padding,radius:s.borderRadius,color:s.backgroundColor};}));}
    check('Les boutons de même rôle partagent leurs styles',new Set(styles.map(v=>JSON.stringify(v))).size===1,JSON.stringify(styles));
   }
   if(id===2){
    await go('/commande');const values={name:'Camille Démo',email:'camille@example.test',address:'Rue de la Démo 12',postal:'20',city:'Neuchâtel',phone:'079 123 45 67'};
    for(const [key,value]of Object.entries(values))await page.locator('#'+key).fill(value);
    await page.getByRole('button',{name:/Confirmer la commande fictive/}).click();
    const remaining={};for(const key of Object.keys(values))remaining[key]=await page.locator('#'+key).inputValue();
    check('Les six champs restent remplis après le NPA invalide',Object.entries(values).every(([key,v])=>remaining[key]===v),'Valeurs après soumission : '+JSON.stringify(remaining));
    check('L’erreur explique le code postal à corriger',await page.locator('#postal-error').count()===1,await page.locator('#postal-error').textContent().catch(()=>''));
    await shot('formulaire','Formulaire après une erreur de code postal');
   }
   if(id===3){
    await go('/produits/sac-weekend');await page.waitForSelector('.detail-title');const scan=await new AxeBuilder({page}).analyze();await writeFile(join(dir,'axe.json'),JSON.stringify(scan,null,2));report.links.push({url:web+'axe.json',title:'Véritable rapport axe-core'});
    check('Les images ont un texte alternatif',!scan.violations.some(v=>v.id==='image-alt'),'Contrôle axe-core image-alt sur cette page.');
    check('Le cœur possède un nom accessible',!scan.violations.some(v=>v.id==='button-name'),'Contrôle axe-core button-name sur cette page.');
    check('Le contraste du texte ne déclenche plus de violation',!scan.violations.some(v=>v.id==='color-contrast'),'Contrôle automatique du contraste sur cette page ; aucun certificat global.');await shot('produit','Le cœur et le prix');
    await go('/confirmation');const trigger=page.getByRole('button',{name:'Annuler cette commande',exact:true});await trigger.focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog');await dialog.waitFor();
    check('Le focus entre dans la fenêtre',await dialog.locator(':focus').count()>0,'Position du focus immédiatement après ouverture.');
    let contained=true;for(const key of ['Tab','Tab','Shift+Tab']){await page.keyboard.press(key);contained=contained&&await dialog.locator(':focus').count()>0;}
    check('Tab et Maj+Tab restent dans la fenêtre',contained,'Trois déplacements testés.');await shot('clavier','Position du focus après les déplacements');
    await page.keyboard.press('Escape');const closed=await page.getByRole('dialog').count()===0;
    check('Échap ferme la fenêtre et rend le focus au bouton',closed&&await trigger.evaluate(e=>document.activeElement===e),'Fermeture et retour au déclencheur.');
   }
   if(id===5){
    await go('/confirmation');const trigger=page.getByRole('button',{name:'Annuler cette commande',exact:true});await trigger.click();let dialog=page.getByRole('dialog');const texts=await dialog.locator('button').allTextContents(),title=await dialog.locator('h2').innerText();
    const safeIndex=texts.findIndex(t=>/garder|conserver/i.test(t)),cancelIndex=texts.findIndex(t=>/annuler/i.test(t));
    check('Les deux boutons annoncent une action explicite',safeIndex>=0&&cancelIndex>=0&&safeIndex!==cancelIndex,'Libellés : '+texts.join(' / '));
    check('La question ne contient plus la double négation initiale',!/ne pas vouloir/i.test(title),'Titre : '+title);await shot('libelles','Question et boutons dans leur contexte');
    await dialog.locator('button').nth(safeIndex>=0?safeIndex:0).click();const kept=await page.getByRole('dialog').count()===0&&await page.getByRole('heading',{name:/Commande fictive annulée/}).count()===0;
    await trigger.click();dialog=page.getByRole('dialog');await dialog.locator('button').nth(cancelIndex>=0?cancelIndex:1).click();
    check('Garder et Annuler produisent les deux résultats attendus',kept&&await page.getByRole('heading',{name:/Commande fictive annulée/}).count()===1,'La compréhension des personnes reste à discuter ; le script vérifie les textes et les actions.');
   }
   if(id===6){
    await go('/produits/sac-weekend');await page.waitForSelector('.detail-title');const src=await page.locator('.detail-photo img').getAttribute('src');const imageUrl=new URL(src,url);if(imageUrl.origin!==url)throw Error('Ce contrôle attend une image locale à la boutique.');const image=await page.request.get(imageUrl.href);const bytes=(await image.body()).length,headers=image.headers();
    check('L’image produit est adaptée au web',bytes<250000&&/webp|avif|jpeg/.test(headers['content-type']||''),`${bytes} octets · ${headers['content-type']}`);
    check('La ressource autorise un cache explicite',/max-age=[1-9]/.test(headers['cache-control']||''),'Cache-Control : '+headers['cache-control']);
    const response=page.waitForResponse(r=>r.url().includes('/api/produit'));const started=performance.now();await page.getByRole('button',{name:'↻ Rejouer le chargement'}).click();await page.locator('.waiting').waitFor();
    check('Un retour de chargement accessible est présent',await page.locator('.waiting [role="status"]').count()>0,'Présence d’un statut dans la zone d’attente.');await shot('attente','Retour visuel pendant le chargement');await response;await page.waitForSelector('.detail-title');report.productDurationMs=performance.now()-started;
   }
   await context.tracing.stop({path:join(dir,'trace.zip')});report.links.push({url:web+'trace.zip',title:'Trace Playwright du parcours'});await context.close();
  }finally{await browser.close();}
  if(id===6){
   const port=await freePort(4239),b=await chromium.launch({args:[`--remote-debugging-port=${port}`]});
   try{const result=await lighthouse(url+'/produits/sac-weekend',{port,output:['html','json'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices']});if(!result||result.lhr.runtimeError)throw Error(result?.lhr.runtimeError?.message||'Lighthouse indisponible');
    await writeFile(join(dir,'lighthouse.html'),result.report[0]);await writeFile(join(dir,'lighthouse.json'),result.report[1]);report.links.push({url:web+'lighthouse.html',title:'Véritable rapport Lighthouse'},{url:web+'lighthouse.json',title:'Mesures Lighthouse en JSON'});
    const l=result.lhr;report.metrics={score:Math.round(l.categories.performance.score*100),lcpMs:l.audits['largest-contentful-paint'].numericValue,version:l.lighthouseVersion,config:l.configSettings};
   }finally{await b.close();}
  }
  report.passed=report.checks.length>0&&report.checks.every(c=>c.met);await save(join(dir,'rapport.json'),report);
  const current=(await state()).missions[id]||{},key=phase==='constat'?'lastAudit':'lastVerification',history=[...(current.history||[]),...(current[key]?[{title:phase==='constat'?'Ancien constat':'Ancienne vérification',report:current[key]}]:[])].slice(-20);
  await update(id,phase==='constat'?{lastAudit:report,history}:{lastVerification:report,history,completed:false});
  if(jobId){const j=await json(jobFile,{});await save(jobFile,{...j,status:'termine',message:report.passed?'Les contrôles de cette mission sont satisfaits.':'Les preuves sont prêtes. Certains points restent à corriger.',finished:Date.now()});}
  console.log(JSON.stringify({mission:id,phase,passed:report.passed,checks:report.checks,rapport:dir},null,2));return report;
 });}catch(error){if(jobId){const j=await json(jobFile,{});await save(jobFile,{...j,status:'erreur',message:'Le contrôle n’a pas pu se terminer. Vos fichiers sont conservés. Détail : '+error.message,finished:Date.now()});}throw error;}
}
if(process.argv[1]===fileURLToPath(import.meta.url))audit(Number(process.argv[2]),process.argv[3],process.argv[4]).catch(e=>{console.error(e);process.exitCode=1;});
