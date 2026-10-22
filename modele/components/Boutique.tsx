'use client';
import Link from 'next/link';
import {createPortal} from 'react-dom';
import {usePathname,useRouter} from 'next/navigation';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {products,findProduct,money} from '../lib/catalogue.mjs';
type Product = {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    category: string;
    shape: string;
    color: string;
    badge: string;
    description: string;
};
type Line = {
    id: string;
    qty: number;
};
type Profile = {
    name: string;
    email: string;
    city: string;
    postal: string;
    address: string;
};

type Shop={cart:Line[];setCart:(v:Line[])=>void;add:(id:string)=>void;profile:Profile|null;setProfile:(v:Profile|null)=>void;ready:boolean};
const Context=createContext<Shop|null>(null);export const useShop=()=>useContext(Context)!;
export function Icon({ name, size = 20 }: {
    name: string;
    size?: number;
}) { const paths: Record<string, React.ReactNode> = { bag: <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>, arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>, heart: <path d="M20.5 4.6a5.4 5.4 0 0 0-7.6 0L12 5.5l-.9-.9A5.4 5.4 0 0 0 3.5 12L12 21l8.5-9a5.4 5.4 0 0 0 0-7.4Z"/>, user: <><circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/></>, close: <path d="m6 6 12 12M6 18 18 6"/>, check: <path d="m5 12 4 4L19 6"/>, truck: <><path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>, leaf: <><path d="M20 3C4 2 1 9 6 16s15 1 14-13Z"/><path d="m4 21 11-12"/></>, back: <path d="M20 12H4m6-6-6 6 6 6"/>, search: <><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></> }; return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>; }

