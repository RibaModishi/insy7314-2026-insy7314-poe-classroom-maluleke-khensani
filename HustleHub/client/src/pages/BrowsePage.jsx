import { useState } from 'react';
import { CATEGORIES } from '../data/constants';
import GigArtwork from '../components/GigArtwork';

const CARD = { background: '#fff', border: '1px solid #D3DDD5', borderRadius: 'var(--radius)', overflow: 'hidden' };

function GigCard({ gig, onNavigate }) {
  return (
    <button onClick={() => onNavigate('gig-detail', gig.id)} className="text-left group w-full transition-all duration-200" style={CARD}>
      <div style={{ height: 180, overflow: 'hidden', background: '#E4ECE6' }}><GigArtwork gig={gig} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /></div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#315E55', color: '#f9eef0' }}>{gig.freelancerName.charAt(0)}</div>
          <span className="text-xs" style={{ color: '#69766F' }}>{gig.freelancerName}</span>
          <span className="ml-auto text-xs px-2 py-0.5" style={{ background: '#E4ECE6', color: '#38564E', borderRadius: 'var(--radius)' }}>{gig.category}</span>
        </div>
        <h3 className="text-sm font-medium leading-snug mb-4" style={{ color: '#24312E' }}>{gig.title}</h3>
        <p className="text-xs mb-4 line-clamp-2" style={{ color: '#69766F' }}>{gig.description}</p>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E4ECE6' }}>
          <span className="text-xs" style={{ color: '#69766F' }}>Fixed price</span>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#24312E' }}>R {Number(gig.price).toLocaleString()}</span>
        </div>
      </div>
    </button>
  );
}

export default function BrowsePage({ gigs = [], onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const categories = ['All', ...new Set(gigs.map((gig) => gig.category).filter(Boolean))];
  const filtered = gigs
    .filter((gig) => activeCategory === 'All' || gig.category === activeCategory)
    .filter((gig) => `${gig.title} ${gig.freelancerName} ${gig.description}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'price-desc' ? b.price - a.price : a.price - b.price);

  return (
    <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: 56 }}>
      <div style={{ borderBottom: '1px solid #D3DDD5', background: '#E4ECE6' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="section-label mb-2">MARKETPLACE</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>Browse all gigs</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input aria-label="Search gigs" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gigs or freelancers…" className="flex-1"
            style={{ background: '#fff', border: '1.5px solid #D3DDD5', borderRadius: 'var(--radius)', color: '#24312E', padding: '10px 14px', fontSize: 14, outline: 'none' }} />
          <select aria-label="Sort gigs" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ background: '#fff', border: '1.5px solid #D3DDD5', borderRadius: 'var(--radius)', color: '#24312E', padding: '10px 14px', fontSize: 14 }}>
            <option value="price-asc">Sort: Price ↑</option><option value="price-desc">Sort: Price ↓</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap mb-8">
          {(categories.length > 1 ? categories : CATEGORIES).map((cat) => <button key={cat} onClick={() => setActiveCategory(cat)} className="text-sm px-4 py-1.5"
            style={{ background: activeCategory === cat ? '#315E55' : '#fff', color: activeCategory === cat ? '#f9eef0' : '#69766F', border: `1.5px solid ${activeCategory === cat ? '#315E55' : '#D3DDD5'}`, borderRadius: 'var(--radius)' }}>{cat}</button>)}
        </div>
        <p className="text-xs mb-6" style={{ color: '#69766F', fontFamily: 'var(--font-mono)' }}>{filtered.length} GIG{filtered.length !== 1 ? 'S' : ''} FOUND</p>
        {filtered.length === 0 ? <div className="text-center py-20" style={CARD}><p className="text-sm" style={{ color: '#69766F' }}>{gigs.length ? 'No gigs match your search.' : 'No gigs are listed yet.'}</p></div> :
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((gig) => <GigCard key={gig.id} gig={gig} onNavigate={onNavigate} />)}</div>}
      </div>
    </div>
  );
}
