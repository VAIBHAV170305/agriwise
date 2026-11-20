import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, MapPin, CheckCircle, 
  Leaf, DollarSign, X, CheckCheck, Truck, RefreshCw
} from 'lucide-react';
import { api } from '../api';

export default function MarketplaceBuyer({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);

  // Order Placement Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [deliveryAddress, setDeliveryAddress] = useState('Central Warehouse Hub, APMC Yard, Block 4, Mumbai');
  const [orderNotes, setOrderNotes] = useState('Require jute bag packaging and delivery before 10 AM.');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, organicOnly]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (organicOnly) params.organic_only = true;
      if (search) params.search = search;

      const data = await api.getProducts(params);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrderModal = (prod) => {
    setSelectedProduct(prod);
    setOrderQuantity(Math.min(100, prod.available_quantity));
    setOrderSuccess(null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (orderQuantity <= 0 || orderQuantity > selectedProduct.available_quantity) {
      alert(`Invalid quantity. Must be between 1 and ${selectedProduct.available_quantity} ${selectedProduct.unit}`);
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        items: [
          {
            product_id: selectedProduct.id,
            quantity: parseFloat(orderQuantity)
          }
        ],
        delivery_address: deliveryAddress,
        delivery_notes: orderNotes
      };

      const res = await api.createOrder(orderPayload);
      setOrderSuccess(res);
      loadProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sky">Buyer Trading Portal</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Farm Direct Produce</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>Agricultural Marketplace & Procurement</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Source directly from certified farms and FPO cooperatives with transparent lot provenance and real-time inventory.
          </p>
        </div>

        <button className="btn-secondary" onClick={() => onNavigate('buyer-orders')}>
          <ShoppingBag size={16} /> My Placed Orders
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              className="form-input" 
              style={{ paddingLeft: '38px' }} 
              placeholder="Search wheat, tomato, pulses, cultivars..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') loadProducts(); }}
            />
          </div>
          <button className="btn-primary" onClick={loadProducts}>Search</button>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CATEGORY:</span>
            <select className="form-select" style={{ width: '150px' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Cereals">Cereals</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Pulses">Pulses</option>
              <option value="Fruits">Fruits</option>
              <option value="Cash Crops">Cash Crops</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input 
              type="checkbox" 
              id="buyer-organic" 
              checked={organicOnly} 
              onChange={e => setOrganicOnly(e.target.checked)} 
              style={{ width: '16px', height: '16px' }} 
            />
            <label htmlFor="buyer-organic" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
              Organic Only
            </label>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--forest-800)" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <ShoppingBag size={40} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>No Produce Matching Filters</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Try adjusting your search criteria or resetting the category filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '22px' }}>
          {products.map(prod => (
            <div key={prod.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={prod.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'} 
                  alt={prod.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  <span className="badge badge-emerald">{prod.category}</span>
                  {prod.is_organic && <span className="badge badge-sky">Organic</span>}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>{prod.product_name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {prod.location} • Farmer: {prod.seller_name}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                    {prod.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PRICE PER {prod.unit.toUpperCase()}</span>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--forest-800)', fontFamily: "'Fraunces', serif" }}>
                        ₹{prod.asking_price}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>IN STOCK</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {prod.available_quantity} {prod.unit}
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleOpenOrderModal(prod)}
                  >
                    Place Purchase Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Order Placement */}
      {selectedProduct && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Place Direct Purchase Order</h3>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedProduct(null)} />
            </div>

            {orderSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} color="var(--forest-800)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Order Placed Successfully!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Order #{orderSuccess.id} totaling <strong>₹{orderSuccess.total_amount.toLocaleString()}</strong> has been dispatched to {selectedProduct.seller_name}.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                  <button className="btn-secondary" onClick={() => setSelectedProduct(null)}>
                    Continue Browsing
                  </button>
                  <button className="btn-primary" onClick={() => { setSelectedProduct(null); onNavigate('buyer-orders'); }}>
                    Track Order
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>SELECTED LOT</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProduct.product_name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', marginTop: '2px' }}>
                    ₹{selectedProduct.asking_price} / {selectedProduct.unit} • Max Stock: {selectedProduct.available_quantity} {selectedProduct.unit}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Order Quantity ({selectedProduct.unit})
                  </label>
                  <input 
                    type="number" 
                    step="1" 
                    min="1" 
                    max={selectedProduct.available_quantity} 
                    required 
                    className="form-input" 
                    value={orderQuantity} 
                    onChange={e => setOrderQuantity(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Destination Delivery Address</label>
                  <textarea 
                    rows="2" 
                    required 
                    className="form-textarea" 
                    value={deliveryAddress} 
                    onChange={e => setDeliveryAddress(e.target.value)} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dispatch Notes / Inspection Requirements</label>
                  <input 
                    className="form-input" 
                    value={orderNotes} 
                    onChange={e => setOrderNotes(e.target.value)} 
                  />
                </div>

                {/* Total Cost Estimation */}
                <div style={{
                  padding: '14px 18px', background: 'var(--bg-secondary)',
                  borderRadius: '12px', border: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Order Value</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-800)', fontFamily: "'Fraunces', serif" }}>
                    ₹{(parseFloat(orderQuantity || 0) * selectedProduct.asking_price).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submittingOrder}>
                    {submittingOrder ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    Confirm Purchase Order
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
