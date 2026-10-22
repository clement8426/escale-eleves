import {NextRequest} from 'next/server';
import {action,view} from '../../../outils/atelier.mjs';
import {status} from '../../../outils/services.mjs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await view(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'L’atelier prépare vos données. Réessayez dans un instant.'},{status:500});}}
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 const service=await status('atelier');
 const origins=service?[service.url,`http://localhost:${service.port}`]:[];
 const authenticated=service&&request.headers.get('authorization')===`Bearer ${service.token}`;
 if(!origins.includes(origin||'')&&!authenticated)return Response.json({error:'Cette action doit venir de votre atelier local.'},{status:403});
 try{const body=await request.json();return Response.json({ok:true,result:await action(body)});}catch(error){return Response.json({error:error instanceof Error?error.message:'La demande n’a pas pu se terminer.'},{status:400});}
}
