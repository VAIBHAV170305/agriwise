import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingBag, ShieldCheck, CheckCircle2, 
  MapPin, Upload, FileText, AlertCircle, X, Leaf,
  Calendar, Layers, Sparkles, Check, Image as ImageIcon
} from 'lucide-react';
import { api } from '../api';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import WavyLoader from './WavyLoader';

const CROP_IMAGE_PRESETS = [
  { name: 'Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80', label: 'Golden Wheat' },
  { name: 'Tomato', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', label: 'Fresh Tomatoes' },
  { name: 'Cotton', url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80', label: 'Raw Cotton' },
  { name: 'Paddy / Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', label: 'Basmati Paddy' },
  { name: 'Mustard', url: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=600&q=80', label: 'Mustard Seeds' }
];

export default function CreateProductView({ onNavigate }) {
  const { location } = useLocation();
  const { showToast } = useToast();

  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form State
  const [form, setForm] = useState({
    farm_id: '',
    product_name: '',
    category: 'Cereals',
    cultivated_area: '',
    harvest_date: new Date().toISOString().split('T')[0],
    available_quantity: '',
    unit: 'Quintals',
    asking_price: '',
    location: '',
    description: '',
    image_url: CROP_IMAGE_PRESETS[0].url,
    // Certification Fields
    is_organic: false,
    certification_type: 'NPOP (National Programme for Organic Production)',
    certification_number: '',
    certification_expiry: '',
    certificate_file_name: '',
    certificate_doc_url: ''
  });

  useEffect(() => {
    loadFarms();
    // Check for prefilled data from dashboard advance harvest alert
    try {
      const saved = localStorage.getItem('agriwise_prefill_listing');
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(f => ({
          ...f,
          product_name: parsed.product_name || f.product_name,
          category: parsed.category || f.category,
          available_quantity: parsed.available_quantity || f.available_quantity,
          unit: parsed.unit === 'quintal' ? 'Quintals' : (parsed.unit || f.unit),
          description: parsed.description || f.description
        }));
        localStorage.removeItem('agriwise_prefill_listing');
      }
    } catch {
      // ignore
    }
  }, []);

  const loadFarms = async () => {
    setLoadingFarms(true);
    try {
      const farmList = await api.getFarms();
      setFarms(farmList || []);
      if (farmList && farmList.length > 0) {
        setForm(f => ({
          ...f,
          farm_id: farmList[0].id,
          cultivated_area: farmList[0].area || '5.0',
          location: f.location || farmList[0].location || (location?.city ? `${location.city}, ${location.state}` : 'Meerut Mandi Samiti, Uttar Pradesh')
        }));
      } else {
        setForm(f => ({
          ...f,
          location: f.location || (location?.city ? `${location.city}, ${location.state}` : 'Meerut Mandi Samiti, Uttar Pradesh')
        }));
      }
    } catch {
      // Fallback
      setForm(f => ({
        ...f,
        location: f.location || 'Meerut Mandi Samiti, Uttar Pradesh',
        cultivated_area: '5.0'
      }));
    } finally {
      setLoadingFarms(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.product_name || form.product_name.trim().length < 2) {
      errors.product_name = 'Product title is required (e.g. Sharbati Wheat, Hybrid Tomato).';
    }

    if (!form.cultivated_area || isNaN(parseFloat(form.cultivated_area)) || parseFloat(form.cultivated_area) <= 0) {
      errors.cultivated_area = 'Cultivated area selection is required and must be greater than 0 acres.';
    }

    if (!form.available_quantity || isNaN(parseFloat(form.available_quantity)) || parseFloat(form.available_quantity) <= 0) {
      errors.available_quantity = 'Available harvest quantity must be greater than 0.';
    }

    if (!form.asking_price || isNaN(parseFloat(form.asking_price)) || parseFloat(form.asking_price) <= 0) {
      errors.asking_price = 'Asking price per unit is required.';
    }

    if (!form.location || form.location.trim().length < 3) {
      errors.location = 'Mandi delivery hub or dispatch location is required.';
    }

    // Conditional Certification Validation
    if (form.is_organic) {
      if (!form.certification_number || form.certification_number.trim().length < 4) {
        errors.certification_number = 'Certificate / License registration number is required for certified produce.';
      }
      if (!form.certificate_file_name && !form.certificate_doc_url) {
        errors.certificate_file_name = 'Please attach or select proof of certification (PDF/image) for verification.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast({
        title: 'Validation Incomplete',
        message: 'Please review required fields marked in red.',
        type: 'critical'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        farm_id: form.farm_id ? parseInt(form.farm_id) : undefined,
        product_name: form.product_name.trim(),
        category: form.category,
        cultivated_area: parseFloat(form.cultivated_area),
        harvest_date: form.harvest_date,
        available_quantity: parseFloat(form.available_quantity),
        unit: form.unit,
        asking_price: parseFloat(form.asking_price),
        location: form.location.trim(),
        description: form.description.trim(),
        image_url: form.image_url,
        is_organic: !!form.is_organic,
        certification_type: form.is_organic ? form.certification_type : undefined,
        certification_number: form.is_organic ? form.certification_number.trim() : undefined,
        certificate_doc_url: form.is_organic ? (form.certificate_doc_url || form.certificate_file_name) : undefined
      };

      await api.createProduct(payload);

      showToast({
        title: 'Product Published Successfully!',
        message: `${payload.product_name} is now live on the marketplace for verified wholesale buyers.`,
        type: 'success'
      });

      if (onNavigate) {
        onNavigate('listings');
      }
    } catch (err) {
      showToast({
        title: 'Publishing Error',
        message: err.message || 'Could not publish product listing.',
        type: 'critical'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttachSampleCert = () => {
    setForm(f => ({
      ...f,
      certification_number: f.certification_number || 'NPOP/NAB/0019/2026/0482',
      certification_expiry: f.certification_expiry || '2027-12-31',
      certificate_file_name: 'NPOP_Organic_Certificate_2026_Verified.pdf',
      certificate_doc_url: 'https://apeda.gov.in/apedawebsite/organic/NPOP_Certificate_Sample.pdf'
    }));
    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy.certification_number;
      delete copy.certificate_file_name;
      return copy;
    });
    showToast({
      title: 'Sample Certificate Attached',
      message: 'Verified NPOP Organic documentation loaded into listing.',
      type: 'info'
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0 60px' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(22, 51, 38, 0.1)',
        borderRadius: '20px',
        padding: '22px 28px',
        marginBottom: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('listings') : null}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2d6a4f',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '8px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Produce Listings</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Wholesale Produce Exchange</span>
            <span style={{ fontSize: '0.78rem', color: '#6e8577', fontWeight: 600 }}>
              Bharat Agri-Stack Verified Seller
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', color: '#163326', fontWeight: 800, marginTop: '4px' }}>
            Add a Product
          </h1>
          <p style={{ color: '#4b6354', fontSize: '0.86rem', maxWidth: '850px', marginTop: '2px' }}>
            Publish your harvest batch directly to verified wholesale buyers, FPOs, and APMC commission agents with guaranteed digital escrow settlement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('listings') : null}
            className="btn-secondary"
            style={{ padding: '9px 18px', fontSize: '0.84rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
            style={{ padding: '9px 22px', fontSize: '0.84rem' }}
          >
            {submitting ? <WavyLoader size="small" /> : (
              <>
                <ShoppingBag size={16} />
                <span>Publish Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Spacious Dedicated Form Grid */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.85fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Core Agronomic & Pricing Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Product Identification & Origin Farm */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '24px 28px',
            boxShadow: '0 2px 12px rgba(22, 51, 38, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(22, 51, 38, 0.08)', paddingBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d6a4f' }}>
                <Leaf size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  1. Crop Batch Identification & Farm Origin
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#688273' }}>
                  Select the source farm plot, cultivated acreage, and batch title.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                  Product Title / Crop Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.product_name}
                  onChange={e => {
                    setForm({ ...form, product_name: e.target.value });
                    if (formErrors.product_name) setFormErrors({ ...formErrors, product_name: null });
                  }}
                  placeholder="e.g. Sharbati Wheat (HD-3226), Fresh Hybrid Tomato, Long Staple Cotton"
                  style={{
                    borderColor: formErrors.product_name ? '#dc2626' : undefined,
                    background: formErrors.product_name ? '#fff5f5' : '#ffffff'
                  }}
                />
                {formErrors.product_name && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                    <AlertCircle size={12} /> {formErrors.product_name}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Crop Category <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Cereals">Cereals (Wheat, Rice, Maize, Bajra)</option>
                    <option value="Vegetables">Vegetables (Tomato, Onion, Potato)</option>
                    <option value="Pulses">Pulses (Gram, Lentil, Tur Dal, Moong)</option>
                    <option value="Fruits">Fruits (Mango, Banana, Grapes, Citrus)</option>
                    <option value="Cash Crops">Cash Crops (Cotton, Sugarcane, Tobacco)</option>
                    <option value="Oilseeds">Oilseeds (Mustard, Soybean, Groundnut)</option>
                    <option value="Spices">Spices (Cumin, Turmeric, Chilli, Coriander)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Source Farm Plot <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.farm_id}
                    onChange={e => {
                      const selectedId = e.target.value;
                      const matched = farms.find(f => String(f.id) === String(selectedId));
                      setForm({
                        ...form,
                        farm_id: selectedId,
                        cultivated_area: matched?.area || form.cultivated_area,
                        location: matched?.location || form.location
                      });
                    }}
                  >
                    {farms.length > 0 ? (
                      farms.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.farm_name} ({f.area} Acres • {f.location.split('(')[0].trim()})
                        </option>
                      ))
                    ) : (
                      <option value="">Registered Primary Farm (North Block)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Cultivated Area Validation & Harvest Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Cultivated Area (Acres) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      className="form-input"
                      value={form.cultivated_area}
                      onChange={e => {
                        setForm({ ...form, cultivated_area: e.target.value });
                        if (formErrors.cultivated_area) setFormErrors({ ...formErrors, cultivated_area: null });
                      }}
                      placeholder="e.g. 5.0"
                      style={{
                        borderColor: formErrors.cultivated_area ? '#dc2626' : undefined,
                        background: formErrors.cultivated_area ? '#fff5f5' : '#ffffff',
                        paddingRight: '60px'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.76rem', color: '#6e8577', fontWeight: 700 }}>
                      Acres
                    </span>
                  </div>
                  {formErrors.cultivated_area && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                      <AlertCircle size={12} /> {formErrors.cultivated_area}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Harvest / Sowing Date <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={form.harvest_date}
                    onChange={e => setForm({ ...form, harvest_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Quantity, Unit, Price & Mandi Logistics */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '24px 28px',
            boxShadow: '0 2px 12px rgba(22, 51, 38, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid rgba(22, 51, 38, 0.08)', paddingBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d6a4f' }}>
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                  2. Harvest Quantity, Pricing & Delivery Location
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#688273' }}>
                  Specify the available volume, unit denomination, and delivery mandi.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Available Harvest Quantity <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    className="form-input"
                    value={form.available_quantity}
                    onChange={e => {
                      setForm({ ...form, available_quantity: e.target.value });
                      if (formErrors.available_quantity) setFormErrors({ ...formErrors, available_quantity: null });
                    }}
                    placeholder="e.g. 150"
                    style={{
                      borderColor: formErrors.available_quantity ? '#dc2626' : undefined,
                      background: formErrors.available_quantity ? '#fff5f5' : '#ffffff'
                    }}
                  />
                  {formErrors.available_quantity && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                      <AlertCircle size={12} /> {formErrors.available_quantity}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Measurement Unit <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    className="form-select"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="Quintals">Quintals (100 kg)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="Tonnes">Tonnes (1,000 kg)</option>
                    <option value="Boxes">Crater Boxes (25kg)</option>
                    <option value="Bales">Bales (Cotton 170kg)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Asking Price (₹ per {form.unit}) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#2d6a4f' }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      className="form-input"
                      value={form.asking_price}
                      onChange={e => {
                        setForm({ ...form, asking_price: e.target.value });
                        if (formErrors.asking_price) setFormErrors({ ...formErrors, asking_price: null });
                      }}
                      placeholder="e.g. 2650"
                      style={{
                        paddingLeft: '28px',
                        borderColor: formErrors.asking_price ? '#dc2626' : undefined,
                        background: formErrors.asking_price ? '#fff5f5' : '#ffffff'
                      }}
                    />
                  </div>
                  {formErrors.asking_price && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                      <AlertCircle size={12} /> {formErrors.asking_price}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                    Delivery Mandi / Location <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.location}
                    onChange={e => {
                      setForm({ ...form, location: e.target.value });
                      if (formErrors.location) setFormErrors({ ...formErrors, location: null });
                    }}
                    placeholder="e.g. Meerut Mandi (Sardhana Road), Uttar Pradesh"
                    style={{
                      borderColor: formErrors.location ? '#dc2626' : undefined,
                      background: formErrors.location ? '#fff5f5' : '#ffffff'
                    }}
                  />
                  {formErrors.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                      <AlertCircle size={12} /> {formErrors.location}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                  Quality, Moisture & Grading Notes
                </label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Grain moisture measured at 11.2%, machine cleaned & sorted, zero foreign matter, harvested directly from verified plot."
                />
              </div>
            </div>
          </div>

          {/* Card 3: CERTIFICATION & PROOF OF VERIFICATION (STEP 3) */}
          <div style={{
            background: form.is_organic ? '#fbfdfb' : '#ffffff',
            borderRadius: '20px',
            border: form.is_organic ? '2px solid #2d6a4f' : '1px solid rgba(22, 51, 38, 0.1)',
            padding: '24px 28px',
            boxShadow: '0 2px 12px rgba(22, 51, 38, 0.04)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: form.is_organic ? '#2d6a4f' : '#edf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: form.is_organic ? '#ffffff' : '#2d6a4f' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#163326', margin: 0 }}>
                    3. Certification & Quality Verification
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#688273' }}>
                    Certifications unlock premium buyer bids and green trust badges.
                  </span>
                </div>
              </div>

              {/* Certified Toggle Switch */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: form.is_organic ? '#edf6f0' : '#f4f6f4',
                padding: '6px 14px',
                borderRadius: '999px',
                border: form.is_organic ? '1.5px solid #2d6a4f' : '1px solid rgba(22, 51, 38, 0.14)',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={form.is_organic}
                  onChange={e => {
                    const checked = e.target.checked;
                    setForm({ ...form, is_organic: checked });
                    if (!checked) {
                      setFormErrors(prev => {
                        const copy = { ...prev };
                        delete copy.certification_number;
                        delete copy.certificate_file_name;
                        return copy;
                      });
                    }
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#2d6a4f', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: form.is_organic ? '#1b4332' : '#4b6354' }}>
                  {form.is_organic ? '✓ Certified Produce Selected' : 'Mark as Certified'}
                </span>
              </label>
            </div>

            {/* Conditional Certification Verification Flow */}
            {form.is_organic ? (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px dashed rgba(45, 106, 79, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{
                  background: '#edf6f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid rgba(45, 106, 79, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Sparkles size={18} color="#2d6a4f" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: '#1b4332', lineHeight: 1.45 }}>
                    <strong>Mandatory Proof of Certification:</strong> Upload your official certification accreditation document or registration number to receive the <strong>Verified Organic</strong> marketplace seal.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Accreditation Authority <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={form.certification_type}
                      onChange={e => setForm({ ...form, certification_type: e.target.value })}
                    >
                      <option value="NPOP (National Programme for Organic Production)">NPOP (National Programme for Organic Production - APEDA)</option>
                      <option value="PGS-India (Participatory Guarantee System)">PGS-India (Ministry of Agriculture Green Certificate)</option>
                      <option value="Jaivik Bharat / FSSAI Organic">Jaivik Bharat / FSSAI Organic Food Safety</option>
                      <option value="APEDA Certified Export Grade">APEDA Certified Export Grade</option>
                      <option value="State Organic Certification Agency (SOCA)">State Organic Certification Agency (SOCA)</option>
                      <option value="ICAR Good Agricultural Practices (GAP)">ICAR Good Agricultural Practices (GAP)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#163326', marginBottom: '6px' }}>
                      Certificate / License No. <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.certification_number}
                      onChange={e => {
                        setForm({ ...form, certification_number: e.target.value });
                        if (formErrors.certification_number) setFormErrors({ ...formErrors, certification_number: null });
                      }}
                      placeholder="e.g. NPOP/NAB/0019/2026/0482"
                      style={{
                        borderColor: formErrors.certification_number ? '#dc2626' : undefined,
                        background: formErrors.certification_number ? '#fff5f5' : '#ffffff'
                      }}
                    />
                    {formErrors.certification_number && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                        <AlertCircle size={12} /> {formErrors.certification_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Proof of Certification Upload Zone */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#163326' }}>
                      Proof of Certification Document <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAttachSampleCert}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2d6a4f',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={12} /> Use Verified Sample Certificate
                    </button>
                  </div>

                  {form.certificate_file_name ? (
                    <div style={{
                      background: '#edf6f0',
                      border: '1.5px solid #2d6a4f',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="#2d6a4f" />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#163326' }}>
                            {form.certificate_file_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#2d6a4f', fontWeight: 600 }}>
                            ✓ Authenticity Verified • Encrypted on Bharat Agri-Stack
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, certificate_file_name: '', certificate_doc_url: '' })}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        // Simulate file upload or attach
                        handleAttachSampleCert();
                      }}
                      style={{
                        border: formErrors.certificate_file_name ? '2px dashed #dc2626' : '2px dashed rgba(45, 106, 79, 0.3)',
                        borderRadius: '14px',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: formErrors.certificate_file_name ? '#fff5f5' : '#fcfdfc',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2d6a4f'; e.currentTarget.style.background = '#edf6f0'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = formErrors.certificate_file_name ? '#dc2626' : 'rgba(45, 106, 79, 0.3)'; e.currentTarget.style.background = formErrors.certificate_file_name ? '#fff5f5' : '#fcfdfc'; }}
                    >
                      <Upload size={24} color={formErrors.certificate_file_name ? '#dc2626' : '#2d6a4f'} style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#163326' }}>
                        Click to upload Certification Document (PDF / JPG / PNG)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#688273', marginTop: '3px' }}>
                        Attach NPOP, PGS-India, or SOCA scope certificate (Max 10 MB)
                      </div>
                    </div>
                  )}

                  {formErrors.certificate_file_name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                      <AlertCircle size={12} /> {formErrors.certificate_file_name}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: '#688273', margin: '8px 0 0', lineHeight: 1.45 }}>
                If this batch was grown using conventional practices, leave uncertified. Buyers will review standard ICAR pesticide threshold compliance.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Marketplace Listing Preview */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card: Marketplace Visual Preview */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)'
          }}>
            <div style={{ padding: '16px 20px', background: '#f8faf7', borderBottom: '1px solid rgba(22, 51, 38, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Buyer Marketplace Preview
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.66rem' }}>
                LIVE PREVIEW
              </span>
            </div>

            {/* Crop Image */}
            <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={form.image_url}
                alt="Product Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge badge-emerald">{form.category}</span>
                {form.is_organic && (
                  <span className="badge" style={{ background: '#2d6a4f', color: '#ffffff', fontWeight: 800 }}>
                    ✓ Certified
                  </span>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <span style={{ background: 'rgba(22, 51, 38, 0.88)', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                  Plot: {form.cultivated_area || 0} Acres
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.22rem', color: '#163326', fontWeight: 800, margin: 0 }}>
                {form.product_name || 'Product Title'}
              </h3>
              <p style={{ fontSize: '0.76rem', color: '#688273', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {form.location || 'Location Pending'}
              </p>

              {form.description && (
                <p style={{ fontSize: '0.78rem', color: '#4b6354', marginTop: '8px', lineHeight: 1.45 }}>
                  {form.description}
                </p>
              )}

              {/* Price & Quantity Summary */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(22, 51, 38, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 700, textTransform: 'uppercase' }}>
                    ASKING PRICE
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2d6a4f', lineHeight: 1 }}>
                    ₹{form.asking_price || '0'} <span style={{ fontSize: '0.74rem', color: '#6e8577', fontWeight: 600 }}>/ {form.unit}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.68rem', color: '#6e8577', fontWeight: 700, textTransform: 'uppercase' }}>
                    BATCH SIZE
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#163326' }}>
                    {form.available_quantity || '0'} {form.unit}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector for Photos */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#163326', textTransform: 'uppercase', marginBottom: '8px' }}>
              Quick Preset Photos:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {CROP_IMAGE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setForm({ ...form, image_url: preset.url })}
                  style={{
                    border: form.image_url === preset.url ? '2px solid #2d6a4f' : '1px solid rgba(22, 51, 38, 0.15)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    height: '48px',
                    position: 'relative'
                  }}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {form.image_url === preset.url && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(45, 106, 79, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submission Card */}
          <div style={{
            background: '#edf6f0',
            borderRadius: '18px',
            border: '1px solid rgba(45, 106, 79, 0.25)',
            padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#163326', fontSize: '0.82rem', fontWeight: 800 }}>
              <ShieldCheck size={18} color="#2d6a4f" />
              <span>Direct APMC Settlement Guarantee</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#4b6354', marginTop: '6px', lineHeight: 1.45 }}>
              Buyer funds are secured in escrow upon order placement. Payout is released to your registered bank account upon delivery partner confirmation.
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '11px', fontSize: '0.86rem', justifyContent: 'center' }}
            >
              {submitting ? <WavyLoader size="small" /> : 'Publish to Marketplace'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
