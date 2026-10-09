import { useState } from 'react';
import { bookingAPI } from '../services/api';
import GigArtwork from '../components/GigArtwork';

const CARD = { background: '#fff', border: '1px solid #D3DDD5', borderRadius: 'var(--radius)' };

export default function GigDetailPage({ gig, role, onNavigate, onRequireClient }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  const book = async () => {
    if (role !== 'client') { onRequireClient(); return; }
    setBusy(true); setError('');
    try { await bookingAPI.create(gig.id); setBooked(true); setConfirming(false); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  if (!gig) return <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 56, background: '#F3F2EA' }}><div className="text-center"><p className="mb-4">Gig not found or still loading.</p><button className="btn-primary px-5 py-2" onClick={() => onNavigate('browse')}>Back to gigs</button></div></div>;

  return (
    <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: 56 }}>
      {confirming && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,11,13,.55)' }}>
        <div className="w-full max-w-md p-8" style={CARD}>
          <p className="section-label mb-1">CONFIRM BOOKING</p><h2 className="text-xl font-light mb-4">{gig.title}</h2>
          <p className="text-sm mb-2">Freelancer: {gig.freelancerName}</p><p className="text-lg font-semibold mb-5">R {Number(gig.price).toLocaleString()}</p>
          <p className="text-xs mb-5" style={{ color: '#69766F' }}>Payment is simulated. The booking and transaction will be recorded by the server.</p>
          {error && <p role="alert" className="text-sm mb-4" style={{ color: '#8E4A5A' }}>{error}</p>}
          <div className="flex gap-3"><button disabled={busy} onClick={() => setConfirming(false)} className="flex-1 py-2.5 text-sm btn-outline">Cancel</button>
            <button disabled={busy} onClick={book} className="flex-1 py-2.5 text-sm font-semibold btn-primary">{busy ? 'Booking…' : 'Confirm booking →'}</button></div>
        </div>
      </div>}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button onClick={() => onNavigate('browse')} className="text-sm mb-8" style={{ color: '#315E55' }}>← Back to gigs</button>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8" style={CARD}>
            <div className="mb-6 overflow-hidden" style={{ height: 280, borderRadius: 'var(--radius)', background: '#E4ECE6' }}>
              <GigArtwork gig={gig} className="h-full w-full object-cover" />
            </div>
            <div className="flex gap-3 items-center mb-4"><span className="text-xs px-2 py-1" style={{ background: '#E4ECE6', color: '#38564E' }}>{gig.category}</span></div>
            <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>{gig.title}</h1>
            <p className="text-sm mb-8" style={{ color: '#69766F' }}>Offered by {gig.freelancerName}</p>
            <h2 className="text-lg font-light mb-3">About this gig</h2><p className="text-sm leading-relaxed" style={{ color: '#38564E', whiteSpace: 'pre-wrap' }}>{gig.description}</p>
          </div>
          <div className="p-6 h-fit" style={CARD}>
            <p className="text-xs mb-1 section-label">FIXED PRICE</p><p className="text-3xl font-semibold mb-6">R {Number(gig.price).toLocaleString()}</p>
            {booked ? <div role="status" className="text-sm p-4" style={{ background: '#E4ECE6', color: '#315E55' }}>Booking confirmed and transaction recorded.<button onClick={() => onNavigate('bookings')} className="block underline mt-3">View my bookings</button></div> :
              <button disabled={role === 'freelancer'} onClick={() => role === 'client' ? setConfirming(true) : onRequireClient()} className="w-full py-3 text-sm font-semibold btn-primary">
                {role === 'guest' ? 'Sign in to book' : role === 'freelancer' ? 'Freelancers cannot book' : 'Book this gig →'}
              </button>}
            {error && !confirming && <p role="alert" className="text-xs mt-3" style={{ color: '#8E4A5A' }}>{error}</p>}
            <p className="text-xs text-center mt-4" style={{ color: '#69766F' }}>Secure booking · Simulated payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
