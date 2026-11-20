import React, { useState, useEffect } from 'react';
import { 
  Plus, Tag, ShoppingBag, Edit, Trash2, CheckCircle2, 
  MapPin, X, Leaf, DollarSign
} from 'lucide-react';
import { api } from '../api';

export default function FarmerListingsView() {
  const [listings, setListings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    farm_id: '',
    product_name: '',
    category: 'Cereals',
    available_quantity: '',
    unit: 'kg',
    asking_price: '',
    location: '',
    description: '',
    is_organic: false,
    image_url: ''
  });

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct({
        ...form,
        farm_id: form.farm_id ? parseInt(form.farm_id) : null,
        available_quantity: parseFloat(form.available_quantity),
        asking_price: parseFloat(form.asking_price),
        image_url: form.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
      });
      setShowAddModal(false);
      setForm({
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
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>Produce Listings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            List harvest batches directly for verified wholesale buyers.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {listings.map(item => (
            <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'} 
                  alt={item.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
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
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>{item.product_name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {item.location}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PRICE PER {item.unit.toUpperCase()}</span>
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

      {/* Modal: Create Listing */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '28px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Create Marketplace Listing</h3>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Product Title</label>
                <input required className="form-input" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} placeholder="e.g. Sharbati Wheat, Fresh Hybrid Tomato" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="Cereals">Cereals</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Cash Crops">Cash Crops</option>
                    <option value="Oilseeds">Oilseeds</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Source Farm Plot</label>
                  <select className="form-select" value={form.farm_id} onChange={e => setForm({...form, farm_id: e.target.value})}>
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>{f.farm_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available Quantity</label>
                  <input required type="number" step="0.5" className="form-input" value={form.available_quantity} onChange={e => setForm({...form, available_quantity: e.target.value})} placeholder="e.g. 1000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Unit</label>
                  <select className="form-select" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                    <option value="kg">kg</option>
                    <option value="Quintals">Quintals</option>
                    <option value="Tonnes">Tonnes</option>
                    <option value="Boxes">Boxes (25kg)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Asking Price (₹ per unit)</label>
                  <input required type="number" step="0.5" className="form-input" value={form.asking_price} onChange={e => setForm({...form, asking_price: e.target.value})} placeholder="e.g. 32.0" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mandi / Location</label>
                  <input required className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Anand, Gujarat" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Description & Quality Notes</label>
                <textarea rows="2" className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Moisture percentage, harvest date, grading..." />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="organic" checked={form.is_organic} onChange={e => setForm({...form, is_organic: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="organic" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Certified Chemical-Free / Organic Produce</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
