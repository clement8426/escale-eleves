import {spawn} from 'node:child_process';
import {existsSync,realpathSync} from 'node:fs';
import {join,dirname,delimiter} from 'node:path';
import {createServer} from 'node:net';
import {root} from './stockage.mjs';
export function npmCli() {
  const candidates = [process.env.npm_execpath, join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js')].filter(Boolean);
  for (const directory of (process.env.PATH||'').split(delimiter)) {
    const name = join(directory,process.platform === 'win32'?'npm.cmd':'npm');
    if (existsSync(name)) { const real=realpathSync(name); candidates.push(real.endsWith('.js')?real:join(dirname(real),'node_modules/npm/bin/npm-cli.js')); }
  }
  const found = candidates.find(p=>existsSync(p)&&p.endsWith('.js'));
  if (!found) throw Error('npm est introuvable. Installez Node.js 24 LTS avec npm, puis relancez.');
  return found;
}
export function runNode(args,{env={},capture=false,expected=[0]}={}) {
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},stdio:capture?['ignore','pipe','pipe']:'inherit',windowsHide:true});
    let stdout='',stderr='';
    if(capture){child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);}
    const interrupt=()=>child.kill('SIGTERM'); process.once('SIGINT',interrupt);
    child.once('error',error=>{process.removeListener('SIGINT',interrupt);reject(error);});
    child.once('exit',(code,signal)=>{process.removeListener('SIGINT',interrupt);if(expected.includes(code))resolve({code,stdout,stderr});else reject(Error(`Commande interrompue ou échouée (${signal||code}) : node ${args.join(' ')}\n${stderr.slice(-2500)}`));});
  });
}
export const runNpm = args => runNode([npmCli(),...args]);
export function freePort(preferred=4201) {
  return new Promise((resolve,reject)=>{
    const server=createServer();
    server.once('error',e=>e.code==='EADDRINUSE'?freePort(preferred+1).then(resolve,reject):reject(e));
    server.listen(preferred,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port));});
  });
}
