import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import api from '../services/api';
import './Settings.css';

const WORLD_TABS = [
  { id: 'writer', label: 'Writer', icon: '✍️' },
  { id: 'screenwriter', label: 'Script', icon: '🎬' },
  { id: 'student', label: 'Student', icon: '🎓' },
];

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [activeWorld, setActiveWorld] = useState('writer');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      let data = response.data.data;

      if (data.plans && data.plans.length > 0) {
        data.plans = data.plans.map((p) => ({
          ...p,
          world: p.world || 'writer',
          period: p.period || 'per month',
          badge: p.badge || '',
          discount: p.discount || '',
          cta: p.cta || '',
          features: (p.features || []).map((f) =>
            typeof f === 'string' ? { name: f, included: true } : f
          ),
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

  const worldPlanEntries = useMemo(() => {
    if (!settings?.plans) return [];
    return settings.plans
      .map((plan, index) => ({ plan, index }))
      .filter(({ plan }) => (plan.world || 'writer') === activeWorld);
  }, [settings, activeWorld]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/settings', settings);
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
      [name]: Number(value),
    }));
  };

  const handlePlanChange = (field, value) => {
    if (selectedPlanIndex === null) return;
    setSettings((prev) => {
      const newPlans = [...prev.plans];
      newPlans[selectedPlanIndex] = { ...newPlans[selectedPlanIndex], [field]: value };
      return { ...prev, plans: newPlans };
    });
  };

  const handlePlanPatch = (patch) => {
    if (selectedPlanIndex === null) return;
    setSettings((prev) => {
      const newPlans = [...prev.plans];
      newPlans[selectedPlanIndex] = { ...newPlans[selectedPlanIndex], ...patch };
      return { ...prev, plans: newPlans };
    });
  };

  const handleFeatureChange = (fIndex, field, value) => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    const newFeatures = [...newPlans[selectedPlanIndex].features];
    newFeatures[fIndex] = { ...newFeatures[fIndex], [field]: value };
    newPlans[selectedPlanIndex] = { ...newPlans[selectedPlanIndex], features: newFeatures };
    setSettings((prev) => ({ ...prev, plans: newPlans }));
  };

  const addFeature = () => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    newPlans[selectedPlanIndex].features.push({ name: 'New Feature', included: true });
    setSettings((prev) => ({ ...prev, plans: newPlans }));
  };

  const removeFeature = (fIndex) => {
    if (selectedPlanIndex === null) return;
    const newPlans = [...settings.plans];
    newPlans[selectedPlanIndex].features.splice(fIndex, 1);
    setSettings((prev) => ({ ...prev, plans: newPlans }));
  };

  const addPlan = () => {
    const worldPlans = (settings.plans || []).filter((p) => (p.world || 'writer') === activeWorld);
    const yearlyCount = worldPlans.filter((p) => !p.isFree && (!p.type || p.type === 'yearly')).length;
    const monthlyCount = worldPlans.filter((p) => p.type === 'monthly').length;

    let defaultType = 'yearly';
    if (yearlyCount >= 3) {
      if (monthlyCount >= 3) {
        alert('Maximum limit reached for this world: up to 3 Yearly and 3 Monthly plans.');
        return;
      }
      defaultType = 'monthly';
    }

    const prefix = activeWorld === 'writer' ? '' : `${activeWorld}-`;
    const newPlan = {
      id: `${prefix}plan_${Date.now()}`,
      world: activeWorld,
      name: 'NEW PLAN',
      price: '₦0',
      priceAmount: 0,
      currency: 'ngn',
      durationDays: defaultType === 'monthly' ? 30 : 365,
      period: defaultType === 'monthly' ? 'per month' : 'per year',
      badge: '',
      discount: '',
      cta: 'Get Access',
      revenueCatId: '',
      stripePriceId: '',
      type: defaultType,
      isFree: false,
      unlimitedAnalyzer: true,
      unlimitedSmartEdit: true,
      ghostWriter: false,
      wealthEngine: false,
      features: [{ name: 'New Feature', included: true }],
    };
    setSettings((prev) => ({ ...prev, plans: [...(prev.plans || []), newPlan] }));
    setSelectedPlanIndex(settings.plans ? settings.plans.length : 0);
  };

  const removePlan = () => {
    if (selectedPlanIndex === null) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this plan?');
    if (!confirmDelete) return;

    const newPlans = [...settings.plans];
    newPlans.splice(selectedPlanIndex, 1);
    setSettings((prev) => ({ ...prev, plans: newPlans }));
    setSelectedPlanIndex(null);
  };

  const switchWorld = (worldId) => {
    setActiveWorld(worldId);
    setSelectedPlanIndex(null);
  };

  if (loading) return <div className="loading">Loading settings...</div>;
  if (!settings) return <div className="empty-state">No settings found.</div>;

  const selectedPlan = selectedPlanIndex !== null ? settings.plans[selectedPlanIndex] : null;
  const activeTab = WORLD_TABS.find((t) => t.id === activeWorld);

  return (
    <div className="settings-container">
      <div className="page-header">
        <h2>Plan Management</h2>
        <button onClick={handleSave} disabled={saving} className="save-btn">
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

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
            <p className="section-desc">
              Switch worlds below. Each world has its own plans that power that world&apos;s pricing page.
            </p>
          </div>
          <button onClick={addPlan} className="add-plan-btn">
            <Plus size={16} /> Add {activeTab?.label} Plan
          </button>
        </div>

        <div className="world-plan-tabs">
          {WORLD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`world-plan-tab ${activeWorld === tab.id ? 'active' : ''}`}
              onClick={() => switchWorld(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <p className="section-desc" style={{ marginTop: 12 }}>
          Editing <strong>{activeTab?.label}</strong> plans ({worldPlanEntries.length})
        </p>

        <div className="plans-grid">
          {worldPlanEntries.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              No plans for this world yet. Click Add Plan or run the seeder.
            </div>
          )}
          {worldPlanEntries.map(({ plan, index }) => (
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
                {(plan.features || []).slice(0, 4).map((f, i) => (
                  <div key={i} className={`feature-item ${!f.included ? 'not-included' : ''}`}>
                    {f.included ? '✓' : '✗'} {f.name}
                  </div>
                ))}
                {(plan.features || []).length > 4 && (
                  <div className="feature-item more">+{plan.features.length - 4} more features</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <div className="settings-section plan-editor animate-fade-in">
          <div className="editor-header">
            <h3>
              Editing: {selectedPlan.name}{' '}
              <span style={{ color: '#909090', fontSize: 14 }}>
                ({selectedPlan.world || 'writer'})
              </span>
            </h3>
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
              <label>Plan ID (used by Stripe / app)</label>
              <input type="text" value={selectedPlan.id} onChange={(e) => handlePlanChange('id', e.target.value)} />
            </div>
            <div className="form-group">
              <label>World</label>
              <select
                value={selectedPlan.world || 'writer'}
                onChange={(e) => handlePlanChange('world', e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', background: '#242424', color: '#F0EBE0', border: '1px solid #333', width: '100%' }}
              >
                {WORLD_TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Plan Name</label>
              <input type="text" value={selectedPlan.name} onChange={(e) => handlePlanChange('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Price Display (e.g. ₦24,900)</label>
              <input type="text" value={selectedPlan.price} onChange={(e) => handlePlanChange('price', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Charge Amount (naira, no symbol)</label>
              <input
                type="number"
                min="0"
                value={selectedPlan.priceAmount || 0}
                onChange={(e) => handlePlanChange('priceAmount', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <input
                type="text"
                value={selectedPlan.currency || 'ngn'}
                onChange={(e) => handlePlanChange('currency', e.target.value.toLowerCase())}
              />
            </div>
            <div className="form-group">
              <label>Duration (days)</label>
              <input
                type="number"
                min="0"
                value={selectedPlan.durationDays || 0}
                onChange={(e) => handlePlanChange('durationDays', Number(e.target.value))}
              />
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
              <label>Discount Text</label>
              <input type="text" value={selectedPlan.discount || ''} onChange={(e) => handlePlanChange('discount', e.target.value)} />
            </div>
            <div className="form-group">
              <label>CTA Button Label</label>
              <input type="text" value={selectedPlan.cta || ''} onChange={(e) => handlePlanChange('cta', e.target.value)} placeholder="Get Access" />
            </div>
            <div className="form-group">
              <label>Stripe Price ID (optional)</label>
              <input
                type="text"
                value={selectedPlan.stripePriceId || ''}
                onChange={(e) => handlePlanChange('stripePriceId', e.target.value)}
                placeholder="price_..."
              />
            </div>
            <div className="form-group">
              <label>RevenueCat Package ID</label>
              <input
                type="text"
                value={selectedPlan.revenueCatId || ''}
                onChange={(e) => handlePlanChange('revenueCatId', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Plan Type</label>
              <select
                value={selectedPlan.isFree ? 'free' : selectedPlan.type || 'yearly'}
                onChange={(e) => {
                  const newType = e.target.value;
                  if (newType === 'free') {
                    handlePlanPatch({
                      type: 'free',
                      isFree: true,
                      priceAmount: 0,
                      durationDays: 0,
                    });
                    return;
                  }
                  const currentTypeCount = worldPlanEntries.filter(
                    ({ plan }) => !plan.isFree && (plan.type || 'yearly') === newType
                  ).length;
                  if (currentTypeCount >= 3) {
                    alert(`You can only have a maximum of 3 ${newType} plans in this world.`);
                    return;
                  }
                  handlePlanPatch({ type: newType, isFree: false });
                }}
                style={{ padding: '10px', borderRadius: '8px', background: '#242424', color: '#F0EBE0', border: '1px solid #333', width: '100%' }}
              >
                <option value="free">Free</option>
                <option value="yearly">Yearly / Main</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="features-manager mt-6">
            <div className="features-header">
              <h4>Paid Feature Flags</h4>
            </div>
            <div className="flag-grid">
              {[
                ['unlimitedAnalyzer', 'Unlimited chapter analyzer'],
                ['unlimitedSmartEdit', 'Unlimited Smart Edit'],
                ['ghostWriter', 'AI Ghost Writer'],
                ['wealthEngine', 'WEALTH Engine'],
              ].map(([field, label]) => (
                <label key={field} className="flag-row">
                  <input
                    type="checkbox"
                    checked={!!selectedPlan[field]}
                    onChange={(e) => handlePlanChange(field, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
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
                  <div
                    className="feature-toggle"
                    onClick={() => handleFeatureChange(idx, 'included', !feature.included)}
                  >
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
