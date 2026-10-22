import type { Metadata } from 'next';
import './globals.css';
import { BoutiqueProvider } from '../components/Boutique';
export const metadata: Metadata = { title: 'Escale — Les beaux départs', description: 'Une boutique de voyage fictive pour découvrir les outils UX.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="fr-CH"><head><link rel="stylesheet" href="/fonts/local.css"/></head><body><BoutiqueProvider>{children}</BoutiqueProvider></body></html>; }
