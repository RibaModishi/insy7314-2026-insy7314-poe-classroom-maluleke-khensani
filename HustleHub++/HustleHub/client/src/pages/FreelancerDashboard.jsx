import { useCallback, useEffect, useState } from 'react';
import { bookingAPI, gigAPI, toBookingView, toGigView, transactionAPI } from '../services/api';
import GigArtwork from '../components/GigArtwork';

const CARD = { background: '#fff', border: '1px solid #D3DDD5', borderRadius: 'var(--radius)' };

export default function FreelancerDashboard({ user, onNavigate, onRefreshGigs }) {
  const [tab, setTab] = useState('overview');
  const [gigs, setGigs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [income, setIncome] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [allGigs, bookingRows, incomeData] = await Promise.all([gigAPI.list(), bookingAPI.list(), transactionAPI.income()]);
      setGigs(allGigs.map(toGigView).filter((gig) => gig.freelancerId === user.id));
      setBookings(bookingRows.map(toBookingView)); setIncome(incomeData);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [user.id]);
  useEffect(() => { load(); }, [load]);

  const deleteGig = async (gig) => {
    setDeletingId(gig.id); setError('');
    try {
      await gigAPI.remove(gig.id);
      setConfirmDeleteId('');
      await onRefreshGigs?.();
      await load();
    } catch (err) { setError(err.message); }
    finally { setDeletingId(''); }
  };

  const tabs = [['overview', 'Overview'], ['gigs', 'My Gigs'], ['bookings', 'Bookings'], ['income', 'Income']];
  const money = (value) => `R ${Number(value || 0).toLocaleString()}`;

  return <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: 56 }}>
    <div style={{ borderBottom: '1px solid #D3DDD5', background: '#E4ECE6' }}><div className="max-w-6xl mx-auto px-6 py-10 flex justify-between items-center"><div><p className="section-label mb-2">FREELANCER PORTAL</p><h1 className="text-3xl font-light">Your dashboard</h1><p className="text-sm mt-2" style={{ color: '#69766F' }}>Welcome back, {user.name}.</p></div><button onClick={() => onNavigate('create-gig')} className="px-5 py-2.5 text-sm font-medium btn-primary">+ New Gig</button></div></div>
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex gap-2 border-b mb-8" style={{ borderColor: '#D3DDD5' }}>{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className="px-5 py-3 text-sm" style={{ color: tab === id ? '#315E55' : '#69766F', borderBottom: tab === id ? '2px solid #315E55' : '2px solid transparent' }}>{label}</button>)}</div>
      {error && <p role="alert" className="mb-5 text-sm" style={{ color: '#8E4A5A' }}>{error}</p>}
      {loading ? <p className="py-10 text-center">Loading your dashboard…</p> : <>
        {tab === 'overview' && <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">{[
            ['ACTIVE GIGS', gigs.length], ['BOOKINGS', bookings.length], ['NET INCOME', money(income?.netIncome)],
          ].map(([label, value]) => <div key={label} className="p-5" style={{ ...CARD, borderLeft: '4px solid #315E55' }}><p className="section-label mb-2">{label}</p><p className="text-2xl font-semibold">{value}</p></div>)}</div>
          <div className="grid lg:grid-cols-2 gap-6"><section className="p-6" style={CARD}><div className="flex justify-between mb-5"><h2 className="font-medium">Your gigs</h2><button className="text-sm underline" onClick={() => setTab('gigs')}>View all</button></div>{gigs.slice(0, 3).map((gig) => <div key={gig.id} className="py-3 border-t flex items-center gap-3" style={{ borderColor: '#E4ECE6' }}><GigArtwork gig={gig} className="h-12 w-16 shrink-0 rounded object-cover" /><div><p className="text-sm font-medium">{gig.title}</p><p className="text-xs mt-1" style={{ color: '#69766F' }}>{gig.category} · {money(gig.price)}</p></div></div>)}{!gigs.length && <p className="text-sm" style={{ color: '#69766F' }}>You have not published a gig yet.</p>}</section>
            <section className="p-6" style={CARD}><div className="flex justify-between mb-5"><h2 className="font-medium">Recent bookings</h2><button className="text-sm underline" onClick={() => onNavigate('bookings')}>View all</button></div>{bookings.slice(0, 3).map((booking) => <div key={booking.id} className="py-3 border-t flex justify-between" style={{ borderColor: '#E4ECE6' }}><div><p className="text-sm font-medium">{booking.gigTitle}</p><p className="text-xs mt-1" style={{ color: '#69766F' }}>{booking.status} · {booking.clientName}</p></div><span className="text-sm">{money(booking.amount)}</span></div>)}{!bookings.length && <p className="text-sm" style={{ color: '#69766F' }}>No bookings yet.</p>}</section></div>
        </>}
        {tab === 'gigs' && <section className="p-6" style={CARD}><div className="flex justify-between items-center mb-5"><h2 className="font-medium">My gigs</h2><button onClick={() => onNavigate('create-gig')} className="text-sm px-4 py-2 btn-primary">+ New Gig</button></div>{gigs.map((gig) => <article key={gig.id} className="py-4 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3" style={{ borderColor: '#E4ECE6' }}><div className="flex items-center gap-3"><GigArtwork gig={gig} className="h-14 w-20 shrink-0 rounded object-cover" /><div><p className="font-medium text-sm">{gig.title}</p><p className="text-xs mt-1" style={{ color: '#69766F' }}>{gig.category} · {money(gig.price)}</p></div></div><div className="flex items-center gap-4"><button onClick={() => onNavigate('gig-detail', gig.id)} className="text-xs underline">View</button><button onClick={() => onNavigate('edit-gig', gig.id)} className="text-xs underline">Edit</button>{confirmDeleteId === gig.id ? <><span className="text-xs" style={{ color: '#8E4A5A' }}>Delete this gig?</span><button disabled={deletingId === gig.id} onClick={() => deleteGig(gig)} className="text-xs underline" style={{ color: '#8E4A5A' }}>{deletingId === gig.id ? 'Deleting…' : 'Confirm'}</button><button onClick={() => setConfirmDeleteId('')} className="text-xs underline">Keep</button></> : <button onClick={() => setConfirmDeleteId(gig.id)} className="text-xs underline" style={{ color: '#8E4A5A' }}>Delete</button>}</div></article>)}{!gigs.length && <p className="text-sm" style={{ color: '#69766F' }}>No gigs published.</p>}</section>}
        {tab === 'bookings' && <section className="p-6" style={CARD}><div className="flex justify-between mb-5"><h2 className="font-medium">Bookings for your gigs</h2><button className="text-sm underline" onClick={() => onNavigate('bookings')}>Manage bookings</button></div>{bookings.map((booking) => <div key={booking.id} className="py-3 border-t flex justify-between" style={{ borderColor: '#E4ECE6' }}><div><p className="text-sm font-medium">{booking.gigTitle}</p><p className="text-xs mt-1" style={{ color: '#69766F' }}>{booking.status} · Client: {booking.clientName}</p></div><span className="text-sm">{money(booking.amount)}</span></div>)}{!bookings.length && <p className="text-sm">No bookings yet.</p>}</section>}
        {tab === 'income' && <section className="p-6" style={CARD}><p className="section-label mb-2">INCOME FROM BOOKING TRANSACTIONS</p><h2 className="text-3xl font-semibold mb-2">{money(income?.netIncome)}</h2><p className="text-sm mb-6" style={{ color: '#69766F' }}>Payments: {money(income?.totalEarned)} · Refunds: {money(income?.totalRefunded)}</p><div className="space-y-3">{(income?.transactions || []).map((transaction) => <div key={transaction._id} className="py-3 border-t flex justify-between" style={{ borderColor: '#E4ECE6' }}><div><p className="text-sm capitalize">{transaction.type}</p><p className="text-xs" style={{ color: '#69766F' }}>{new Date(transaction.createdAt).toLocaleDateString()}</p></div><span>{money(transaction.amount)}</span></div>)}</div>{!income?.transactions?.length && <p className="text-sm" style={{ color: '#69766F' }}>Your transaction history will appear here after a booking.</p>}</section>}
      </>}
    </div>
  </div>;
}
