import { findProduct } from '../../../lib/catalogue.mjs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { const id = new URL(request.url).searchParams.get('id'); const p = findProduct(id); if (!p)
    return Response.json({ error: 'Produit introuvable' }, { status: 404 }); await new Promise(r => setTimeout(r, 3000)); return Response.json(p, { headers: { 'Cache-Control': 'no-store', 'Server-Timing': 'attente;dur=3000;desc="Délai pédagogique volontaire"' } }); }
