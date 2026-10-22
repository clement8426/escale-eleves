import { notFound } from 'next/navigation';
import { products } from '../../../lib/catalogue.mjs';
import { FicheProduit } from '../../../components/Boutique';
export function generateStaticParams() { return products.map(p => ({ id: p.id })); }
export default async function Page({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { const { id } = await params; if (!products.some(p => p.id === id))
    notFound(); return <FicheProduit id={id}/>; }
