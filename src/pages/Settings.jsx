import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Check, X } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings');
      let data = response.data.data;
      
      // Ensure defaults if old schema is present
      if (data.plans && data.plans.length > 0 && !data.plans[0].features[0]?.name) {
        // Upgrade legacy features string array to objects
        data.plans = data.plans.map(p => ({
          ...p,
          period: p.period || 'per month',
          badge: p.badge || '',
          discount: p.discount || '',
          features: p.features.map(f => typeof f === 'string' ? { name: f, included: true } : f)
        }));
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ text: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await axios.put('http://localhost:5000/api/settings', settings);
      setMessage({ text: 'Settings saved successfully', type: 'success' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handlePlanChange = (field, value) => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    newPlans[selectedPlanIndex] = { ...newPlans[selectedPlanIndex], [field]: value };
    setSettings(prev => ({ ...prev, plans: newPlans }));
  };

  const handleFeatureChange = (fIndex, field, value) => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    const newFeatures = [...newPlans[selectedPlanIndex].features];
    newFeatures[fIndex] = { ...newFeatures[fIndex], [field]: value };
    newPlans[selectedPlanIndex] = { ...newPlans[selectedPlanIndex], features: newFeatures };
    setSettings(prev => ({ ...prev, plans: newPlans }));
  };

  const addFeature = () => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    newPlans[selectedPlanIndex].features.push({ name: 'New Feature', included: true });
    setSettings(prev => ({ ...prev, plans: newPlans }));
  };

  const removeFeature = (fIndex) => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    newPlans[selectedPlanIndex].features.splice(fIndex, 1);
    setSettings(prev => ({ ...prev, plans: newPlans }));
  };

  const addPlan = () => {
    // Determine the type that is not yet full, prefer yearly
    const yearlyCount = settings.plans.filter(p => !p.type || p.type === 'yearly').length;
    const monthlyCount = settings.plans.filter(p => p.type === 'monthly').length;

    let defaultType = 'yearly';
    if (yearlyCount >= 3) {
      if (monthlyCount >= 3) {
        alert("Maximum limit reached: You can only create up to 3 Yearly and 3 Monthly plans.");
        return;
      }
      defaultType = 'monthly';
    }

    const newPlan = {
      id: `plan_${Date.now()}`,
      name: 'NEW PLAN',
      price: '₦0',
      period: 'per month',
      badge: '',
      discount: '',
      revenueCatId: '',
      type: defaultType,
      features: [{ name: 'New Feature', included: true }]
    };
    setSettings(prev => ({ ...prev, plans: [...(prev.plans || []), newPlan] }));
    setSelectedPlanIndex(settings.plans ? settings.plans.length : 0);
  };

  const removePlan = () => {
    if (selectedPlanIndex === null) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmDelete) return;

    const newPlans = [...settings.plans];
    newPlans.splice(selectedPlanIndex, 1);
    setSettings(prev => ({ ...prev, plans: newPlans }));
    setSelectedPlanIndex(null);
  };

  if (loading) return <div className="loading">Loading settings...</div>;
  if (!settings) return <div className="empty-state">No settings found.</div>;

  const selectedPlan = selectedPlanIndex !== null ? settings.plans[selectedPlanIndex] : null;

  return (
    <div className="settings-container">
      <div className="page-header">
        <h2>Plan Management</h2>
        <button onClick={handleSave} disabled={saving} className="save-btn">
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Free Tier Limits */}
      <div className="settings-section">
        <h3>Free Tier General Limits</h3>
        <div className="limits-grid">
          <div className="form-group">
            <label>AI Chapter Analyzer Uses:</label>
            <input
              type="number"
              name="aiAnalyzerFreeLimit"
              value={settings.aiAnalyzerFreeLimit || 0}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>AI Smart Edit Suite Uses:</label>
            <input
              type="number"
              name="smartEditFreeLimit"
              value={settings.smartEditFreeLimit || 0}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header-flex">
          <div>
            <h3>Subscription Plans Manager</h3>
            <p className="section-desc">Click on a plan card below to edit its details and features.</p>
          </div>
          <button onClick={addPlan} className="add-plan-btn">
            <Plus size={16} /> Add New Plan
          </button>
        </div>
        
        {/* Pricing Cards Preview Grid */}
        <div className="plans-grid">
          {settings.plans && settings.plans.map((plan, index) => (
            <div 
              key={plan.id} 
              className={`plan-card-preview ${selectedPlanIndex === index ? 'selected' : ''} ${plan.badge ? 'has-badge' : ''}`}
              onClick={() => setSelectedPlanIndex(index)}
            >
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <div className="plan-header-preview">
                <h4>{plan.name}</h4>
                <div className="price-preview">{plan.price}</div>
                <div className="period-preview">{plan.period}</div>
                {plan.discount && <div className="discount-preview">{plan.discount}</div>}
              </div>
              <div className="features-preview">
                {plan.features.slice(0, 4).map((f, i) => (
                  <div key={i} className={`feature-item ${!f.included ? 'not-included' : ''}`}>
                    {f.included ? '✓' : '✗'} {f.name}
                  </div>
                ))}
                {plan.features.length > 4 && <div className="feature-item more">+{plan.features.length - 4} more features</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Plan Editor */}
      {selectedPlan && (
        <div className="settings-section plan-editor animate-fade-in">
          <div className="editor-header">
            <h3>Editing: {selectedPlan.name}</h3>
            <div className="editor-actions">
              <button className="remove-plan-btn" onClick={removePlan} title="Delete Plan">
                <Trash2 size={18} />
              </button>
              <button className="close-editor-btn" onClick={() => setSelectedPlanIndex(null)}>
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="editor-grid">
            <div className="form-group">
              <label>Plan Name</label>
              <input type="text" value={selectedPlan.name} onChange={(e) => handlePlanChange('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Price Display (e.g. ₦24,900)</label>
              <input type="text" value={selectedPlan.price} onChange={(e) => handlePlanChange('price', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Billing Period (e.g. every 6 months)</label>
              <input type="text" value={selectedPlan.period || ''} onChange={(e) => handlePlanChange('period', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Badge Text (e.g. BEST VALUE)</label>
              <input type="text" value={selectedPlan.badge || ''} onChange={(e) => handlePlanChange('badge', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Discount Text (e.g. Save 40% vs monthly)</label>
              <input type="text" value={selectedPlan.discount || ''} onChange={(e) => handlePlanChange('discount', e.target.value)} />
            </div>
            <div className="form-group">
              <label>RevenueCat Package ID</label>
              <input type="text" value={selectedPlan.revenueCatId || ''} onChange={(e) => handlePlanChange('revenueCatId', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Plan Type</label>
              <select 
                value={selectedPlan.type || 'yearly'} 
                onChange={(e) => {
                  const newType = e.target.value;
                  const currentTypeCount = settings.plans.filter(p => (p.type || 'yearly') === newType).length;
                  if (currentTypeCount >= 3) {
                    alert(`You can only have a maximum of 3 ${newType} plans.`);
                    return;
                  }
                  handlePlanChange('type', newType);
                }}
                style={{ padding: '10px', borderRadius: '8px', background: '#242424', color: '#F0EBE0', border: '1px solid #333' }}
              >
                <option value="yearly">Yearly / Main</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="features-manager mt-6">
            <div className="features-header">
              <h4>Plan Features</h4>
              <button className="add-feature-btn" onClick={addFeature}>
                <Plus size={16} /> Add Feature
              </button>
            </div>
            
            <div className="features-list">
              {selectedPlan.features.map((feature, idx) => (
                <div key={idx} className="feature-edit-row">
                  <div className="feature-toggle" onClick={() => handleFeatureChange(idx, 'included', !feature.included)}>
                    {feature.included ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                  </div>
                  <input 
                    type="text" 
                    value={feature.name} 
                    onChange={(e) => handleFeatureChange(idx, 'name', e.target.value)}
                    placeholder="Feature description"
                    className="feature-input"
                  />
                  <button className="remove-feature-btn" onClick={() => removeFeature(idx)} title="Remove Feature">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
