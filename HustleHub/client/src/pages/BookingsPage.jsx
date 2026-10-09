import { useCallback, useEffect, useState } from 'react';
import { bookingAPI, toBookingView, transactionAPI } from '../services/api';

const CARD = { background: '#fff', border: '1px solid #D3DDD5', borderRadius: 'var(--radius)' };

export default function BookingsPage({ onNavigate, role }) {
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [bookingRows, transactionRows] = await Promise.all([bookingAPI.list(), transactionAPI.list()]);
      setBookings(bookingRows.map(toBookingView)); setTransactions(transactionRows);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (booking, status) => {
    setBusyId(booking.id); setError('');
    try { await bookingAPI.updateStatus(booking.id, status); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  };

  const total = bookings.reduce((sum, booking) => sum + booking.amount, 0);
  const active = bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status)).length;

  return (
    <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: 56 }}>
      <div style={{ borderBottom: '1px solid #D3DDD5', background: '#E4ECE6' }}><div className="max-w-4xl mx-auto px-6 py-10 flex items-center justify-between">
        <div><p className="section-label mb-2">{role === 'freelancer' ? 'FREELANCER PORTAL' : 'CLIENT PORTAL'}</p><h1 className="text-3xl font-light">{role === 'freelancer' ? 'Bookings for my gigs' : 'My bookings'}</h1></div>
        <button onClick={() => onNavigate(role === 'freelancer' ? 'dashboard' : 'browse')} className="px-5 py-2.5 text-sm font-medium btn-primary">{role === 'freelancer' ? 'Dashboard' : 'Browse Gigs'}</button>
      </div></div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">{[
          { label: 'TOTAL BOOKINGS', value: bookings.length },
          { label: role === 'freelancer' ? 'BOOKING VALUE' : 'TOTAL SPENT', value: `R ${total.toLocaleString()}`, mono: true },
          { label: 'ACTIVE', value: active },
        ].map((card) => <div key={card.label} className="p-5" style={{ ...CARD, borderLeft: '4px solid #315E55' }}><p className="section-label mb-2">{card.label}</p><p className="text-xl font-semibold" style={{ fontFamily: card.mono ? 'var(--font-mono)' : 'var(--font-display)' }}>{card.value}</p></div>)}</div>
        {error && <p role="alert" className="mb-4 text-sm" style={{ color: '#8E4A5A' }}>{error}</p>}
        {loading ? <p className="py-10 text-center">Loading bookings…</p> : bookings.length === 0 ? <div className="text-center py-20" style={CARD}><p className="text-sm mb-4" style={{ color: '#69766F' }}>No bookings yet.</p><button onClick={() => onNavigate('browse')} className="text-sm px-5 py-2.5 btn-primary">Browse Gigs →</button></div> :
          <div className="space-y-4">{bookings.map((booking) => {
            const payment = transactions.find((transaction) => String(transaction.booking) === booking.id && transaction.type === 'payment');
            const refund = transactions.find((transaction) => String(transaction.booking) === booking.id && transaction.type === 'refund');
            return <div key={booking.id} className="p-6" style={CARD}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap"><p className="text-sm font-medium">{booking.gigTitle}</p><span className="text-xs px-2 py-0.5 capitalize" style={{ background: '#E4ECE6', color: '#315E55', borderRadius: 'var(--radius)' }}>{booking.status}</span></div>
                <p className="text-xs" style={{ color: '#69766F' }}>{role === 'freelancer' ? 'Client' : 'Freelancer'}: {role === 'freelancer' ? booking.clientName : booking.freelancerName}</p>
                <p className="text-xs mt-1" style={{ color: '#69766F' }}>Booked: {booking.createdAt}</p>
              </div><div className="text-right"><p className="text-xs mb-1" style={{ color: '#69766F' }}>{role === 'freelancer' ? 'Booking amount' : 'Amount'}</p><p className="font-semibold">R {Number(booking.amount).toLocaleString()}</p></div></div>
              <div className="mt-4 pt-4 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid #E4ECE6' }}><span className="text-xs" style={{ color: '#69766F' }}>Transaction: {payment ? String(payment._id).slice(-8).toUpperCase() : 'Not found'}</span><span className="text-xs" style={{ color: refund ? '#8E4A5A' : '#1a6e3e' }}>{refund ? 'Refund recorded' : 'Simulated payment recorded'}</span>
                <div className="ml-auto flex gap-2">{role === 'freelancer' && booking.status === 'pending' && <button disabled={busyId === booking.id} onClick={() => updateStatus(booking, 'confirmed')} className="text-xs px-3 py-1.5 btn-primary">Confirm</button>}
                  {role === 'freelancer' && booking.status === 'confirmed' && <button disabled={busyId === booking.id} onClick={() => updateStatus(booking, 'completed')} className="text-xs px-3 py-1.5 btn-primary">Mark complete</button>}
                  {['pending', 'confirmed'].includes(booking.status) && <button disabled={busyId === booking.id} onClick={() => updateStatus(booking, 'cancelled')} className="text-xs px-3 py-1.5 btn-outline">Cancel</button>}</div>
              </div>
            </div>;
          })}</div>}
      </div>
    </div>
  );
}
