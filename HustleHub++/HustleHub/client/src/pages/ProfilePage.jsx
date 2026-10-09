const CARD = { background: '#fff', border: '1px solid #D3DDD5', borderRadius: 'var(--radius)' };

export default function ProfilePage({ user, onNavigate }) {
  const roleLabel = user?.role === 'freelancer' ? 'Freelancer' : user?.role === 'admin' ? 'Administrator' : 'Client';
  return <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: 56 }}>
    <div style={{ borderBottom: '1px solid #D3DDD5', background: '#E4ECE6' }}><div className="max-w-4xl mx-auto px-6 py-10"><p className="section-label mb-2">ACCOUNT</p><h1 className="text-3xl font-light">Your profile</h1></div></div>
    <div className="max-w-4xl mx-auto px-6 py-8"><section className="p-7" style={CARD}>
      <div className="flex items-center gap-4 mb-7"><div className="w-14 h-14 rounded-full flex items-center justify-center text-xl" style={{ background: '#315E55', color: '#f9eef0' }}>{(user?.name || 'U').slice(0, 1).toUpperCase()}</div><div><h2 className="text-xl font-medium">{user?.name}</h2><p className="text-sm capitalize" style={{ color: '#69766F' }}>{roleLabel}</p></div></div>
      <dl className="grid sm:grid-cols-2 gap-5"><div><dt className="section-label mb-1">EMAIL</dt><dd className="text-sm">{user?.email}</dd></div><div><dt className="section-label mb-1">ACCOUNT TYPE</dt><dd className="text-sm">{roleLabel}</dd></div></dl>
      <p className="mt-7 pt-5 border-t text-xs" style={{ borderColor: '#E4ECE6', color: '#69766F' }}>This profile shows the account details returned by the authenticated API.</p>
      {user?.role === 'freelancer' && <button onClick={() => onNavigate('dashboard')} className="mt-5 mr-3 px-4 py-2 text-sm btn-primary">Open dashboard</button>}
      {user?.role === 'client' && <button onClick={() => onNavigate('bookings')} className="mt-5 mr-3 px-4 py-2 text-sm btn-primary">My bookings</button>}
      <button onClick={() => onNavigate('browse')} className="mt-5 px-4 py-2 text-sm btn-outline">Browse gigs</button>
    </section></div>
  </div>;
}
