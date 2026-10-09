import { useEffect, useState } from 'react';
import { getCategoryArtwork, getGigArtwork } from '../data/gigArtwork';

export default function GigArtwork({ gig, className = '', style = {} }) {
  const fallback = getCategoryArtwork(gig?.category);
  const [src, setSrc] = useState(() => getGigArtwork(gig));
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setSrc(getGigArtwork(gig));
    setUnavailable(false);
  }, [gig?.image, gig?.category]);

  const handleError = () => {
    if (src !== fallback) setSrc(fallback);
    else setUnavailable(true);
  };

  if (unavailable) {
    return (
      <div role="img" aria-label={`${gig?.category || 'Other'} category artwork`} className={`flex items-center justify-center ${className}`}
        style={{ background: 'linear-gradient(135deg, #E4ECE6, #D8E5DC)', color: '#315E55', ...style }}>
        <span className="px-3 text-center text-xs font-medium uppercase tracking-widest">{gig?.category || 'Other'}</span>
      </div>
    );
  }

  return <img src={src} alt={`${gig?.title || gig?.category || 'Gig'} artwork`} className={className} style={style} onError={handleError} />;
}
