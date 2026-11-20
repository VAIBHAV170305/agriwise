import React, { useState, useEffect } from 'react';
import { 
  Plus, MapPin, Layers, Droplets, Calendar, DollarSign, 
  Trash2, Edit, CheckCircle, ChevronRight, X, Sprout
} from 'lucide-react';
import { api } from '../api';

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
    crop_name: '', crop_variety: '', sowing_date: '', expected_harvest_date: '', cultivated_area: '', season: 'Rabi', growth_stage: 'Vegetative'
  });
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
    try {
      await api.createCrop({
        ...cropForm,
        farm_id: selectedFarm.id,
        cultivated_area: parseFloat(cropForm.cultivated_area || 0)
      });
      setShowAddCrop(false);
      setCropForm({ crop_name: '', crop_variety: '', sowing_date: '', expected_harvest_date: '', cultivated_area: '', season: 'Rabi', growth_stage: 'Vegetative' });
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
          <p style={{ color: '#576c60', fontSize: '0.85rem', marginTop: '2px' }}>
            Manage land plots, active crops, and field operations.
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#163326' }}>{c.crop_name}</span>
                            <span className="badge badge-emerald">{c.season}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Variety: {c.crop_variety || 'Standard Cultivar'} • Area: {c.cultivated_area || selectedFarm.area} Acres
                          </p>
                        </div>
                        <span className="badge badge-amber">{c.growth_stage}</span>
                      </div>

                      {/* Timeline steps */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Sown: {c.sowing_date || 'N/A'}</span>
                        <span>Expected Harvest: {c.expected_harvest_date || 'N/A'}</span>
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

      {/* Modal: Add Crop */}
      {showAddCrop && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(22, 51, 38, 0.45)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '28px', background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#163326', fontWeight: 700 }}>Add Crop Record</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#788c80' }} onClick={() => setShowAddCrop(false)} />
            </div>
            <form onSubmit={handleCreateCrop} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Crop Name</label>
                <input required className="form-input" value={cropForm.crop_name} onChange={e => setCropForm({...cropForm, crop_name: e.target.value})} placeholder="e.g. Wheat, Tomato, Soybean" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Variety / Cultivar</label>
                <input className="form-input" value={cropForm.crop_variety} onChange={e => setCropForm({...cropForm, crop_variety: e.target.value})} placeholder="e.g. HD-3226, Sharbati" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Sowing Date</label>
                  <input type="date" className="form-input" value={cropForm.sowing_date} onChange={e => setCropForm({...cropForm, sowing_date: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Expected Harvest</label>
                  <input type="date" className="form-input" value={cropForm.expected_harvest_date} onChange={e => setCropForm({...cropForm, expected_harvest_date: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Season</label>
                  <select className="form-select" value={cropForm.season} onChange={e => setCropForm({...cropForm, season: e.target.value})}>
                    <option value="Rabi">Rabi</option>
                    <option value="Kharif">Kharif</option>
                    <option value="Zaid">Zaid</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#4a5c52', fontWeight: 600 }}>Growth Stage</label>
                  <select className="form-select" value={cropForm.growth_stage} onChange={e => setCropForm({...cropForm, growth_stage: e.target.value})}>
                    <option value="Sowing">Sowing</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddCrop(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Crop</button>
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
