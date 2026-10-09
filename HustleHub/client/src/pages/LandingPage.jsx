import GigArtwork from '../components/GigArtwork';

const CARD_STYLE = {
  background: '#FEFDF9',
  border: '1px solid #D3DDD5',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
};

function GigCard({ gig, onNavigate }) {
  return (
    <button onClick={() => onNavigate('gig-detail', gig.id)} className="text-left group w-full transition-all duration-200"
      style={CARD_STYLE}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#315E55')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#D3DDD5')}>
      <div style={{ height: '190px', overflow: 'hidden' }}>
        <GigArtwork gig={gig} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: '#315E55', color: '#FEFDF9' }}>{gig.freelancerName.charAt(0)}</div>
          <span className="text-xs" style={{ color: '#69766F' }}>{gig.freelancerName}</span>
          <span className="ml-auto text-xs px-2 py-0.5" style={{ background: '#E4ECE6', color: '#38564E', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)' }}>{gig.category}</span>
        </div>
        <h3 className="text-sm font-medium leading-snug mb-3" style={{ color: '#24312E' }}>{gig.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#69766F' }}>{gig.category}</span>
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#24312E' }}>R {gig.price.toLocaleString()}</p>
        </div>
      </div>
    </button>
  );
}

export default function LandingPage({ onNavigate, gigs = [], gigCount = 0 }) {
  const featured = gigs.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: '56px' }}>
      <section className="relative overflow-hidden" style={{ minHeight: '72vh' }}>
        <div className="absolute right-0 top-0 bottom-0 w-[42%] hidden lg:block" style={{ background: '#E4ECE6' }} />
        <div className="relative max-w-7xl mx-auto px-6 flex items-center" style={{ minHeight: '72vh' }}>
          <div className="grid lg:grid-cols-2 gap-16 w-full items-center">
            <div className="py-12">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 mb-8" style={{ border: '1px solid #D3DDD5', borderRadius: 'var(--radius)', color: '#38564E', fontFamily: 'var(--font-mono)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8E4A5A' }} />
                A marketplace for independent talent
              </div>
              <h1 className="text-5xl lg:text-6xl font-light leading-tight mb-6" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>
                Work that<br /><em style={{ color: '#8E4A5A', fontStyle: 'italic' }}>demands</em><br />attention.
              </h1>
              <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: '#53635D' }}>
                HustleHub+ connects clients with creative professionals. Find a service, publish a gig, and keep every booking clear and secure.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <button onClick={() => onNavigate('browse')} className="px-6 py-3 text-sm font-semibold transition-all duration-200" style={{ background: '#315E55', color: '#FEFDF9', borderRadius: 'var(--radius)' }} onMouseEnter={e => (e.currentTarget.style.background = '#244740')} onMouseLeave={e => (e.currentTarget.style.background = '#315E55')}>Browse Work</button>
                <button onClick={() => onNavigate('auth')} className="px-6 py-3 text-sm font-medium transition-all duration-200" style={{ color: '#315E55', border: '1px solid #A9BDB3', borderRadius: 'var(--radius)' }} onMouseEnter={e => (e.currentTarget.style.background = '#E4ECE6')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Start Freelancing →</button>
              </div>
              <div className="flex gap-8 mt-12">
                {[{ value: gigCount, label: 'Live listings' }, { value: 'JWT', label: 'Protected accounts' }, { value: 'Secure', label: 'Simulated booking' }].map(s => <div key={s.label}><p className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>{s.value}</p><p className="text-xs mt-0.5" style={{ color: '#69766F' }}>{s.label}</p></div>)}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4 py-12">
              <img src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=380&fit=crop&auto=format" alt="Creative showcase" className="w-full object-cover" style={{ borderRadius: 'var(--radius)', height: '260px' }} />
              <div className="flex gap-4">
                <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=180&fit=crop&auto=format" alt="Brand design" className="flex-1 object-cover" style={{ borderRadius: 'var(--radius)', height: '160px' }} />
                <div className="flex-1 flex flex-col justify-end p-5" style={{ background: '#315E55', borderRadius: 'var(--radius)' }}>
                  <p className="text-lg font-light mb-1" style={{ fontFamily: 'var(--font-display)', color: '#FEFDF9' }}>Clear from the start</p>
                  <p className="text-xs" style={{ color: 'rgba(254,253,249,0.75)' }}>Bookings create transaction records</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #D3DDD5', borderBottom: '1px solid #D3DDD5', background: '#E9EEE8' }}>
        <div className="max-w-7xl mx-auto px-6 py-5"><div className="flex items-center gap-6 overflow-x-auto">
          <span className="text-xs whitespace-nowrap" style={{ color: '#69766F' }}>Browse by</span>
          {['Design', 'Development', 'Illustration', 'Writing', 'Marketing', 'Photography', 'Strategy'].map(cat => <button key={cat} onClick={() => onNavigate('browse')} className="text-sm whitespace-nowrap transition-colors" style={{ color: '#38564E' }} onMouseEnter={e => (e.currentTarget.style.color = '#8E4A5A')} onMouseLeave={e => (e.currentTarget.style.color = '#38564E')}>{cat}</button>)}
        </div></div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10"><div><p className="text-xs mb-2 section-label">SELECTED WORK</p><h2 className="text-3xl font-light" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>Featured gigs</h2></div>
          <button onClick={() => onNavigate('browse')} className="text-sm transition-colors" style={{ color: '#53635D' }} onMouseEnter={e => (e.currentTarget.style.color = '#315E55')} onMouseLeave={e => (e.currentTarget.style.color = '#53635D')}>View all →</button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">{featured.length ? featured.map(gig => <GigCard key={gig.id} gig={gig} onNavigate={onNavigate} />) : <p className="text-sm" style={{ color: '#69766F' }}>No gigs are listed yet. Sign in as a freelancer to publish the first listing.</p>}</div>
      </section>

      <section style={{ background: '#315E55' }}>
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6"><div><h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'var(--font-display)', color: '#FEFDF9' }}>Your next chapter starts here.</h2><p className="text-sm" style={{ color: 'rgba(254,253,249,0.75)' }}>Create a profile, find a service, or publish your first gig.</p></div>
          <button onClick={() => onNavigate('auth')} className="px-8 py-3 text-sm font-semibold whitespace-nowrap transition-all" style={{ background: '#E5C98B', color: '#24312E', borderRadius: 'var(--radius)' }} onMouseEnter={e => (e.currentTarget.style.background = '#F0DCA9')} onMouseLeave={e => (e.currentTarget.style.background = '#E5C98B')}>Create your account →</button>
        </div>
      </section>
      <footer style={{ borderTop: '1px solid #D3DDD5' }}><div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"><p className="text-xs" style={{ color: '#69766F' }}>© 2026 HustleHub+ · All rights reserved</p><p className="text-xs" style={{ color: '#69766F', fontFamily: 'var(--font-mono)' }}>INSY7314 · Part 2 · Secure Stack</p></div></footer>
    </div>
  );
}
