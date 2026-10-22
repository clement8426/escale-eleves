// Le contrôle du serveur reste disponible même si l’élève casse le code de la boutique.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {save} from './stockage.mjs';
const config=JSON.parse(await readFile(process.argv[2],'utf8'));
process.chdir(config.work);process.env.ATELIER_ROOT=config.root;
let app,web,closing=false;
const state={...config,pid:process.pid,ready:false};
async function close(){if(closing)return;closing=true;web?.closeAllConnections();web?.close();await app?.close().catch(()=>{});health.close();setTimeout(()=>process.exit(0),100).unref();}
const health=createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');
 if(req.headers.authorization!==`Bearer ${config.token}`){res.writeHead(403).end('{}');return;}
 if(req.method==='POST'&&req.url==='/arreter'){res.end('{"ok":true}');await close();return;}
 res.end(JSON.stringify(state));
});
await new Promise(r=>health.listen(0,'127.0.0.1',r));state.health=`http://127.0.0.1:${health.address().port}`;await save(config.stateFile,state);
process.on('SIGTERM',close);process.on('SIGINT',close);
try{
 const {default:next}=await import('next');app=next({dev:config.dev,dir:config.work,hostname:'127.0.0.1',port:config.port});await app.prepare();
 const handler=app.getRequestHandler();web=createServer((req,res)=>handler(req,res));await new Promise((resolve,reject)=>{web.once('error',reject);web.listen(config.port,'127.0.0.1',resolve);});
 state.ready=true;await save(config.stateFile,state);
}catch(error){state.error=error.message;await save(config.stateFile,state);console.error(error);}