const key='escale-demo-v1';
export function BoutiqueProvider({children}:{children:React.ReactNode}){
const [cart,rawCart]=useState<Line[]>([]),[profile,rawProfile]=useState<Profile|null>(null),[ready,setReady]=useState(false),[toast,setToast]=useState('');
const pathname=usePathname();
useEffect(()=>{try{const q=new URLSearchParams(location.search),session=q.get('seance');if(session&&localStorage.getItem('escale-session')!==session){localStorage.setItem(key,JSON.stringify({cart:[{id:'sac-weekend',qty:1}],profile:null}));sessionStorage.removeItem('escale-order');localStorage.setItem('escale-session',session);}const old=JSON.parse(localStorage.getItem(key)||'{}');rawCart(Array.isArray(old.cart)?old.cart:[]);rawProfile(old.profile||null);}catch{}setReady(true);},[pathname]);
function persist(part:string,v:unknown){try{const old=JSON.parse(localStorage.getItem(key)||'{}');localStorage.setItem(key,JSON.stringify({...old,[part]:v}));}catch{}}
const setCart=(v:Line[])=>{rawCart(v);persist('cart',v);};const setProfile=(v:Profile|null)=>{rawProfile(v);persist('profile',v);};
function add(id:string){const old=cart.find(x=>x.id===id);setCart(old?cart.map(x=>x.id===id?{...x,qty:x.qty+1}:x):[...cart,{id,qty:1}]);setToast('Ajouté au panier');setTimeout(()=>setToast(''),2000);}
return <Context.Provider value={{cart,setCart,add,profile,setProfile,ready}}><a className="skip" href="#contenu">Aller au contenu</a><div className="announcement" role="region" aria-label="À propos de la démonstration">LE GOÛT DES DÉTOURS <span>Une boutique fictive, de vrais essais UX.</span></div><header className="header"><Link className="brand" href="/" aria-label="Escale, accueil">escale<span>®</span></Link><nav aria-label="Navigation principale"><Link href="/">La collection</Link><a href="/?categorie=Sacs#collection">Les sacs</a><a href="/?categorie=Organisation#collection">Bien s’organiser</a></nav><div className="header-actions"><Link href="/compte" aria-label="Mon compte"><Icon name="user"/></Link><Link href="/panier" className="cart-link" aria-label={`Panier, ${cart.reduce((s, l) => s + l.qty, 0)} articles`}><Icon name="bag"/><span>{cart.reduce((s, l) => s + l.qty, 0)}</span></Link></div></header><main id="contenu">{children}</main><footer className="footer"><div><Link className="brand" href="/">escale<span>®</span></Link><p>Moins d’affaires.<br />Plus d’histoires.</p></div><div><strong>Pour vos départs</strong><Link href="/">La collection</Link><Link href="/panier">Mon panier</Link><Link href="/compte">Mon compte de test</Link></div><div><strong>Pour la formation</strong><span>Votre atelier est ouvert dans l’autre fenêtre.</span><a href="/compte">Comptes de démonstration</a><span>Aucune vente ni aucun paiement réel.</span></div><div className="footer-bottom">Une boutique pédagogique · UX × IA <span>Produits et comptes fictifs · CHF</span></div></footer>{toast && <div className="toast" role="status"><Icon name="check"/>{toast}</div>}</Context.Provider>;

}
function Action({ id, place = 'catalogue' }: {
    id: string;
    place?: string;
}) { const { add } = useShop(); return <button data-role="ajout-panier" data-d="1" className={`button buy ${place}`} onClick={() => add(id)}>Ajouter au panier <Icon name="arrow" size={17}/></button>; }
export function Catalogue() { const [category, setCategory] = useState('Tout'), [query, setQuery] = useState(''); const {} = useShop(); useEffect(() => { setCategory(new URLSearchParams(location.search).get('categorie') || 'Tout'); }, []); const list = (products as Product[]).filter(p => (category === 'Tout' || p.category === category) && `${p.name} ${p.subtitle}`.toLowerCase().includes(query.toLowerCase())); return <><section className="hero"><div className="hero-copy"><div className="eyebrow">LES BEAUX DÉPARTS / COLLECTION 01</div><h1>Partir léger.<br /><em>Revenir riche.</em></h1><p>Des compagnons bien pensés pour les week-ends spontanés et les grands détours.</p><a className="button primary" href="#collection">Trouver mon compagnon <Icon name="arrow"/></a><div className="hero-note"><span className="tiny-stars">✦ ✦ ✦</span> Pour les jours qui sortent de l’ordinaire.</div></div><div className="hero-photo"><img src="/images/hero.webp" alt="Sac de week-end vert, gourde et pochettes de voyage dans une lumière douce" width="1200" height="800" fetchPriority="high"/><span className="image-caption">L’ESSENTIEL, ET UN PEU D’AILLEURS.</span><span className="hero-stamp">ÉDITION<br /><b>01</b><br />LES ESSENTIELS</span></div></section><div className="benefits"><span><Icon name="truck"/> Expédition depuis la Suisse</span><span><Icon name="leaf"/> Des objets faits pour durer*</span><span><Icon name="bag"/> Paiement entièrement fictif</span></div><section className="collection section" id="collection"><div className="section-heading"><div><div className="eyebrow">UN DÉPART SE PRÉPARE</div><h2>Choisir ses essentiels.</h2></div><span>18 objets · mille façons de partir</span></div><div className="filters"><div className="pills">{['Tout', 'Sacs', 'Organisation', 'Accessoires'].map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)} aria-pressed={category === c}>{c}</button>)}</div><label className="search"><Icon name="search" size={17}/><input aria-label="Rechercher un produit" placeholder="Un sac, une gourde…" value={query} onChange={e => setQuery(e.target.value)}/></label></div><div className="product-grid">{list.map((p, i) => <article className="product-card" key={p.id}><Link className="product-visual" href={`/produits/${p.id}`}><img src={`/images/produits/${p.id}.svg`} alt={`${p.subtitle}, modèle ${p.name}`} width="500" height="450" loading="lazy"/>{p.badge && <span className="badge">{p.badge}</span>}<span className="visual-arrow"><Icon name="arrow"/></span></Link><div className="card-copy" data-d="2" style={{ padding: [12, 24, 36][i % 3] }}><div className="card-title"><h3><Link href={`/produits/${p.id}`}>{p.name}</Link></h3><span>{money(p.price)}</span></div><p>{p.subtitle}</p><Action id={p.id}/></div></article>)}</div>{!list.length && <p className="empty">Aucun produit ne correspond. Essayez un autre mot.</p>}</section><section className="editorial"><div className="eyebrow">L’ESPRIT ESCALE</div><h2>Le meilleur du voyage<br />ne rentre pas dans un sac.</h2><p>Mais pour tout le reste, on a quelques idées.</p><a href="#collection">Explorer la collection <span>↗</span></a></section><p className="fiction">* Promesse de marque fictive : ce site est un support de formation, pas une boutique réelle.</p></>; }
export function FicheProduit({ id }: {
    id: string;
}) {
    const { ready } = useShop();
    const [loading, setLoading] = useState(true), [replay, setReplay] = useState(0), [favorite, setFavorite] = useState(false);
    const p = findProduct(id) as Product;
    useEffect(() => {
        if (!ready)
            return;
        const controller = new AbortController();
        setLoading(true);
        fetch(`/api/produit?id=${encodeURIComponent(id)}&essai=${replay}`, { signal: controller.signal, cache: 'no-store' }).then(r => {
            if (!r.ok)
                throw Error('Chargement indisponible');
            return r.json();
        }).then(() => setLoading(false)).catch(e => {
            if (e.name !== 'AbortError')
                setLoading(false);
        });
        return () => controller.abort();
    }, [id, replay, ready]);
    return <section className="section product-page"><Link href="/#collection" className="back"><Icon name="back" size={16}/> La collection</Link><div className="product-detail"><div className="detail-photo">{id === 'sac-weekend' ? ready ? <img data-d="7" src={`/api/image?version=${'lourde'}`} alt="Le Week-end, sac en toile verte avec ses accessoires de voyage" width="1200" height="800" fetchPriority="high"/> : <div className="photo-placeholder" aria-hidden="true"/> : <img src={`/images/produits/${id}.svg`} alt={`${p.name}, ${p.subtitle}`} width="500" height="450"/>}<span className="detail-label">PENSÉ POUR VOS DÉTOURS.</span></div><div className="detail-content" aria-busy={loading}><div className="eyebrow">LA COLLECTION / {p.category.toUpperCase()}</div>{loading ? <div data-d="8" className="waiting">{false}</div> : <><div className="detail-title"><h1>{p.name}</h1><button data-d="4" className={`favorite ${favorite ? 'selected' : ''}`} aria-label={undefined} aria-pressed={favorite} onClick={() => setFavorite(!favorite)}><Icon name="heart" size={23}/></button></div><div className="subtitle">{p.subtitle}</div><div className="detail-price" data-d="9" style={{ color: "#b5b6ad" }}>{money(p.price)}</div><p className="description">{p.description}</p><div className="color-row"><span style={{ background: p.color }}/> <span>Coloris signature</span><small>En stock · modèle fictif</small></div><Action id={p.id} place="fiche"/><p className="small-note">Livraison standard : CHF 8.90 · retour fictif sous 30 jours.</p><details open><summary>Les détails qui comptent</summary><p>Une forme simple, des finitions soignées et juste ce qu’il faut de place. Photos et caractéristiques illustratives pour la formation.</p></details><details><summary>Livraison & retours</summary><p>En Suisse uniquement, sous 3 à 5 jours ouvrables fictifs. Aucun colis ne sera expédié.</p></details></>}<button className="replay" onClick={() => setReplay(replay + 1)}>↻ Rejouer le chargement</button></div></div></section>;
}
export function Panier() { const { cart, setCart } = useShop(); const total = cart.reduce((s, l) => s + (findProduct(l.id)?.price || 0) * l.qty, 0); return <section className="section narrow"><div className="eyebrow">VOTRE PROCHAIN DÉPART</div><h1>Dans votre sac.</h1>{!cart.length ? <div className="empty"><Icon name="bag" size={44}/><h2>Votre panier attend ses compagnons.</h2><p>Choisissez quelques essentiels pour commencer la mission.</p><Link className="button primary" href="/#collection">Découvrir les produits <Icon name="arrow"/></Link></div> : <div className="checkout-layout"><div>{cart.map(l => { const p = findProduct(l.id) as Product; return <article className="basket-line" key={l.id}><Link href={`/produits/${p.id}`}><img src={`/images/produits/${p.id}.svg`} alt={p.name} width="120" height="120"/></Link><div><h2>{p.name}</h2><p>{p.subtitle}</p><div className="qty"><button aria-label={`Retirer une unité de ${p.name}`} onClick={() => setCart(cart.map(x => x.id === l.id ? { ...x, qty: x.qty - 1 } : x).filter(x => x.qty > 0))}>−</button><span>{l.qty}</span><button aria-label={`Ajouter une unité de ${p.name}`} onClick={() => setCart(cart.map(x => x.id === l.id ? { ...x, qty: Math.min(x.qty + 1, 99) } : x))}>+</button></div></div><strong>{money(p.price * l.qty)}</strong><button className="remove" aria-label={`Retirer ${p.name} du panier`} onClick={() => setCart(cart.filter(x => x.id !== l.id))}><Icon name="close" size={16}/></button></article>; })}<div className="recommend"><h3>Un petit compagnon en plus ?</h3><p>Le Repère · étiquette de bagage · CHF 15.00</p><Action id="etiquette-bagage" place="panier"/></div></div><aside className="order-summary"><h2>Votre départ</h2><p><span>Articles</span><b>{money(total)}</b></p><p><span>Livraison standard</span><b>CHF 8.90</b></p><p className="summary-total"><span>Total</span><b>{money(total + 8.9)}</b></p><Link href="/commande" className="button primary">Passer la commande <Icon name="arrow"/></Link><span className="small-note">Exercice uniquement. Aucun paiement.</span></aside></div>}</section>; }
const blank = { name: '', email: '', address: '', postal: '', city: '', phone: '' };
export function Commande() {
    const { cart, setCart, profile } = useShop();
    const router = useRouter();
    const [values, setValues] = useState(blank), [error, setError] = useState(false), [sending, setSending] = useState(false);
    const postalRef = useRef<HTMLInputElement>(null);
    const total = cart.reduce((s, l) => s + (findProduct(l.id)?.price || 0) * l.qty, 0);
    useEffect(() => {
        if (profile)
            setValues(v => ({ ...v, name: profile.name, email: profile.email, address: profile.address, postal: profile.postal, city: profile.city }));
    }, [profile]);
    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!/^\d{4}$/.test(values.postal)) {
            setError(true);
            setValues(blank);
            requestAnimationFrame(() => postalRef.current?.focus());
            return;
        }
        setError(false);
        setSending(true);
        setTimeout(() => { sessionStorage.setItem('escale-order', JSON.stringify({ id: 'ESC-2048', name: values.name, total: total + 8.9, cart })); router.push('/confirmation'); }, 650);
    }
    return <section className="section narrow"><Link href="/panier" className="back"><Icon name="back" size={16}/> Retour au panier</Link><div className="eyebrow">EN ROUTE</div><h1>Les derniers détails.</h1>{!cart.length ? <div className="empty"><p>Votre panier est vide.</p><button className="button primary" onClick={() => setCart([{ id: 'sac-weekend', qty: 1 }])}>Charger le panier de démonstration</button></div> : <div className="checkout-layout"><form className="checkout-form" onSubmit={submit} noValidate data-d="3"><div className="step-title"><span>01</span><h2>Vos coordonnées</h2></div><p>Utilisez uniquement des coordonnées fictives.</p><div className="form-grid">{Object.entries({ name: 'Nom complet', email: 'Adresse e-mail', address: 'Rue et numéro', postal: 'Code postal', city: 'Ville', phone: 'Téléphone (facultatif)' }).map(([field, label]) => <div className={`field ${field === 'address' ? 'full' : ''}`} key={field}><label htmlFor={field}>{label}</label><input ref={field === 'postal' ? postalRef : undefined} id={field} name={field} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} value={values[field as keyof typeof blank]} onChange={e => setValues({ ...values, [field]: e.target.value })} aria-invalid={field === 'postal' && error || undefined} aria-describedby={field === 'postal' && error ? 'postal-error' : undefined}/>{field === 'postal' && error && <span className="field-error" id="postal-error">Saisissez un code postal suisse à 4 chiffres, par exemple 2000.</span>}</div>)}</div><div className="step-title"><span>02</span><h2>Votre livraison</h2></div><label className="delivery"><input type="radio" name="delivery" defaultChecked/> <span>Standard · Suisse<small>3 à 5 jours ouvrables fictifs</small></span><b>CHF 8.90</b></label><div className="step-title"><span>03</span><h2>Confirmation fictive</h2></div><p>Aucune carte bancaire nécessaire. Aucune donnée n’est envoyée à un service de paiement.</p><button className="button primary" disabled={sending}>{sending ? 'Préparation…' : `Confirmer la commande fictive · ${money(total + 8.9)}`}<Icon name="arrow"/></button></form><aside className="order-summary"><h2>Dans votre sac</h2>{cart.map(l => <p key={l.id}><span>{findProduct(l.id)?.name} × {l.qty}</span><b>{money((findProduct(l.id)?.price || 0) * l.qty)}</b></p>)}<p><span>Livraison</span><b>CHF 8.90</b></p><p className="summary-total"><span>Total fictif</span><b>{money(total + 8.9)}</b></p><span className="small-note">Vous avez un compte de test ? <Link href="/compte">Se connecter</Link></span></aside></div>}</section>;
}
export function Confirmation() {
    const {} = useShop();
    const [order, setOrder] = useState<any>(null), [modal, setModal] = useState(false), [cancelled, setCancelled] = useState(false);
    const trigger = useRef<HTMLButtonElement>(null), dialog = useRef<HTMLDivElement>(null);
    useEffect(() => {
        try {
            setOrder(JSON.parse(sessionStorage.getItem('escale-order') || 'null'));
        }
        catch { }
    }, []);
    return <section className="section confirmation"><div className="success-icon"><Icon name={cancelled ? 'close' : 'check'} size={32}/></div><div className="eyebrow">{cancelled ? 'DÉPART REPORTÉ' : 'TOUT EST PRÊT'}</div><h1>{cancelled ? 'Commande fictive annulée.' : 'Votre prochain détour vous attend.'}</h1><p>{order ? `${order.name}, votre commande ${order.id} a bien été simulée.` : 'Vous consultez un exemple de confirmation pour la démonstration.'}<br />Aucun paiement ni aucune expédition.</p><div className="confirmation-card"><span>COMMANDE FICTIVE</span><h2>{order?.id || 'ESC-2048'}</h2><p>Livraison standard · Suisse</p><strong>{money(order?.total || 137.9)}</strong></div><div className="confirmation-actions"><Link className="button primary" href="/">Revenir à la collection <Icon name="arrow"/></Link>{!cancelled && <button className="text-button" ref={trigger} onClick={() => setModal(true)}>Annuler cette commande</button>}</div>{modal && createPortal(<div className="modal-backdrop"><div data-d="5" className="modal" role="dialog" aria-modal={false || undefined} aria-labelledby="modal-title" ref={dialog}><span className="eyebrow">UNE DERNIÈRE VÉRIFICATION</span><h2 id="modal-title" data-d="6">{'Êtes-vous sûr de ne pas vouloir annuler votre commande ?'}</h2><p>Il s’agit d’une commande de démonstration. Votre choix peut être réinitialisé.</p><div className="modal-actions"><button tabIndex={-1} className="button primary" data-safe onClick={() => setModal(false)}>{'Oui'}</button><button tabIndex={-1} className="button secondary" onClick={() => { setModal(false); setCancelled(true); }}>{'Non'}</button></div></div></div>, document.body)}</section>;
}
export function Compte() {
    const { profile, setProfile } = useShop();
    const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState('');
    const router = useRouter();
    async function login(e: React.FormEvent) {
        e.preventDefault();
        const r = await fetch('/api/connexion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await r.json();
        if (!r.ok) {
            setError(data.error);
            return;
        }
        setProfile(data.profile);
        router.push('/commande');
    }
    return <section className="section account"><div className="eyebrow">VOTRE ESCALE</div><h1>{profile ? `Bonjour ${profile.name}.` : 'Ravi de vous retrouver.'}</h1>{profile ? <><p>Compte de démonstration : {profile.email}</p><Link className="button primary" href="/commande">Reprendre la commande <Icon name="arrow"/></Link><button className="text-button" onClick={() => setProfile(null)}>Se déconnecter</button></> : <form onSubmit={login}><p>Connexion fictive, sans compte personnel. <span>camille@example.test / Escale2026!</span></p><div className="field"><label htmlFor="login-email">Adresse e-mail de test</label><input id="login-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username"/></div><div className="field"><label htmlFor="login-password">Mot de passe de test</label><input id="login-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/></div>{error && <p role="alert" className="field-error">{error}</p>}<button className="button primary">Se connecter <Icon name="arrow"/></button></form>}</section>;
}
