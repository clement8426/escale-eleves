import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {missionId,inside} from '../outils/stockage.mjs';
import {missions,promptFor} from '../lib/missions.mjs';
test('les missions et chemins empêchent une restauration hors de l’exercice',()=>{
 for(const v of [0,7,-1,'../../autre',1.5])assert.throws(()=>missionId(v));
 assert.throws(()=>inside(resolve('travail'),resolve('ailleurs')));
 assert.throws(()=>inside(resolve('travail'),resolve('travail')));
 assert.equal(missionId('2'),2);
});
test('chaque consigne distingue observation et correction et le comportement reste théorique',()=>{
 assert.equal(missions.length,6);
 assert.match(promptFor(2,'observation'),/Ne corrige rien/);
 assert.match(promptFor(2,'correction'),/sauvegarder 2/);
 assert.match(promptFor(4,'observation'),/Aucune donnée de visiteurs/);
});
test('restaurer garde l’essai courant, enlève ses nouveaux fichiers et invalide les anciens résultats',async()=>{
 const fixture=resolve('.atelier/tests/'+randomUUID());await mkdir(join(fixture,'modele/app'),{recursive:true});await mkdir(join(fixture,'travail/bloc-2/app'),{recursive:true});await writeFile(join(fixture,'modele/app/page.tsx'),'initial');await writeFile(join(fixture,'travail/bloc-2/app/page.tsx'),'initial');
 const script=`import {checkpoint,restore,update,state,workspace} from ${JSON.stringify(new URL('../outils/stockage.mjs',import.meta.url).href)};import {writeFile,readFile,access} from 'node:fs/promises';import {join} from 'node:path';import assert from 'node:assert/strict';await checkpoint(2);await writeFile(join(workspace(2),'app/page.tsx'),'essai');await writeFile(join(workspace(2),'nouveau.txt'),'à conserver');await update(2,{lastVerification:{passed:true,phase:'verification',date:new Date().toISOString()},completed:true});const result=await restore(2);assert.equal(await readFile(join(workspace(2),'app/page.tsx'),'utf8'),'initial');await assert.rejects(access(join(workspace(2),'nouveau.txt')));assert.equal(await readFile(join(result.preserved,'nouveau.txt'),'utf8'),'à conserver');const p=(await state()).missions[2];assert.equal(p.lastVerification,null);assert.equal(p.completed,false);assert.equal(p.history.length,1);`;
 const child=spawnSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,ATELIER_ROOT:fixture},encoding:'utf8'});assert.equal(child.status,0,child.stderr);
});
