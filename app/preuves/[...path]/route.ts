import {readFile,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {dataDir} from '../../../outils/stockage.mjs';
export const dynamic='force-dynamic';
const types:Record<string,string>={'.json':'application/json','.png':'image/png','.zip':'application/zip','.html':'text/html; charset=utf-8'};
export async function GET(_request:Request,{params}:{params:Promise<{path:string[]}>}){
 const base=resolve(dataDir,'resultats'),{path}=await params;let file=resolve(base,...path);
 if(!file.startsWith(base+sep))return new Response('Accès refusé',{status:403});
 try{file=await realpath(file);if(!file.startsWith(base+sep))return new Response('Accès refusé',{status:403});return new Response(new Uint8Array(await readFile(file)),{headers:{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Cette preuve n’est pas encore disponible.',{status:404});}
}
