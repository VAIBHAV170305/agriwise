import React, { useState, useEffect } from 'react';
import { 
  Plus, Tag, ShoppingBag, Edit, Trash2, CheckCircle2, 
  MapPin, Leaf, DollarSign, Layers, ArrowRight, ShieldCheck
} from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import WavyLoader from './WavyLoader';

export default function FarmerListingsView({ onNavigate }) {
  const [listings, setListings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the marketplace?`)) return;
    setDeletingId(productId);
    try {
      await api.deleteProduct(productId);
      setListings(prev => prev.filter(p => p.id !== productId));
      showToast({
        title: 'Product Removed',
        message: `Listing "${productName}" has been taken down.`,
        type: 'info'
      });
    } catch (err) {
      showToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete product.',
        type: 'critical'
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 0 60px' }}>
      {/* Title & Action Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Wholesale Produce Exchange</span>
            <span style={{ fontSize: '0.78rem', color: '#6e8577', fontWeight: 600 }}>
              Direct Mandi Commerce
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#163326', fontWeight: 800, marginTop: '4px' }}>
            Produce Listings
          </h2>
          <p style={{ color: '#4b6354', fontSize: '0.85rem', maxWidth: '820px', marginTop: '2px' }}>
            List your harvest batches directly for verified wholesale buyers, FPOs, and institutional aggregators.
          </p>
        </div>

        {/* Updated Button Copy: "Add a Product" */}
        <button 
          className="btn-primary" 
          onClick={() => onNavigate ? onNavigate('create-product') : null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.86rem',
            boxShadow: '0 4px 14px rgba(22, 51, 38, 0.16)'
          }}
        >
          <Plus size={17} />
          <span>Add a Product</span>
        </button>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <WavyLoader label="Loading your active marketplace listings..." />
        </div>
      ) : listings.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px dashed rgba(22, 51, 38, 0.2)',
          padding: '50px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: '#edf6f0',
            color: '#2d6a4f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 800 }}>
            No Active Products Listed
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#657d70', maxWidth: '480px', margin: '6px auto 18px', lineHeight: 1.5 }}>
            You haven't added any products to the marketplace yet. List your wheat, pulses, vegetables, or cotton to receive verified purchase bids.
          </p>
          <button 
            className="btn-primary" 
            onClick={() => onNavigate ? onNavigate('create-product') : null}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '0.86rem' }}
          >
            <Plus size={16} /> Add a Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {listings.map(item => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid rgba(22, 51, 38, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'} 
                  alt={item.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  <span className="badge badge-emerald">{item.category}</span>
                  {item.is_organic && (
                    <span className="badge" style={{ background: '#2d6a4f', color: '#ffffff', fontWeight: 800 }}>
                      ✓ Certified
                    </span>
                  )}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                  <span style={{ 
                    background: '#163326', color: '#fff', padding: '4px 10px', 
                    borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 
                  }}>
                    {item.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#163326', fontWeight: 800, margin: 0 }}>
                    {item.product_name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#688273', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {item.location}
                  </p>
                  {item.description && (
                    <p style={{ fontSize: '0.8rem', color: '#4b6354', marginTop: '8px', lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(22, 51, 38, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 700, textTransform: 'uppercase' }}>
                      PRICE PER {item.unit?.toUpperCase() || 'UNIT'}
                    </span>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2d6a4f', lineHeight: 1.05 }}>
                      ₹{item.asking_price}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 700, textTransform: 'uppercase' }}>
                      AVAILABLE
                    </span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#163326' }}>
                      {item.available_quantity} {item.unit}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteListing(item.id, item.product_name)}
                    disabled={deletingId === item.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>{deletingId === item.id ? 'Removing...' : 'Take Down'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
