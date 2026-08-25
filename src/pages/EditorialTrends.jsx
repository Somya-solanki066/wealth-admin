import { useState, useEffect } from 'react';
import { trendsService } from '../services/trendsService';
import './EditorialTrends.css';

const EditorialTrends = () => {
  const [platform, setPlatform] = useState('GoodNovel');
  const [hotTropes, setHotTropes] = useState('');
  const [acquiringNow, setAcquiringNow] = useState('');
  const [avoid, setAvoid] = useState('');
  const [policyChanges, setPolicyChanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const platforms = [
    'GoodNovel',
    'PocketFM',
    'Dreame',
    'MegaNovel',
    'WebNovel',
    'AlphaNovel',
    'Letterlux',
    'Stary',
    'NovelSnack'
  ];

  useEffect(() => {
    loadTrends();
  }, [platform]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const response = await trendsService.getTrends(platform);
      if (response && response.success && response.data) {
        const data = response.data;
        setHotTropes(data.hotTropes || '');
        setAcquiringNow(data.acquiringNow || '');
        setAvoid(data.avoid || '');
        setPolicyChanges(data.policyChanges || '');
      } else {
        clearForm();
      }
    } catch (error) {
      console.error('Failed to load editorial trends:', error);
      clearForm();
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setHotTropes('');
    setAcquiringNow('');
    setAvoid('');
    setPolicyChanges('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await trendsService.updateTrends(platform, {
        hotTropes,
        acquiringNow,
        avoid,
        policyChanges
      });
      alert(`Successfully saved editorial trends updates for ${platform}! ✓`);
    } catch (error) {
      console.error('Failed to save trends:', error);
      alert('Failed to save editorial trends.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editorial-trends-page">
      <div className="page-header">
        <h2>Editorial Trends Manager</h2>
        <p>Update hot tropes, active acquisitions, oversaturated topics, and policy updates per platform dynamically injected into the AI system prompts.</p>
      </div>

      <div className="info-banner" style={{ marginTop: '16px' }}>
        <strong>Pro-tip:</strong> When saved, these details are instantly appended as a <strong>CURRENT TRENDS UPDATE</strong> section to the corresponding platform's AI system prompt. Writers analyzing their manuscripts will receive direct feedback based on these settings.
      </div>

      <form onSubmit={handleSave} className="trends-form">
        <div className="form-group">
          <label>Select Serialization Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ color: '#c9a84c', fontSize: '13px', padding: '20px 0' }}>Loading platform trends...</div>
        ) : (
          <>
            <div className="form-group">
              <label>Current Hot Tropes</label>
              <input
                type="text"
                value={hotTropes}
                onChange={(e) => setHotTropes(e.target.value)}
                placeholder="e.g. Divorce Countdown, Pregnancy Secret Baby, Rejected Mate"
              />
            </div>

            <div className="form-group">
              <label>Active Acquisitions (What editors are buying now)</label>
              <textarea
                rows={4}
                value={acquiringNow}
                onChange={(e) => setAcquiringNow(e.target.value)}
                placeholder="Describe current buying criteria or active search requirements..."
              />
            </div>

            <div className="form-group">
              <label>Avoid / Oversaturated Topics</label>
              <textarea
                rows={4}
                value={avoid}
                onChange={(e) => setAvoid(e.target.value)}
                placeholder="Topics that are currently oversaturated and rejected by default..."
              />
            </div>

            <div className="form-group">
              <label>Policy Changes & Custom Guidelines</label>
              <textarea
                rows={4}
                value={policyChanges}
                onChange={(e) => setPolicyChanges(e.target.value)}
                placeholder="Any active contract terms adjustments, platform updates or specific guidelines..."
              />
            </div>

            <button type="submit" disabled={saving} className="save-btn">
              {saving ? 'Saving changes...' : 'Save Trends Config'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default EditorialTrends;
