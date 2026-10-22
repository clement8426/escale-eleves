// Vérifie le parcours débutant et les défauts, sans fournir de solution dans le dépôt élève.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {prepare,start,stop,status} from '../outils/services.mjs';
import {root,state,workspace,json,dataDir} from '../outils/stockage.mjs';
import {openMission,rollback} from '../outils/atelier.mjs';
import {audit} from '../outils/audit.mjs';
await prepare();const portal=await start('atelier',root,4210,false);
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();
 await page.goto(portal.url);
 for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 const scan=await new AxeBuilder({page}).analyze();assert.deepEqual(scan.violations.map(v=>v.id),[],'L’accueil pédagogique doit être accessible');
 await page.getByRole('button',{name:'Je commence par le formulaire →'}).click();await page.locator('iframe').waitFor({timeout:90000});
 const frame=page.frameLocator('iframe');await frame.locator('#name').waitFor({timeout:90000});
 await frame.locator('#name').fill('Camille Démo');await frame.locator('#postal').fill('20');await frame.getByRole('button',{name:/Confirmer la commande fictive/}).click();assert.equal(await frame.locator('#name').inputValue(),'');
 await page.getByRole('button',{name:'J’ai essayé →'}).click();await page.locator('#observation').fill('Les informations disparaissent après mon erreur.');await page.getByRole('button',{name:'Un petit indice',exact:true}).click();assert.ok(await page.getByText('Saisissez Camille Démo comme nom avant de confirmer.').isVisible());
 await page.getByRole('button',{name:'Choisir mon outil →'}).click();await page.getByRole('button',{name:'Vérifier automatiquement mes observations'}).click();
 for(let n=0;n<300;n++){const job=await json(join(dataDir,'tache.json'));if(job?.status==='erreur')throw Error(job.message);if(job?.status==='termine')break;await new Promise(r=>setTimeout(r,200));if(n===299)throw Error('Contrôle trop long');}
 await page.getByText('Mon constat',{exact:true}).waitFor();assert.equal((await state()).missions[2].lastAudit.passed,false);
 await page.getByRole('button',{name:'Préparer une demande pour mon agent'}).click();assert.match(await page.getByRole('textbox',{name:'Consigne pour mon agent'}).inputValue(),/Ne corrige rien/);await page.getByRole('button',{name:'Fermer',exact:true}).click();
 await page.getByRole('button',{name:'Passer à la correction →'}).click();await page.getByRole('button',{name:'Préparer ma correction avec l’agent'}).click();assert.match(await page.getByRole('textbox',{name:'Consigne pour mon agent'}).inputValue(),/travail/);await page.getByRole('button',{name:'Fermer',exact:true}).click();
 await writeFile(join(workspace(2),'MON-ESSAI.txt'),'Mon nouvel essai doit être conservé.');
 // Une erreur de compilation dans la copie ne doit pas casser l’atelier ni le retour arrière.
 await writeFile(join(workspace(2),'app/page.tsx'),'export const = ceci ne compile pas');
 await page.getByRole('button',{name:'Revenir à ma sauvegarde'}).click();
 const restored=page.waitForResponse(r=>r.url().endsWith('/api/atelier')&&r.request().method()==='POST'&&r.request().postDataJSON()?.action==='restaurer');
 await page.getByRole('button',{name:'Oui, je veux réessayer'}).click();const response=await restored;assert.ok(response.ok(),await response.text());
 await page.getByRole('heading',{name:'J’essaie',exact:true}).waitFor({timeout:90000});
 await assert.rejects(access(join(workspace(2),'MON-ESSAI.txt')));assert.equal((await state()).missions[2].lastAudit,null);
 await page.getByRole('button',{name:'Escale / atelier UX, accueil'}).click();
 await page.screenshot({path:join(dataDir,'accueil-verifie.png'),fullPage:true});
 const foreign=await page.request.post(portal.url+'/api/atelier',{headers:{Origin:'https://exemple-inconnu.test'},data:{action:'recommencer',id:2}});assert.equal(foreign.status(),403);
 await context.close();
 for(const id of [1,3,5,6]){await openMission(id);const report=await audit(id);assert.equal(report.passed,false,'Le modèle initial doit conserver les défauts du bloc '+id);assert.ok(report.checks.some(c=>!c.met));for(const image of report.images){const r=await fetch(portal.url+image.url);assert.ok(r.ok);}if(id===6){assert.ok(report.metrics?.version);const r=await fetch(portal.url+report.links.find(l=>l.title==='Véritable rapport Lighthouse').url);assert.equal(r.status,200);}}
 console.log('OK : parcours débutant, indices, prompts, vrai contrôle, sauvegarde, code cassé restauré, autres blocs et Lighthouse réels.');
}finally{await browser.close();await stop('boutique');await stop('atelier');}
