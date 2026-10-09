export default function Navbar({ currentPage, role, userName, onNavigate, onLogout }) {
  const isGuest = role === 'guest';

  const navBg = 'rgba(254,253,249,0.96)';
  const borderC = '#D3DDD5';
  const textC = '#24312E';
  const mutedC = '#69766F';
  const accentC = '#315E55';
  const accentTextC = '#FEFDF9';
  const accentHoverC = '#244740';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{ background: navBg, borderBottom: `1px solid ${borderC}`, transition: 'background 0.3s' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-sm"
            style={{ background: accentC, color: accentTextC }}>H+</span>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: textC }}>
            HustleHub<span style={{ color: accentC }}>+</span>
          </span>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink active={currentPage === 'browse'} textC={textC} mutedC={mutedC} accentC={accentC}
            onClick={() => onNavigate('browse')}>Browse</NavLink>

          {!isGuest && role === 'freelancer' && (<>
            <NavLink active={currentPage === 'dashboard'} textC={textC} mutedC={mutedC} accentC={accentC}
              onClick={() => onNavigate('dashboard')}>Dashboard</NavLink>
            <NavLink active={currentPage === 'create-gig'} textC={textC} mutedC={mutedC} accentC={accentC}
              onClick={() => onNavigate('create-gig')}>+ New Gig</NavLink>
          </>)}

          {!isGuest && role === 'client' && (
            <NavLink active={currentPage === 'bookings'} textC={textC} mutedC={mutedC} accentC={accentC}
              onClick={() => onNavigate('bookings')}>My Bookings</NavLink>
          )}

          {!isGuest && role === 'freelancer' && (
            <NavLink active={currentPage === 'bookings'} textC={textC} mutedC={mutedC} accentC={accentC}
              onClick={() => onNavigate('bookings')}>Bookings</NavLink>
          )}

          {!isGuest && (
            <NavLink active={currentPage === 'profile'} textC={textC} mutedC={mutedC} accentC={accentC}
              onClick={() => onNavigate('profile')}>Profile</NavLink>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isGuest ? (
            <>
              <button onClick={() => onNavigate('auth')} className="text-sm px-4 py-1.5 transition-colors"
                style={{ color: mutedC }}
                onMouseEnter={e => (e.currentTarget.style.color = textC)}
                onMouseLeave={e => (e.currentTarget.style.color = mutedC)}>
                Sign in
              </button>
              <button onClick={() => onNavigate('auth')} className="text-sm px-4 py-1.5 font-medium rounded-md transition-colors"
                style={{ background: accentC, color: accentTextC, borderRadius: 'var(--radius)' }}
                onMouseEnter={e => (e.currentTarget.style.background = accentHoverC)}
                onMouseLeave={e => (e.currentTarget.style.background = accentC)}>
                Join
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: accentC, color: accentTextC }}>
                  {userName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-none" style={{ color: textC }}>{userName}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: mutedC }}>{role}</p>
                </div>
              </button>
              <button onClick={onLogout} className="text-xs px-3 py-1 transition-colors"
                style={{ color: mutedC, border: `1px solid ${borderC}`, borderRadius: 'var(--radius)' }}
                onMouseEnter={e => (e.currentTarget.style.color = textC)}
                onMouseLeave={e => (e.currentTarget.style.color = mutedC)}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ children, active, textC, mutedC, accentC, onClick }) {
  return (
    <button onClick={onClick} className="text-sm px-3 py-1.5 transition-colors"
      style={{
        color: active ? accentC : mutedC,
        borderBottom: active ? `2px solid ${accentC}` : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = textC; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = mutedC; }}>
      {children}
    </button>
  );
}
