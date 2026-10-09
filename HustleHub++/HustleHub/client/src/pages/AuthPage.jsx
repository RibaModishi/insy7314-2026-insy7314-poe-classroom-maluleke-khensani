import { useState } from 'react';
import { authAPI } from '../services/api';

const inputStyle = (hasErr) => ({
  background: '#fff',
  border: `1.5px solid ${hasErr ? '#8E4A5A' : '#D3DDD5'}`,
  borderRadius: 'var(--radius)',
  color: '#24312E',
  outline: 'none',
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  fontFamily: 'var(--font-sans)',
});

const labelStyle = {
  color: '#69766F',
  fontSize: '11px',
  display: 'block',
  marginBottom: '6px',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
};

export default function AuthPage({ onLogin }) {
  const [mode, setMode]   = useState('login');
  const [role, setRole]   = useState('client');
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!form.name.trim())            return setError('Full name is required.');
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
        return setError('Use 8+ characters with uppercase, lowercase, a number, and a special character.');
      }
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    if (!form.email.includes('@'))      return setError('Please enter a valid email address.');
    if (!form.password)                 return setError('Password is required.');

    setLoading(true);
    try {
      if (mode === 'register') {
        const data = await authAPI.register({ name: form.name, email: form.email, password: form.password, role });
        onLogin(data);
      } else {
        const data = await authAPI.login({ email: form.email, password: form.password });
        onLogin(data);
      }
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Unable to reach the HustleHub+ API. Check that the backend is running and VITE_API_URL is correct.'
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ paddingTop: '56px' }}>
      {/* ── LEFT: form panel (#F3F2EA) ── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F3F2EA' }}>
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>
              {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
            </h1>
            <p className="text-sm" style={{ color: '#69766F' }}>
              {mode === 'login' ? 'Sign in to your HustleHub+ account.' : 'Join the platform in under a minute.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex mb-8 rounded-md overflow-hidden" style={{ border: '1.5px solid #D3DDD5' }}>
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 text-sm font-medium capitalize transition-all duration-150"
                style={{
                  background: mode === m ? '#315E55' : '#fff',
                  color:      mode === m ? '#f9eef0' : '#69766F',
                }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input aria-label="Full name" autoComplete="name" required style={inputStyle(false)} placeholder="Amara Osei" value={form.name} onChange={set('name')}
                  onFocus={e => (e.target.style.borderColor = '#315E55')}
                  onBlur={e  => (e.target.style.borderColor = '#D3DDD5')} />
              </div>
            )}

            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input aria-label="Email address" type="email" autoComplete="email" required style={inputStyle(false)} placeholder="you@example.com" value={form.email} onChange={set('email')}
                onFocus={e => (e.target.style.borderColor = '#315E55')}
                onBlur={e  => (e.target.style.borderColor = '#D3DDD5')} />
            </div>

            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input aria-label="Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required style={inputStyle(false)} placeholder="••••••••" value={form.password} onChange={set('password')}
                onFocus={e => (e.target.style.borderColor = '#315E55')}
                onBlur={e  => (e.target.style.borderColor = '#D3DDD5')} />
              {mode === 'register' && <p className="text-xs mt-1" style={{ color: '#69766F' }}>8+ characters with uppercase, lowercase, a number, and a symbol</p>}
            </div>

            {mode === 'register' && (<>
              <div>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <input aria-label="Confirm password" type="password" autoComplete="new-password" required style={inputStyle(false)} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')}
                  onFocus={e => (e.target.style.borderColor = '#315E55')}
                  onBlur={e  => (e.target.style.borderColor = '#D3DDD5')} />
              </div>

              <div>
                <label style={labelStyle}>I AM A</label>
                <div className="flex gap-3">
                  {['client', 'freelancer'].map((r) => (
                    <button type="button" key={r} onClick={() => setRole(r)}
                      className="flex-1 py-2 text-sm capitalize transition-all"
                      style={{
                        background: role === r ? '#315E55' : '#fff',
                        color:      role === r ? '#f9eef0' : '#69766F',
                        border: `1.5px solid ${role === r ? '#315E55' : '#D3DDD5'}`,
                        borderRadius: 'var(--radius)',
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>)}

            {error && (
              <p role="alert" className="text-xs p-3" style={{ background: 'rgba(49,94,85,0.08)', color: '#315E55', borderRadius: 'var(--radius)', border: '1px solid rgba(49,94,85,0.25)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 text-sm font-semibold transition-all mt-2"
              style={{ background: loading ? '#D3DDD5' : '#315E55', color: '#f9eef0', borderRadius: 'var(--radius)', cursor: loading ? 'wait' : 'pointer' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#244740'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#315E55'; }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

        </div>
      </div>

      {/* ── RIGHT: red branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[45%]" style={{ background: '#315E55' }}>
        <div>
          <p className="text-xs mb-3" style={{ color: 'rgba(249,238,240,0.55)', fontFamily: 'var(--font-mono)' }}>HUSTLEHUB+</p>
          <h2 className="text-4xl font-light leading-snug" style={{ fontFamily: 'var(--font-display)', color: '#f9eef0' }}>
            Where ambition<br />meets <em style={{ color: '#E0C27A', fontStyle: 'italic' }}>opportunity.</em>
          </h2>
        </div>

        <div className="space-y-6">
          {[
            { icon: '01', title: 'JWT-secured sessions', desc: 'Every request authenticated with signed tokens.' },
            { icon: '02', title: 'Role-based access',   desc: 'Clients and freelancers see only what they need.' },
            { icon: '03', title: 'Income tracking',       desc: 'See booking income and transaction history.' },
          ].map(f => (
            <div key={f.title} className="flex gap-4">
              <span className="text-xs font-medium pt-0.5" style={{ color: '#C8A45D', fontFamily: 'var(--font-mono)' }}>{f.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: '#f9eef0' }}>{f.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(249,238,240,0.6)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=260&fit=crop&auto=format"
          alt="Creative professionals"
          className="w-full object-cover"
          style={{ borderRadius: 'var(--radius)', height: '200px', opacity: 0.75 }} />
      </div>
    </div>
  );
}
