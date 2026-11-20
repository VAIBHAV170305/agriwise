import React, { useState, useEffect } from 'react';
import { 
  Plus, MapPin, Layers, Droplets, Calendar, DollarSign, 
  Trash2, Edit, CheckCircle, ChevronRight, X, Sprout, AlertCircle, Compass
} from 'lucide-react';
import { api } from '../api';
import { formatDate } from '../utils/dateFormatter';

export default function FarmManagement() {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [activities, setActivities] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Forms
  const [farmForm, setFarmForm] = useState({
    farm_name: '', location: '', area: '', area_unit: 'Acres', soil_type: 'Loamy Alluvial', irrigation_type: 'Drip', description: ''
  });
  const [cropForm, setCropForm] = useState({
    region: 'Western Plain Zone (Gujarat)',
    season: 'Rabi',
    sowing_date: '',
    expected_harvest_date: '',
    crop_name: '',
    crop_variety: '',
    cultivated_area: '',
    growth_stage: 'Vegetative'
  });
  const [cropErrors, setCropErrors] = useState({});
  const [cropSubmitAttempted, setCropSubmitAttempted] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activity_type: 'Irrigation', activity_date: new Date().toISOString().split('T')[0], description: '', cost: '0'
  });
  const [expenseForm, setExpenseForm] = useState({
    category: 'Fertilizer', amount: '', date: new Date().toISOString().split('T')[0], description: ''
  });

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (selectedFarm) {
      loadFarmDetails(selectedFarm.id);
    }
  }, [selectedFarm]);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await api.getFarms();
      setFarms(data || []);
      if (data && data.length > 0) {
        setSelectedFarm(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFarmDetails = async (farmId) => {
    try {
      const [cropsData, actData, expData] = await Promise.all([
        api.getCrops(farmId),
        api.getFarmActivities(farmId),
        api.getFarmExpenses(farmId)
      ]);
      setCrops(cropsData || []);
      setActivities(actData || []);
      setExpenses(expData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createFarm({
        ...farmForm,
        area: parseFloat(farmForm.area)
      });
      setShowAddFarm(false);
      setFarmForm({ farm_name: '', location: '', area: '', area_unit: 'Acres', soil_type: 'Loamy Alluvial', irrigation_type: 'Drip', description: '' });
      loadFarms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;

    setCropSubmitAttempted(true);
    const errors = {};

    if (!cropForm.region || !cropForm.region.trim()) {
      errors.region = 'Region selection is mandatory *';
    }
    if (!cropForm.sowing_date) {
      errors.sowing_date = 'Sowing date is mandatory *';
    }
    if (!cropForm.expected_harvest_date) {
      errors.expected_harvest_date = 'Expected harvest date is mandatory *';
    } else if (cropForm.sowing_date && cropForm.expected_harvest_date < cropForm.sowing_date) {
      errors.expected_harvest_date = 'Harvest date must be after sowing date *';
    }
    if (!cropForm.crop_name || !cropForm.crop_name.trim()) {
      errors.crop_name = 'Crop name is mandatory *';
    }
    if (!cropForm.season) {
      errors.season = 'Season selection is mandatory *';
    }
    if (!cropForm.cultivated_area || parseFloat(cropForm.cultivated_area) <= 0) {
      errors.cultivated_area = 'Valid cultivated area is mandatory *';
    }
    if (!cropForm.growth_stage) {
      errors.growth_stage = 'Growth stage is mandatory *';
    }

    setCropErrors(errors);

    // If any mandatory field is missing, details are NOT updated
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await api.createCrop({
        ...cropForm,
        farm_id: selectedFarm.id,
        cultivated_area: parseFloat(cropForm.cultivated_area || 0)
      });
      setShowAddCrop(false);
      setCropSubmitAttempted(false);
      setCropErrors({});
      setCropForm({
        region: selectedFarm.location || 'Western Plain Zone (Gujarat)',
        season: 'Rabi',
        sowing_date: '',
        expected_harvest_date: '',
        crop_name: '',
        crop_variety: '',
        cultivated_area: '',
        growth_stage: 'Vegetative'
      });
      loadFarmDetails(selectedFarm.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      await api.addFarmActivity(selectedFarm.id, {
        ...activityForm,
        farm_id: selectedFarm.id,
        cost: parseFloat(activityForm.cost || 0)
      });
      setShowAddActivity(false);
      setActivityForm({ activity_type: 'Irrigation', activity_date: new Date().toISOString().split('T')[0], description: '', cost: '0' });
      loadFarmDetails(selectedFarm.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      await api.addFarmExpense(selectedFarm.id, {
        ...expenseForm,
        farm_id: selectedFarm.id,
        amount: parseFloat(expenseForm.amount)
      });
      setShowAddExpense(false);
      setExpenseForm({ category: 'Fertilizer', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      loadFarmDetails(selectedFarm.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalFarmExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: '#163326', fontWeight: 800 }}>Farm & Cultivation Management</h2>
          <p style={{ color: '#576c60', fontSize: '0.9rem' }}>
            Multi-farm land records, crop growth phase tracking, field operations log, and granular input accounting.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddFarm(true)}>
          <Plus size={16} /> Register New Farm
        </button>
      </div>

      {/* Farms List Tabs */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {farms.map(f => {
          const isSelected = selectedFarm?.id === f.id;
          return (
            <div
              key={f.id}
              onClick={() => setSelectedFarm(f)}
              className="glass-card"
              style={{
                padding: '16px 20px',
                minWidth: '240px',
                cursor: 'pointer',
                borderColor: isSelected ? '#163326' : 'rgba(27, 56, 43, 0.08)',
                background: isSelected ? '#eef4f0' : '#ffffff',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#163326' }}>{f.farm_name}</span>
                {isSelected && <CheckCircle size={16} color="#2d5740" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#576c60', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> {f.location}
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '0.75rem', color: '#788c80' }}>
                <span><strong style={{ color: '#163326' }}>{f.area}</strong> {f.area_unit}</span>
                <span>•</span>
                <span>{f.soil_type}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Farm Details */}
      {selectedFarm ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Crop Records & Growth Stage */}
          <div>
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#163326', fontWeight: 700 }}>Active Crop Cultivation Records</h3>
                  <p style={{ fontSize: '0.8rem', color: '#576c60' }}>Tracks phenological stages and expected harvest dates.</p>
                </div>
                <button className="btn-secondary" onClick={() => setShowAddCrop(true)}>
                  <Plus size={14} /> Add Crop
                </button>
              </div>

              {crops.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#788c80', textAlign: 'center', padding: '24px 0' }}>
                  No active crops recorded for this farm yet. Click "Add Crop" to register a cultivation batch.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {crops.map(c => (
                    <div 
                      key={c.id}
                      style={{
                        padding: '16px',
                        background: '#fcfbf8',
                        border: '1px solid rgba(27, 56, 43, 0.08)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#163326' }}>{c.crop_name}</span>
                            <span className="badge badge-emerald">{c.season}</span>
                            {c.region && (
                              <span style={{ fontSize: '0.72rem', background: '#eef4f0', color: '#2d6a4f', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                📍 {c.region}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Variety: {c.crop_variety || 'Standard Cultivar'} • Area: {c.cultivated_area || selectedFarm.area} Acres
                          </p>
                        </div>
                        <span className="badge badge-amber">{c.growth_stage}</span>
                      </div>

                      {/* Timeline steps with proper regional date format */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
                        <span>
                          <strong style={{ color: '#163326' }}>Sown Date:</strong> {formatDate(c.sowing_date, 'readable')} <span style={{ color: '#687e72' }}>({formatDate(c.sowing_date, 'regional')})</span>
                        </span>
                        <span>
                          <strong style={{ color: '#163326' }}>Expected Harvest:</strong> {formatDate(c.expected_harvest_date, 'readable')} <span style={{ color: '#687e72' }}>({formatDate(c.expected_harvest_date, 'regional')})</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Farm Activities Log */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#163326', fontWeight: 700 }}>Field Activities & Interventions</h3>
                  <p style={{ fontSize: '0.8rem', color: '#576c60' }}>Log of sowing, irrigation, fertilizer, spraying, and weeding.</p>
                </div>
                <button className="btn-secondary" onClick={() => setShowAddActivity(true)}>
                  <Plus size={14} /> Log Activity
                </button>
              </div>

              {activities.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#788c80', textAlign: 'center', padding: '16px 0' }}>
                  No activities logged yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activities.map(a => (
                    <div 
                      key={a.id}
                      style={{
                        padding: '12px 16px',
                        background: '#fcfbf8',
                        border: '1px solid rgba(27, 56, 43, 0.08)',
                        borderLeft: '3px solid #163326',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#163326' }}>{a.activity_type}</span>
                          <span style={{ fontSize: '0.74rem', color: '#788c80' }}>{a.activity_date}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#4a5c52', marginTop: '2px' }}>
                          {a.description}
                        </p>
                      </div>
                      {a.cost > 0 && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b47818' }}>
                          ₹{a.cost}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Farm Expenses Accounting */}
          <div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#163326', fontWeight: 700 }}>Input Cost & Expense Accounting</h3>
                  <p style={{ fontSize: '0.8rem', color: '#576c60' }}>Granular breakdown of operational farm inputs.</p>
                </div>
                <button className="btn-secondary" onClick={() => setShowAddExpense(true)}>
                  <Plus size={14} /> Add Expense
                </button>
              </div>

              {/* Total Rollup Banner */}
              <div style={{
                background: '#fdfbf6',
                border: '1px solid rgba(180, 120, 24, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#946d14', fontWeight: 700 }}>CUMULATIVE PLOT EXPENSES</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#163326' }}>
                    ₹{totalFarmExpenses.toLocaleString()}
                  </div>
                </div>
                <DollarSign size={28} color="#946d14" />
              </div>

              {expenses.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#788c80', textAlign: 'center', padding: '16px 0' }}>
                  No expenses recorded for this plot.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {expenses.map(exp => (
                    <div 
                      key={exp.id}
                      style={{
                        padding: '10px 14px',
                        background: '#fcfbf8',
                        border: '1px solid rgba(27, 56, 43, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#163326' }}>{exp.category}</span>
                        <p style={{ fontSize: '0.74rem', color: '#788c80' }}>{exp.description || 'Farm Input'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b47818' }}>₹{exp.amount.toLocaleString()}</span>
                        <p style={{ fontSize: '0.7rem', color: '#788c80' }}>{exp.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Add Farm */}
      {showAddFarm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 700 }}>Register New Farm Record</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#788c80' }} onClick={() => setShowAddFarm(false)} />
            </div>
            <form onSubmit={handleCreateFarm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Farm Name</label>
                <input required className="form-input" value={farmForm.farm_name} onChange={e => setFarmForm({...farmForm, farm_name: e.target.value})} placeholder="e.g. Ganga Valley Plot A" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location / Village / Coordinates</label>
                <input required className="form-input" value={farmForm.location} onChange={e => setFarmForm({...farmForm, location: e.target.value})} placeholder="e.g. Anand, Gujarat" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Area</label>
                  <input required type="number" step="0.1" className="form-input" value={farmForm.area} onChange={e => setFarmForm({...farmForm, area: e.target.value})} placeholder="10.5" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Unit</label>
                  <select className="form-select" value={farmForm.area_unit} onChange={e => setFarmForm({...farmForm, area_unit: e.target.value})}>
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Soil Type</label>
                  <select className="form-select" value={farmForm.soil_type} onChange={e => setFarmForm({...farmForm, soil_type: e.target.value})}>
                    <option value="Loamy Alluvial">Loamy Alluvial</option>
                    <option value="Black Clay Loam">Black Clay Loam</option>
                    <option value="Red Sandy">Red Sandy</option>
                    <option value="Laterite">Laterite</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Irrigation Type</label>
                  <select className="form-select" value={farmForm.irrigation_type} onChange={e => setFarmForm({...farmForm, irrigation_type: e.target.value})}>
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Tube-well">Tube-well</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddFarm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Farm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Crop with Priority Ordering & Strict Validation */}
      {showAddCrop && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', padding: '28px', background: '#ffffff', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 800, fontFamily: "'Fraunces', serif" }}>
                  Register Cultivation Batch
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#576c60' }}>
                  Please complete Priority 1 (Region) and Priority 2 (Date) first. All <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span> fields are mandatory.
                </p>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: '#788c80' }} onClick={() => { setShowAddCrop(false); setCropSubmitAttempted(false); setCropErrors({}); }} />
            </div>

            {cropSubmitAttempted && Object.keys(cropErrors).length > 0 && (
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
                  <strong>Mandatory Fields Missing:</strong> Please fill all fields marked with an asterisk (<span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>). Details will NOT be updated until required information is provided.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateCrop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* PRIORITY 1: REGION SELECTION (Must be selected first) */}
              <div style={{
                background: '#f4f8f5',
                border: cropErrors.region ? '1.5px solid #dc2626' : '1px solid rgba(45, 106, 79, 0.2)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#163326', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={14} color="#2d6a4f" />
                    <span>Priority 1: Agricultural Region / Zone</span>
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2d6a4f', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                    Select First
                  </span>
                </div>
                <select 
                  className="form-select" 
                  value={cropForm.region} 
                  onChange={e => {
                    setCropForm({...cropForm, region: e.target.value});
                    if (cropErrors.region) setCropErrors({...cropErrors, region: null});
                  }}
                  style={{ width: '100%', borderColor: cropErrors.region ? '#dc2626' : undefined }}
                >
                  <option value="Western Plain Zone (Gujarat)">Western Plain Zone (Gujarat - Anand / Vadodara)</option>
                  <option value="South Gujarat Heavy Rainfall Zone">South Gujarat Heavy Rainfall Zone (Surat / Navsari)</option>
                  <option value="Trans-Gangetic Plain (Punjab / Haryana)">Trans-Gangetic Plain (Punjab - Ludhiana / Khanna)</option>
                  <option value="Western Plateau & Hills (Maharashtra)">Western Plateau & Hills (Maharashtra - Nashik / Pune)</option>
                  <option value="Central Plateau & Hills (Madhya Pradesh)">Central Plateau & Hills (Madhya Pradesh - Indore / Ujjain)</option>
                  <option value="Upper Gangetic Plain (Western Uttar Pradesh)">Upper Gangetic Plain (Western UP - Meerut / Muzaffarnagar)</option>
                  <option value="Middle Gangetic Plain (Eastern UP / Bihar)">Middle Gangetic Plain (Eastern UP / Bihar - Varanasi / Patna)</option>
                  <option value="Western Dry Region (Rajasthan)">Western Dry Region (Rajasthan - Jaipur / Jodhpur)</option>
                  <option value="Southern Plateau & Hills (Karnataka / Telangana)">Southern Plateau & Hills (Karnataka / Telangana)</option>
                  <option value="East Coast Plains & Hills (Andhra Pradesh / Odisha)">East Coast Plains & Hills (Andhra Pradesh / Odisha)</option>
                  <option value="Southern Coastal Zone (Tamil Nadu / Kerala)">Southern Coastal Zone (Tamil Nadu / Kerala)</option>
                  <option value="Lower Gangetic Plain (West Bengal)">Lower Gangetic Plain (West Bengal - Burdwan / Hooghly)</option>
                </select>
                {cropErrors.region && (
                  <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>{cropErrors.region}</p>
                )}
              </div>

              {/* PRIORITY 2: CROPPING DATES (DD/MM/YYYY Format) */}
              <div style={{
                background: '#faf9f5',
                border: (cropErrors.sowing_date || cropErrors.expected_harvest_date) ? '1.5px solid #dc2626' : '1px solid rgba(27, 56, 43, 0.1)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#163326', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#b47818" />
                    <span>Priority 2: Cultivation Dates</span>
                    <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#687e72', fontWeight: 600 }}>
                    Format: DD/MM/YYYY
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#4a5c52', fontWeight: 600 }}>
                      Sowing Date <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={cropForm.sowing_date} 
                      onChange={e => {
                        setCropForm({...cropForm, sowing_date: e.target.value});
                        if (cropErrors.sowing_date) setCropErrors({...cropErrors, sowing_date: null});
                      }}
                      style={{ borderColor: cropErrors.sowing_date ? '#dc2626' : undefined }}
                    />
                    {cropForm.sowing_date ? (
                      <span style={{ fontSize: '0.7rem', color: '#2d6a4f', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                        📅 {formatDate(cropForm.sowing_date, 'regional')} ({formatDate(cropForm.sowing_date, 'readable')})
                      </span>
                    ) : (
                      cropErrors.sowing_date && (
                        <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{cropErrors.sowing_date}</p>
                      )
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: '#4a5c52', fontWeight: 600 }}>
                      Expected Harvest <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={cropForm.expected_harvest_date} 
                      onChange={e => {
                        setCropForm({...cropForm, expected_harvest_date: e.target.value});
                        if (cropErrors.expected_harvest_date) setCropErrors({...cropErrors, expected_harvest_date: null});
                      }}
                      style={{ borderColor: cropErrors.expected_harvest_date ? '#dc2626' : undefined }}
                    />
                    {cropForm.expected_harvest_date ? (
                      <span style={{ fontSize: '0.7rem', color: '#2d6a4f', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                        🌾 {formatDate(cropForm.expected_harvest_date, 'regional')} ({formatDate(cropForm.expected_harvest_date, 'readable')})
                      </span>
                    ) : (
                      cropErrors.expected_harvest_date && (
                        <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{cropErrors.expected_harvest_date}</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* PRIORITY 3: CROP NAME & AGRONOMIC ATTRIBUTES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>
                    Crop Name <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <input 
                    className="form-input" 
                    value={cropForm.crop_name} 
                    onChange={e => {
                      setCropForm({...cropForm, crop_name: e.target.value});
                      if (cropErrors.crop_name) setCropErrors({...cropErrors, crop_name: null});
                    }} 
                    placeholder="e.g. Wheat, Tomato, Soybean, Cotton" 
                    style={{ borderColor: cropErrors.crop_name ? '#dc2626' : undefined }}
                  />
                  {cropErrors.crop_name && (
                    <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{cropErrors.crop_name}</p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>
                    Cropping Season <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <select 
                    className="form-select" 
                    value={cropForm.season} 
                    onChange={e => setCropForm({...cropForm, season: e.target.value})}
                  >
                    <option value="Rabi">Rabi (Winter Season)</option>
                    <option value="Kharif">Kharif (Monsoon Season)</option>
                    <option value="Zaid">Zaid (Summer Season)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Variety / Cultivar</label>
                <input 
                  className="form-input" 
                  value={cropForm.crop_variety} 
                  onChange={e => setCropForm({...cropForm, crop_variety: e.target.value})} 
                  placeholder="e.g. HD-3226, Sharbati, Pusa Basmati" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>
                    Cultivated Area (Acres) <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={cropForm.cultivated_area} 
                    onChange={e => {
                      setCropForm({...cropForm, cultivated_area: e.target.value});
                      if (cropErrors.cultivated_area) setCropErrors({...cropErrors, cultivated_area: null});
                    }} 
                    placeholder="e.g. 5.0" 
                    style={{ borderColor: cropErrors.cultivated_area ? '#dc2626' : undefined }}
                  />
                  {cropErrors.cultivated_area && (
                    <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', fontWeight: 600 }}>{cropErrors.cultivated_area}</p>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>
                    Growth Stage <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>
                  </label>
                  <select 
                    className="form-select" 
                    value={cropForm.growth_stage} 
                    onChange={e => setCropForm({...cropForm, growth_stage: e.target.value})}
                  >
                    <option value="Sowing">Sowing</option>
                    <option value="Germination">Germination</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturity">Maturity</option>
                    <option value="Harvesting">Harvesting</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(27, 56, 43, 0.08)' }}>
                <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600 }}>
                  * All fields marked with asterisk are mandatory
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => { setShowAddCrop(false); setCropSubmitAttempted(false); setCropErrors({}); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Register Crop Batch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Activity */}
      {showAddActivity && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '28px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 700 }}>Log Field Activity</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#788c80' }} onClick={() => setShowAddActivity(false)} />
            </div>
            <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Activity Type</label>
                <select className="form-select" value={activityForm.activity_type} onChange={e => setActivityForm({...activityForm, activity_type: e.target.value})}>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Fertilizer">Fertilizer Application</option>
                  <option value="Pesticide">Pesticide / Fungicide</option>
                  <option value="Weeding">Weeding</option>
                  <option value="Inspection">Field Inspection</option>
                  <option value="Harvesting">Harvesting</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Date</label>
                <input type="date" required className="form-input" value={activityForm.activity_date} onChange={e => setActivityForm({...activityForm, activity_date: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Description</label>
                <textarea className="form-textarea" rows="3" value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} placeholder="Details of application, dosage, notes..." />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Operational Cost (₹)</label>
                <input type="number" step="10" className="form-input" value={activityForm.cost} onChange={e => setActivityForm({...activityForm, cost: e.target.value})} placeholder="0" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddActivity(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Expense */}
      {showAddExpense && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '28px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 700 }}>Record Input Expense</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#788c80' }} onClick={() => setShowAddExpense(false)} />
            </div>
            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Expense Category</label>
                <select className="form-select" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Crop Protection">Crop Protection (Fungicides/Pesticides)</option>
                  <option value="Irrigation">Irrigation / Electricity</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment / Tractor Rental</option>
                  <option value="Transport">Transport / Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Amount (₹)</label>
                <input type="number" step="10" required className="form-input" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} placeholder="e.g. 4500" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Date</label>
                <input type="date" required className="form-input" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Receipt / Vendor Notes</label>
                <input className="form-input" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="e.g. 5 bags of Urea from Kisan Center" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddExpense(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
