import React, { useState, useEffect } from 'react';
import { 
  Plus, Tag, ShoppingBag, Edit, Trash2, CheckCircle2, 
  MapPin, X, Leaf, DollarSign, Calendar, Compass, AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { formatDate } from '../utils/dateFormatter';

export default function FarmerListingsView() {
  const [listings, setListings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    region: 'Western Plain Zone (Gujarat)',
    harvest_date: '',
    product_name: '',
    category: 'Cereals',
    farm_id: '',
    available_quantity: '',
    unit: 'kg',
    asking_price: '',
    location: '',
    description: '',
    is_organic: false,
    image_url: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = api.getUser();
      const [prods, farmList] = await Promise.all([
        api.getProducts({ seller_id: user?.id }),
        api.getFarms()
      ]);
      setListings(prods || []);
      setFarms(farmList || []);
      if (farmList && farmList.length > 0) {
        setForm(f => ({ ...f, farm_id: farmList[0].id, location: farmList[0].location }));
      }

      // Check for incoming advance harvest listing prefill
      try {
        const saved = localStorage.getItem('agriwise_prefill_listing');
        if (saved) {
          const prefill = JSON.parse(saved);
          setForm(f => ({
            ...f,
            ...prefill,
            farm_id: farmList && farmList.length > 0 ? farmList[0].id : f.farm_id
          }));
          setShowAddModal(true);
          localStorage.removeItem('agriwise_prefill_listing');
        }
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errors = {};

    // Validate mandatory fields
    if (!form.region || !form.region.trim()) {
      errors.region = 'Region selection is mandatory *';
    }
    if (!form.harvest_date) {
      errors.harvest_date = 'Harvest date is mandatory *';
    }
    if (!form.product_name || !form.product_name.trim()) {
      errors.product_name = 'Crop / Product title is mandatory *';
    }
    if (!form.category) {
      errors.category = 'Category is mandatory *';
    }
    if (!form.available_quantity || parseFloat(form.available_quantity) <= 0) {
      errors.available_quantity = 'Valid available quantity is mandatory *';
    }
    if (!form.unit) {
      errors.unit = 'Unit is mandatory *';
    }
    if (!form.asking_price || parseFloat(form.asking_price) <= 0) {
      errors.asking_price = 'Valid asking price is mandatory *';
    }
    if (!form.location || !form.location.trim()) {
      errors.location = 'Mandi / Hub location is mandatory *';
    }

    setFormErrors(errors);

    // If any mandatory field is missing, details must NOT be updated
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await api.createProduct({
        ...form,
        farm_id: form.farm_id ? parseInt(form.farm_id) : null,
        available_quantity: parseFloat(form.available_quantity),
        asking_price: parseFloat(form.asking_price),
        image_url: form.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
      });
      setShowAddModal(false);
      setSubmitAttempted(false);
      setFormErrors({});
      setForm({
        region: farms[0]?.location ? `Western Plain Zone (${farms[0].location})` : 'Western Plain Zone (Gujarat)',
        harvest_date: '',
        farm_id: farms[0]?.id || '',
        product_name: '',
        category: 'Cereals',
        available_quantity: '',
        unit: 'kg',
        asking_price: '',
        location: farms[0]?.location || '',
        description: '',
        is_organic: false,
        image_url: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Produce Marketplace</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct B2B & Wholesale Trading</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            My Agricultural Produce Listings
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            List harvest batches directly for verified wholesale buyers with regional traceability and harvest date verification.
          </p>
        </div>

        <button className="btn-primary" onClick={() => { setShowAddModal(true); setSubmitAttempted(false); setFormErrors({}); }}>
          <Plus size={16} /> Create New Listing
        </button>
      </div>

      {/* Grid of Listings */}
      {listings.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <ShoppingBag size={40} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>No Active Listings Posted</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            List your wheat, pulses, vegetables, or fruits to receive direct purchase orders.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {listings.map(item => (
            <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'} 
                  alt={item.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-emerald">{item.category}</span>
                  {item.is_organic && <span className="badge badge-sky">Certified Organic</span>}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                  <span style={{ 
                    background: '#163326', color: '#fff', padding: '4px 10px', 
                    borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>{item.product_name}</h3>
                  
                  {/* Region & Mandi Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', background: '#eef4f0', color: '#2d6a4f', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      📍 {item.region || 'Western Plain Zone'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {item.location}
                    </span>
                  </div>

                  {/* Harvest / Availability Date */}
                  <div style={{ fontSize: '0.75rem', color: '#687e72', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="#b47818" />
                    <span>
                      Harvest Date: <strong style={{ color: '#163326' }}>{formatDate(item.harvest_date || item.created_at, 'readable')}</strong> ({formatDate(item.harvest_date || item.created_at, 'regional')})
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                    {item.description || 'Premium farm-fresh harvest batch meeting APMC export and domestic quality standards.'}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PRICE PER {item.unit?.toUpperCase()}</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-800)' }}>
                      ₹{item.asking_price}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AVAILABLE</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.available_quantity} {item.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Listing with Priority Ordering & Mandatory Star Validation */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', padding: '28px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>
                  Create Marketplace Produce Listing
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#576c60' }}>
                  Please complete Priority 1 (Region) and Priority 2 (Date) first. All <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span> fields are mandatory.
                </p>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddModal(false)} />
            </div>

            {submitAttempted && Object.keys(formErrors).length > 0 && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                color: '#991b1b',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} color="#dc2626" />
                <span>
                  <strong>Mandatory Fields Missing:</strong> Please fill all fields marked with an asterisk (<span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>). Produce details will NOT be updated until required information is provided.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* PRIORITY 1: REGION SELECTION (Must be selected first by the farmer) */}
              <div style={{
                background: '#f4f8f5',
                border: formErrors.region ? '1.5px solid #dc2626' : '1px solid rgba(45, 106, 79, 0.2)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#163326', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={14} color="#2d6a4f" />
                    <span>Priority 1: Mandi / Agricultural Region</span>
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2d6a4f', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                    Select First
                  </span>
                </div>
                <select 
                  className="form-select" 
                  value={form.region} 
                  onChange={e => {
                    setForm({...form, region: e.target.value});
                    if (formErrors.region) setFormErrors({...formErrors, region: null});
                  }}
                  style={{ width: '100%', borderColor: formErrors.region ? '#dc2626' : undefined }}
                >
                  <option value="Western Plain Zone (Gujarat)">Western Plain Zone (Gujarat - Anand / APMC)</option>
                  <option value="South Gujarat Heavy Rainfall Zone">South Gujarat Zone (Surat / Navsari APMC)</option>
                  <option value="Trans-Gangetic Plain (Punjab / Haryana)">Trans-Gangetic Plain (Punjab - Khanna / Ludhiana Mandi)</option>
                  <option value="Western Plateau & Hills (Maharashtra)">Western Plateau & Hills (Maharashtra - Nashik / Lasalgaon Mandi)</option>
                  <option value="Central Plateau & Hills (Madhya Pradesh)">Central Plateau & Hills (Madhya Pradesh - Indore / Ujjain Mandi)</option>
                  <option value="Upper Gangetic Plain (Uttar Pradesh)">Upper Gangetic Plain (Uttar Pradesh - Meerut / Hapur Mandi)</option>
                  <option value="Western Dry Region (Rajasthan)">Western Dry Region (Rajasthan - Jaipur / Kota Mandi)</option>
                  <option value="Southern Plateau & Hills (Karnataka)">Southern Plateau & Hills (Karnataka - Belagavi / Shimoga)</option>
                  <option value="East Coast Plains & Hills (Andhra Pradesh)">East Coast Plains & Hills (Andhra Pradesh - Guntur Mandi)</option>
                  <option value="Lower Gangetic Plain (West Bengal)">Lower Gangetic Plain (West Bengal - Burdwan Mandi)</option>
                </select>
                {formErrors.region && (
                  <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.region}</p>
                )}
              </div>

              {/* PRIORITY 2: HARVEST / LOT DATE (DD/MM/YYYY Format) */}
              <div style={{
                background: '#faf9f5',
                border: formErrors.harvest_date ? '1.5px solid #dc2626' : '1px solid rgba(27, 56, 43, 0.1)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#163326', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#b47818" />
                    <span>Priority 2: Harvest / Lot Date</span>
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#687e72', fontWeight: 600 }}>
                    Format: DD/MM/YYYY
                  </span>
                </div>
                <input 
                  type="date" 
                  className="form-input" 
                  value={form.harvest_date} 
                  onChange={e => {
                    setForm({...form, harvest_date: e.target.value});
                    if (formErrors.harvest_date) setFormErrors({...formErrors, harvest_date: null});
                  }}
                  style={{ width: '100%', borderColor: formErrors.harvest_date ? '#dc2626' : undefined }}
                />
                {form.harvest_date ? (
                  <span style={{ fontSize: '0.72rem', color: '#2d6a4f', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    📅 Regional Date: {formatDate(form.harvest_date, 'regional')} ({formatDate(form.harvest_date, 'readable')})
                  </span>
                ) : (
                  formErrors.harvest_date && (
                    <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>{formErrors.harvest_date}</p>
                  )
                )}
              </div>

              {/* PRIORITY 3: PRODUCT TITLE & CATEGORY */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Crop / Produce Title <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                </label>
                <input 
                  className="form-input" 
                  value={form.product_name} 
                  onChange={e => {
                    setForm({...form, product_name: e.target.value});
                    if (formErrors.product_name) setFormErrors({...formErrors, product_name: null});
                  }} 
                  placeholder="e.g. Sharbati Wheat, Fresh Hybrid Tomato, Desi Chana" 
                  style={{ borderColor: formErrors.product_name ? '#dc2626' : undefined }}
                />
                {formErrors.product_name && (
                  <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{formErrors.product_name}</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Category <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <select 
                    className="form-select" 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="Cereals">Cereals</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Cash Crops">Cash Crops</option>
                    <option value="Oilseeds">Oilseeds</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Source Farm Plot <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <select 
                    className="form-select" 
                    value={form.farm_id} 
                    onChange={e => setForm({...form, farm_id: e.target.value})}
                  >
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>{f.farm_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Available Quantity <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-input" 
                    value={form.available_quantity} 
                    onChange={e => {
                      setForm({...form, available_quantity: e.target.value});
                      if (formErrors.available_quantity) setFormErrors({...formErrors, available_quantity: null});
                    }} 
                    placeholder="e.g. 1000" 
                    style={{ borderColor: formErrors.available_quantity ? '#dc2626' : undefined }}
                  />
                  {formErrors.available_quantity && (
                    <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{formErrors.available_quantity}</p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Unit <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <select 
                    className="form-select" 
                    value={form.unit} 
                    onChange={e => setForm({...form, unit: e.target.value})}
                  >
                    <option value="kg">kg</option>
                    <option value="Quintals">Quintals</option>
                    <option value="Tonnes">Tonnes</option>
                    <option value="Boxes">Boxes (25kg)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Asking Price (₹ per unit) <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-input" 
                    value={form.asking_price} 
                    onChange={e => {
                      setForm({...form, asking_price: e.target.value});
                      if (formErrors.asking_price) setFormErrors({...formErrors, asking_price: null});
                    }} 
                    placeholder="e.g. 32.0" 
                    style={{ borderColor: formErrors.asking_price ? '#dc2626' : undefined }}
                  />
                  {formErrors.asking_price && (
                    <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{formErrors.asking_price}</p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Specific Mandi / Hub <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <input 
                    className="form-input" 
                    value={form.location} 
                    onChange={e => {
                      setForm({...form, location: e.target.value});
                      if (formErrors.location) setFormErrors({...formErrors, location: null});
                    }} 
                    placeholder="e.g. Anand APMC Mandi, Gujarat" 
                    style={{ borderColor: formErrors.location ? '#dc2626' : undefined }}
                  />
                  {formErrors.location && (
                    <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{formErrors.location}</p>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description & Quality Notes</label>
                <textarea 
                  rows="2" 
                  className="form-textarea" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="Moisture percentage, grain grading, certification details..." 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="organic" 
                  checked={form.is_organic} 
                  onChange={e => setForm({...form, is_organic: e.target.checked})} 
                  style={{ width: '18px', height: '18px' }} 
                />
                <label htmlFor="organic" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Certified Chemical-Free / Organic Produce
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>
                  * All fields marked with asterisk are mandatory
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => { setShowAddModal(false); setSubmitAttempted(false); setFormErrors({}); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Publish Listing
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
