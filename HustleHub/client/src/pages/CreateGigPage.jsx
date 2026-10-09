import { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/constants';
import { gigAPI } from '../services/api';
import GigArtwork from '../components/GigArtwork';

const DELIVERY_OPTIONS = [3, 5, 7, 10, 14, 21, 30];
const CARD = { background: '#fff', border: '1px solid #D3DDD5', borderRadius: 'var(--radius)' };

const labelStyle = {
  color: '#69766F', fontSize: '11px', display: 'block',
  marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
};
const inputBase = {
  background: '#fff', borderRadius: 'var(--radius)', color: '#24312E',
  outline: 'none', width: '100%', padding: '10px 12px',
  fontSize: '14px', fontFamily: 'var(--font-sans)', resize: 'vertical',
};

export default function CreateGigPage({ onNavigate, onCreated, gig }) {
  const [form, setForm]         = useState({ title: '', category: '', description: '', price: '', deliveryDays: 7, tags: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(gig);

  useEffect(() => {
    if (gig) setForm({ title: gig.title, category: gig.category, description: gig.description, price: gig.price, deliveryDays: 7, tags: '' });
  }, [gig]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())                              e.title = 'Title is required';
    if (!form.category)                                  e.category = 'Please select a category';
    if (form.description.trim().length < 50)             e.description = 'Description must be at least 50 characters';
    if (!form.price || isNaN(form.price) || +form.price < 100) e.price = 'Minimum price is R 100';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const payload = { title: form.title.trim(), category: form.category, description: form.description.trim(), price: Number(form.price) };
      if (isEditing) await gigAPI.update(gig.id, payload);
      else await gigAPI.create(payload);
      await onCreated?.();
      setSubmitted(true);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const iStyle = (field) => ({ ...inputBase, border: `1.5px solid ${errors[field] ? '#8E4A5A' : '#D3DDD5'}` });

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F3F2EA', paddingTop: '56px' }}>
        <div className="text-center max-w-sm p-10" style={CARD}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#E4ECE6', border: '1px solid #D3DDD5' }}>
            <span style={{ color: '#315E55', fontSize: '20px' }}>✓</span>
          </div>
          <h2 className="text-xl font-light mb-2" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>{isEditing ? 'Gig updated!' : 'Gig published!'}</h2>
          <p className="text-sm mb-6" style={{ color: '#69766F' }}>
            "<strong style={{ color: '#24312E' }}>{form.title}</strong>" {isEditing ? 'has been updated.' : 'is now live on the marketplace.'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('browse')} className="flex-1 py-2.5 text-sm btn-outline">Browse</button>
            <button onClick={() => onNavigate('dashboard')} className="flex-1 py-2.5 text-sm font-medium btn-primary">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F3F2EA', paddingTop: '56px' }}>
      <div style={{ borderBottom: '1px solid #D3DDD5', background: '#E4ECE6' }}>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="section-label mb-2">FREELANCER TOOLS</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'var(--font-display)', color: '#24312E' }}>{isEditing ? 'Edit your gig' : 'Create a new gig'}</h1>
          <p className="text-sm mt-2" style={{ color: '#69766F' }}>Be specific — detail converts browsers into buyers.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main fields */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label style={labelStyle}>GIG TITLE</label>
                <input style={iStyle('title')} placeholder="e.g. Brand Identity Design System"
                  value={form.title} onChange={set('title')}
                  onFocus={e => (e.target.style.borderColor = '#315E55')}
                  onBlur={e  => (e.target.style.borderColor = errors.title ? '#8E4A5A' : '#D3DDD5')} />
                {errors.title && <p className="text-xs mt-1" style={{ color: '#8E4A5A' }}>{errors.title}</p>}
              </div>

              <div>
                <label style={labelStyle}>CATEGORY</label>
                <select style={{ ...iStyle('category'), cursor: 'pointer' }}
                  value={form.category} onChange={set('category')}>
                  <option value="">Select a category</option>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs mt-1" style={{ color: '#8E4A5A' }}>{errors.category}</p>}
              </div>

              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea style={{ ...iStyle('description'), minHeight: '140px' }}
                  placeholder="Describe what you will deliver. Minimum 50 characters."
                  value={form.description} onChange={set('description')}
                  onFocus={e => (e.target.style.borderColor = '#315E55')}
                  onBlur={e  => (e.target.style.borderColor = errors.description ? '#8E4A5A' : '#D3DDD5')} />
                <div className="flex justify-between mt-1">
                  {errors.description ? <p className="text-xs" style={{ color: '#8E4A5A' }}>{errors.description}</p> : <span />}
                  <p className="text-xs" style={{ color: form.description.length < 50 ? '#d97706' : '#69766F' }}>
                    {form.description.length}/50 min
                  </p>
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="p-5" style={CARD}>
                <p className="section-label mb-4">PRICING</p>
                <div className="mb-4">
                  <label style={labelStyle}>PRICE (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#69766F' }}>R</span>
                    <input type="number" min="100" style={{ ...iStyle('price'), paddingLeft: '28px' }}
                      placeholder="0.00" value={form.price} onChange={set('price')}
                      onFocus={e => (e.target.style.borderColor = '#315E55')}
                      onBlur={e  => (e.target.style.borderColor = errors.price ? '#8E4A5A' : '#D3DDD5')} />
                  </div>
                  {errors.price && <p className="text-xs mt-1" style={{ color: '#8E4A5A' }}>{errors.price}</p>}
                </div>

                <div>
                  <label style={labelStyle}>DELIVERY TIME</label>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERY_OPTIONS.map(d => (
                      <button type="button" key={d} onClick={() => setForm(f => ({ ...f, deliveryDays: d }))}
                        className="text-xs px-2.5 py-1 transition-all"
                        style={{
                          background: form.deliveryDays === d ? '#315E55' : '#E4ECE6',
                          color:      form.deliveryDays === d ? '#f9eef0'  : '#38564E',
                          border: `1px solid ${form.deliveryDays === d ? '#315E55' : '#D3DDD5'}`,
                          borderRadius: 'var(--radius)',
                        }}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live preview */}
              {form.title && (
                <div className="p-5" style={CARD}>
                  <p className="section-label mb-3">PREVIEW</p>
                  <p className="text-sm font-medium mb-1" style={{ color: '#24312E' }}>{form.title}</p>
                {form.category && (
                    <div className="mb-3 overflow-hidden" style={{ height: 112, borderRadius: 'var(--radius)', background: '#E4ECE6' }}>
                      <GigArtwork gig={{ title: form.title, category: form.category }} className="h-full w-full object-cover" />
                    </div>
                  )}
                  {form.category && (
                    <span className="text-xs px-2 py-0.5 inline-block mb-2" style={{ background: '#E4ECE6', color: '#38564E', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)' }}>
                      {form.category}
                    </span>
                  )}
                  {form.price && (
                    <p className="text-base font-semibold" style={{ fontFamily: 'var(--font-mono)', color: '#24312E' }}>
                      R {Number(form.price).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: '#69766F' }}>{form.deliveryDays} day delivery</p>
                </div>
              )}

              {serverError && <p role="alert" className="text-xs" style={{ color: '#8E4A5A' }}>{serverError}</p>}
              <button type="submit" disabled={loading} className="w-full py-3 text-sm font-semibold btn-primary">{loading ? 'Saving…' : isEditing ? 'Save Changes →' : 'Publish Gig →'}</button>
              <button type="button" onClick={() => onNavigate('dashboard')} className="w-full py-2.5 text-sm btn-outline">Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
