import sharp from 'sharp';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { products } from '../modele/lib/catalogue.mjs';
const root = process.env.ESCALE_ASSETS;
if(!root) throw Error('Dossier de génération absent');
await mkdir(`${root}/produits`, { recursive: true });
const photo = await readFile(`${root}/source/hero.png`);
await sharp(photo).resize(1200, 800, { fit: 'cover' }).webp({ quality: 76 }).toFile(`${root}/hero.webp`);
try {
    await access(`${root}/lourde.png`);
}
catch {
    await sharp(photo).resize(2400, 1600, { fit: 'cover' }).removeAlpha().png({ compressionLevel: 0, adaptiveFiltering: false }).toFile(`${root}/lourde.png`);
}
function item(shape) {
    switch (shape) {
        case 'bag': return `<path d="M115 171q-12-18-8-31l18-7 35 53" fill="#9e7855"/><path d="m343 157 41-23 9 18-40 32" fill="#a5805e"/><path d="M124 171Q114 159 142 142h212q19 9 22 34l17 137q-18 29-43 30H135q-29-7-29-27Z" fill="url(#cloth)"/><path d="M125 172h244l-4-19H142Z" fill="#e1d3ba"/><path d="m170 155 1-52q5-26 31-28h98q26 3 28 27l2 55" fill="none" stroke="#9c7454" stroke-width="17"/><path d="m171 155 1-50q4-24 29-24h99q21 2 21 23l2 50" fill="none" stroke="#bd9771" stroke-width="5"/><path d="M164 157h17v173h-17zm155 0h16v173h-16z" fill="#997350"/><path d="M213 208h70v72h-70z" fill="none" stroke="#d0d0b6" stroke-opacity=".45"/><path d="M130 180q-11 78-9 126m251-126 8 130" fill="none" stroke="#29382c" stroke-opacity=".25" stroke-width="5"/><path d="M198 161h103" stroke="#76583f" stroke-width="3"/>`;
        case 'backpack': return `<path d="M224 107v-9q0-16 25-16t25 16v9" fill="none" stroke="#876847" stroke-width="12"/><rect x="165" y="104" width="170" height="241" rx="40" fill="url(#cloth)"/><rect x="186" y="227" width="128" height="88" rx="15" fill="var(--c)" stroke="#504b3c" stroke-opacity=".3"/><path d="M184 163q65-23 132 0" fill="none" stroke="#d8c7a8" stroke-width="3"/><path d="M193 242h114" stroke="#b4a17e" stroke-width="3"/><path d="M161 146q-19 62-13 151m190-151q16 70 13 151" fill="none" stroke="#97835e" stroke-width="12"/>`;
        case 'tote': return `<path d="M162 154h176l-10 184q-76 22-157 0z" fill="url(#cloth)"/><path d="M196 168v-65q0-28 27-28h54q27 0 27 28v65" stroke="#aa9170" stroke-width="13" fill="none"/><path d="M180 174v146m138-146-7 147" stroke="#e9e0c9" stroke-opacity=".4" stroke-width="3"/><path d="M226 219h48v41h-48z" stroke="#f5edd9" stroke-opacity=".65" fill="none"/>`;
        case 'bottle': return `<rect x="226" y="68" width="48" height="35" rx="8" fill="#44483d"/><path d="M222 100h56v28q23 14 24 48v149q0 22-25 25h-54q-25-3-25-25V176q1-34 24-48z" fill="url(#cloth)"/><path d="M214 177v141" stroke="#fff" stroke-opacity=".25" stroke-width="6" stroke-linecap="round"/><path d="M225 249h50" stroke="#dce0c9" stroke-opacity=".55" stroke-width="2"/>`;
        case 'pouch': return `<path d="M132 184q4-32 31-35h172q25 6 29 35l15 112q-6 27-31 29H153q-28-1-32-26Z" fill="url(#cloth)"/><path d="M147 173h205" stroke="#dcc9a7" stroke-width="5"/><path d="M341 174v26h11" stroke="#9b7955" stroke-width="5" fill="none"/><path d="M132 217h238" stroke="#fff" stroke-opacity=".12"/><rect x="218" y="226" width="62" height="34" rx="2" fill="#b89a74"/><path d="M230 242h38" stroke="#6f6048" stroke-opacity=".5"/>`;
        case 'cubes': return `<rect x="115" y="186" width="200" height="139" rx="19" fill="#a99b80" transform="rotate(-9 210 240)"/><rect x="191" y="113" width="178" height="126" rx="16" fill="url(#cloth)" transform="rotate(9 280 175)"/><rect x="146" y="238" width="145" height="92" rx="14" fill="#e3d9c0"/><path d="M168 262h99m-99 16h99m-99 16h99" stroke="#b5ac93" stroke-opacity=".5" stroke-width="2"/><path d="M216 142h122v70H216z" fill="#faf8ee" fill-opacity=".25"/>`;
        case 'passport':
        case 'notebook': return `<path d="m164 110 163-12 13 225-165 11Z" fill="#5a5245" opacity=".2"/><rect x="163" y="101" width="166" height="227" rx="9" fill="url(#cloth)"/><path d="M181 103v222" stroke="#463d31" stroke-opacity=".5" stroke-width="3"/><path d="M231 193h39v38h-39zM218 247h65" fill="none" stroke="#d6c4a0" stroke-width="2"/><path d="M322 107v211" stroke="#c7b68e" stroke-width="3"/>`;
        case 'tag': return `<path d="M236 140v-44q0-17 18-17t18 17v44" stroke="#8b7353" stroke-width="11" fill="none"/><rect x="189" y="138" width="128" height="188" rx="15" fill="url(#cloth)" transform="rotate(10 250 230)"/><rect x="214" y="194" width="78" height="78" rx="4" fill="#e8dfc9" transform="rotate(10 250 230)"/><path d="m229 215 44 8m-46 10 43 8m-46 10 32 6" stroke="#aeaa98" stroke-width="3"/>`;
        case 'towel': return `<path d="M131 179h238v142H131Z" fill="url(#cloth)"/><path d="M131 176q29-25 61-20h177v31H131Z" fill="#dbcfb5"/><path d="M137 201h226m-226 23h226m-226 23h226m-226 23h226m-226 23h226" stroke="#e9e1ce" stroke-width="3"/><path d="M139 319v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17m9-17v17" stroke="#c7b99a" stroke-width="3"/>`;
        case 'mask': return `<ellipse cx="250" cy="217" rx="159" ry="53" fill="none" stroke="#a9a590" stroke-width="16"/><path d="M140 172q110-28 220 0v77q-36 48-87-3-22-23-45 0-51 51-88 3z" fill="url(#cloth)"/><path d="M155 184q96-21 191 0v57q-28 29-62-7-34-34-67 1-33 33-62 6z" fill="none" stroke="#d4d9c4" stroke-opacity=".35" stroke-width="2"/>`;
        default: return `<rect x="111" y="132" width="278" height="194" rx="14" fill="url(#cloth)"/><path d="m116 150 134 86 134-86" stroke="#e4d8bd" stroke-opacity=".5" stroke-width="3" fill="none"/><path d="M130 309h241" stroke="#453e31" stroke-opacity=".3"/>`;
    }
}
for (const p of products) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="450" viewBox="0 0 500 450" style="--c:${p.color}"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f3f1e9"/><stop offset="1" stop-color="#e4e1d6"/></linearGradient><linearGradient id="cloth" x2="1" y2=".8"><stop stop-color="${p.color}"/><stop offset="1" stop-color="${p.color}" stop-opacity=".82"/></linearGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="9" dy="17" stdDeviation="11" flood-color="#534d3e" flood-opacity=".2"/></filter><filter id="blur"><feGaussianBlur stdDeviation="10"/></filter></defs><path fill="url(#bg)" d="M0 0h500v450H0z"/><path d="m-70 90 420-90h150L-40 230z" fill="#fff" opacity=".2"/><ellipse cx="255" cy="357" rx="133" ry="15" fill="#8b8068" opacity=".16" filter="url(#blur)"/><g filter="url(#shadow)">${item(p.shape)}</g></svg>`;
    await writeFile(`${root}/produits/${p.id}.svg`, svg);
}
console.log('18 illustrations originales et deux variantes de poids prêtes.');
