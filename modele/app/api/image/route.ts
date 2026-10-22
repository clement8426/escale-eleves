import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
export const dynamic='force-dynamic';
export async function GET(){
 const bytes=await readFile(join(process.cwd(),'public/images/lourde.png'));
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/png','Content-Length':String(bytes.length),'Cache-Control':'no-store'}});
}
