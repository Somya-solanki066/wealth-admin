import { useEffect, useState, useRef } from 'react';
import {
  MdPerson,
  MdVerifiedUser,
  MdMenuBook,
  MdShare,
  MdSave,
  MdCloudUpload,
  MdDelete,
  MdAdd,
  MdCheckCircle,
} from 'react-icons/md';
import { aboutService } from '../services/aboutService';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import './AboutInk2Wealth.css';

const DEFAULT_STATE = {
  founderTitle: 'Meet the founder',
  founderText:
    'Coach Victor Daniels is a creative director who writes. Serial fiction writer, writing coach and founder of WIT-WEB Academy.',
  founderStory: '',
  founderPhoto0: '',
  founderPhoto1: '',
  founderCta: 'Read his story',

  companyTitle: 'Ink to Wealth Media Limited',
  companyBadge: 'Registered with the CAC',
  companyText:
    'Ink2Wealth is owned and run by Ink to Wealth Media Limited, a company registered with the CAC.',
  companyRc: '',
  companyCertificateUrl: '',
  companyCta: 'View certificate',

  bookShelf: 'My Bookshelf',
  bookTitle: 'Coleric Charles',
  bookKind: 'Ebook',
  bookText: 'A new ebook by Coach Victor Daniels.',
  bookCoverUrl: '',

  socials: [
    {
      platform: 'youtube',
      title: 'YouTube',
      text: '@CoachVictorDaniels. Free writing lessons.',
      url: 'https://www.youtube.com/@CoachVictorDaniels',
      cta: 'Watch',
    },
    {
      platform: 'tiktok',
      title: 'TikTok',
      text: '@CoachVictorDaniels. Quick tips and behind the scenes.',
      url: 'https://www.tiktok.com/@CoachVictorDaniels',
      cta: 'Follow',
    },
    {
      platform: 'instagram',
      title: 'Instagram',
      text: '@coachvictorbolum. Updates from the writing life.',
      url: 'https://www.instagram.com/coachvictorbolum',
      cta: 'Follow',
    },
    {
      platform: 'facebook',
      title: 'Facebook',
      text: 'Join the Ink2Wealth community.',
      url: 'https://www.facebook.com/ink2wealth',
      cta: 'Follow',
    },
    {
      platform: 'linkedin',
      title: 'LinkedIn',
      text: 'Connect with Coach Victor and the company.',
      url: 'https://www.linkedin.com/in/coachvictordaniels',
      cta: 'Connect',
    },
  ],
};

export default function AboutInk2Wealth() {
  const [data, setData] = useState(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState('founder');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const fileInputRef = useRef(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const res = await aboutService.getAbout();
      if (res) {
        setData({
          ...DEFAULT_STATE,
          ...res,
          socials: Array.isArray(res.socials) && res.socials.length > 0 ? res.socials : DEFAULT_STATE.socials,
        });
      }
    } catch (err) {
      console.error('Failed to load About Ink2Wealth data:', err);
      showAlert('Failed to load data from server. Using defaults.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (index, field, value) => {
    setData((prev) => {
      const updated = [...prev.socials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socials: updated };
    });
  };

  const handleAddSocial = () => {
    setData((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        {
          platform: 'custom',
          title: 'New Social',
          text: 'Connect with us',
          url: 'https://',
          cta: 'Visit',
        },
      ],
    }));
  };

  const handleRemoveSocial = (index) => {
    setData((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  };

  const triggerUpload = (targetField) => {
    setCurrentUploadTarget(targetField);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTarget) return;

    setUploadingField(currentUploadTarget);
    try {
      const res = await aboutService.uploadImage(file);
      const url = res.url || res.fileUrl;
      if (url) {
        handleChange(currentUploadTarget, url);
        showAlert(`Image uploaded successfully!`);
      } else {
        showAlert('Failed to get uploaded file URL.', 'error');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showAlert(err.response?.data?.error || 'Failed to upload image.', 'error');
    } finally {
      setUploadingField(null);
      setCurrentUploadTarget(null);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await aboutService.updateAbout(data);
      showAlert('About Ink2Wealth section updated successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      showAlert(err.response?.data?.error || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="about-ink2wealth-page">
        <div className="page-header">
          <div>
            <h1>About Ink2Wealth</h1>
            <p className="page-subtitle">Loading content from server...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-ink2wealth-page">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="page-header">
        <div>
          <h1>About Ink2Wealth Management</h1>
          <p className="page-subtitle">
            Manage the dynamic founder story, certificate, bookshelf and social links displayed in the mobile app.
          </p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <MdSave size={18} />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      {alert.show && (
        <div className={`alert ${alert.type}`}>
          {alert.type === 'success' ? '✔ ' : '✘ '}
          {alert.message}
        </div>
      )}

      {/* Tabs */}
      <div className="about-tabs">
        <button
          type="button"
          className={`about-tab-btn ${activeTab === 'founder' ? 'active' : ''}`}
          onClick={() => setActiveTab('founder')}
        >
          <MdPerson size={18} />
          Meet the Founder
        </button>
        <button
          type="button"
          className={`about-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <MdVerifiedUser size={18} />
          CAC Certificate & Company
        </button>
        <button
          type="button"
          className={`about-tab-btn ${activeTab === 'bookshelf' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookshelf')}
        >
          <MdMenuBook size={18} />
          My Bookshelf
        </button>
        <button
          type="button"
          className={`about-tab-btn ${activeTab === 'socials' ? 'active' : ''}`}
          onClick={() => setActiveTab('socials')}
        >
          <MdShare size={18} />
          Social Media Links
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* TAB 1: FOUNDER */}
        {activeTab === 'founder' && (
          <div className="about-card">
            <div className="about-card-title">
              <MdPerson size={22} />
              <span>Founder Card & "Read his story" Screen</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Founder Card Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.founderTitle}
                  onChange={(e) => handleChange('founderTitle', e.target.value)}
                  placeholder="e.g. Meet the founder"
                />
                <span className="hint">Heading shown on the navy blue card in the mobile app.</span>
              </div>
              <div className="form-group">
                <label>Button CTA Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.founderCta}
                  onChange={(e) => handleChange('founderCta', e.target.value)}
                  placeholder="e.g. Read his story"
                />
                <span className="hint">Button that opens the full story page.</span>
              </div>
            </div>

            <div className="form-group">
              <label>Short Bio (Card Preview Text)</label>
              <textarea
                className="form-textarea"
                value={data.founderText}
                onChange={(e) => handleChange('founderText', e.target.value)}
                placeholder="Brief intro for the founder card..."
              />
              <span className="hint">Displayed directly under the title on the navy blue card.</span>
            </div>

            <div className="form-group">
              <label>Full Founder Story (Opens on "Read his story")</label>
              <textarea
                className="form-textarea story-textarea"
                value={data.founderStory}
                onChange={(e) => handleChange('founderStory', e.target.value)}
                placeholder="Write or paste the founder's full story here. Markdown and paragraphs are supported..."
              />
              <span className="hint">
                When users tap "Read his story" in the mobile app, this complete narrative will be displayed on a dedicated reader page.
              </span>
            </div>

            <div className="form-row">
              {/* Founder Photo 1 */}
              <div className="form-group">
                <label>Founder Photo 1 (Left slot)</label>
                <div className="image-upload-box">
                  {data.founderPhoto0 ? (
                    <>
                      <img
                        src={resolveMediaUrl(data.founderPhoto0)}
                        alt="Founder 1"
                        className="image-preview"
                      />
                      <div className="image-actions">
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() => triggerUpload('founderPhoto0')}
                          disabled={uploadingField === 'founderPhoto0'}
                        >
                          <MdCloudUpload size={16} />
                          {uploadingField === 'founderPhoto0' ? 'Uploading...' : 'Replace'}
                        </button>
                        <button
                          type="button"
                          className="btn-clear"
                          onClick={() => handleChange('founderPhoto0', '')}
                        >
                          <MdDelete size={16} /> Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload"
                      onClick={() => triggerUpload('founderPhoto0')}
                      disabled={uploadingField === 'founderPhoto0'}
                    >
                      <MdCloudUpload size={18} />
                      {uploadingField === 'founderPhoto0' ? 'Uploading...' : 'Upload Photo 1'}
                    </button>
                  )}
                </div>
              </div>

              {/* Founder Photo 2 */}
              <div className="form-group">
                <label>Founder Photo 2 (Right slot)</label>
                <div className="image-upload-box">
                  {data.founderPhoto1 ? (
                    <>
                      <img
                        src={resolveMediaUrl(data.founderPhoto1)}
                        alt="Founder 2"
                        className="image-preview"
                      />
                      <div className="image-actions">
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() => triggerUpload('founderPhoto1')}
                          disabled={uploadingField === 'founderPhoto1'}
                        >
                          <MdCloudUpload size={16} />
                          {uploadingField === 'founderPhoto1' ? 'Uploading...' : 'Replace'}
                        </button>
                        <button
                          type="button"
                          className="btn-clear"
                          onClick={() => handleChange('founderPhoto1', '')}
                        >
                          <MdDelete size={16} /> Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload"
                      onClick={() => triggerUpload('founderPhoto1')}
                      disabled={uploadingField === 'founderPhoto1'}
                    >
                      <MdCloudUpload size={18} />
                      {uploadingField === 'founderPhoto1' ? 'Uploading...' : 'Upload Photo 2'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY & CERTIFICATE */}
        {activeTab === 'company' && (
          <div className="about-card">
            <div className="about-card-title">
              <MdVerifiedUser size={22} />
              <span>Company Information & Official CAC Certificate</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Name / Card Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.companyTitle}
                  onChange={(e) => handleChange('companyTitle', e.target.value)}
                  placeholder="e.g. Ink to Wealth Media Limited"
                />
              </div>
              <div className="form-group">
                <label>Security Badge / Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.companyBadge}
                  onChange={(e) => handleChange('companyBadge', e.target.value)}
                  placeholder="e.g. Registered with the CAC"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>RC Registration Number (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.companyRc}
                  onChange={(e) => handleChange('companyRc', e.target.value)}
                  placeholder="e.g. RC 1928374"
                />
              </div>
              <div className="form-group">
                <label>Button CTA Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.companyCta}
                  onChange={(e) => handleChange('companyCta', e.target.value)}
                  placeholder="e.g. View certificate"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Company Description</label>
              <textarea
                className="form-textarea"
                value={data.companyText}
                onChange={(e) => handleChange('companyText', e.target.value)}
                placeholder="Description of the company and registration details..."
              />
            </div>

            <div className="form-group">
              <label>Official Certificate Image / Document</label>
              <div className="image-upload-box">
                {data.companyCertificateUrl ? (
                  <>
                    <img
                      src={resolveMediaUrl(data.companyCertificateUrl)}
                      alt="CAC Certificate"
                      className="image-preview cert"
                    />
                    <div className="image-actions">
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => triggerUpload('companyCertificateUrl')}
                        disabled={uploadingField === 'companyCertificateUrl'}
                      >
                        <MdCloudUpload size={16} />
                        {uploadingField === 'companyCertificateUrl' ? 'Uploading...' : 'Replace Certificate'}
                      </button>
                      <button
                        type="button"
                        className="btn-clear"
                        onClick={() => handleChange('companyCertificateUrl', '')}
                      >
                        <MdDelete size={16} /> Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => triggerUpload('companyCertificateUrl')}
                    disabled={uploadingField === 'companyCertificateUrl'}
                  >
                    <MdCloudUpload size={18} />
                    {uploadingField === 'companyCertificateUrl' ? 'Uploading...' : 'Upload CAC Certificate Image'}
                  </button>
                )}
              </div>
              <span className="hint">
                When users tap "View certificate" in the app, this uploaded document will open in an interactive viewer.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKSHELF */}
        {activeTab === 'bookshelf' && (
          <div className="about-card">
            <div className="about-card-title">
              <MdMenuBook size={22} />
              <span>My Bookshelf Card</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Section Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.bookShelf}
                  onChange={(e) => handleChange('bookShelf', e.target.value)}
                  placeholder="e.g. My Bookshelf"
                />
              </div>
              <div className="form-group">
                <label>Book Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.bookTitle}
                  onChange={(e) => handleChange('bookTitle', e.target.value)}
                  placeholder="e.g. Coleric Charles"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Format / Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={data.bookKind}
                  onChange={(e) => handleChange('bookKind', e.target.value)}
                  placeholder="e.g. Ebook, Novel, Serial"
                />
              </div>
              <div className="form-group">
                <label>Order Button Status</label>
                <input
                  type="text"
                  className="form-input"
                  value="Hidden (Removed as requested)"
                  disabled
                  style={{ opacity: 0.6 }}
                />
                <span className="hint">The order button has been removed from the mobile bookshelf card as requested.</span>
              </div>
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea
                className="form-textarea"
                value={data.bookText}
                onChange={(e) => handleChange('bookText', e.target.value)}
                placeholder="e.g. A new ebook by Coach Victor Daniels."
              />
            </div>

            <div className="form-group">
              <label>Book Cover Image</label>
              <div className="image-upload-box">
                {data.bookCoverUrl ? (
                  <>
                    <img
                      src={resolveMediaUrl(data.bookCoverUrl)}
                      alt="Book Cover"
                      className="image-preview"
                      style={{ maxHeight: 180, width: 120, objectFit: 'cover' }}
                    />
                    <div className="image-actions">
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => triggerUpload('bookCoverUrl')}
                        disabled={uploadingField === 'bookCoverUrl'}
                      >
                        <MdCloudUpload size={16} />
                        {uploadingField === 'bookCoverUrl' ? 'Uploading...' : 'Replace Cover'}
                      </button>
                      <button
                        type="button"
                        className="btn-clear"
                        onClick={() => handleChange('bookCoverUrl', '')}
                      >
                        <MdDelete size={16} /> Clear
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => triggerUpload('bookCoverUrl')}
                    disabled={uploadingField === 'bookCoverUrl'}
                  >
                    <MdCloudUpload size={18} />
                    {uploadingField === 'bookCoverUrl' ? 'Uploading...' : 'Upload Book Cover'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIALS */}
        {activeTab === 'socials' && (
          <div className="about-card">
            <div className="about-card-title">
              <MdShare size={22} />
              <span>Social Media Channels (YouTube, TikTok, Facebook, Instagram, LinkedIn)</span>
            </div>

            <p style={{ color: '#8e95a5', fontSize: 13.5, marginBottom: 20 }}>
              Each card appears in the "About Ink2Wealth" carousel on the mobile app. Tapping the button launches the corresponding URL.
            </p>

            {data.socials.map((social, idx) => (
              <div key={idx} className="social-item-card">
                <div className="social-item-header">
                  <span className="social-badge">#{idx + 1} {social.title || social.platform}</span>
                  <button
                    type="button"
                    className="btn-clear"
                    onClick={() => handleRemoveSocial(idx)}
                    style={{ padding: '4px 8px', fontSize: 12 }}
                  >
                    <MdDelete size={14} /> Remove
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Platform / Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={social.title}
                      onChange={(e) => handleSocialChange(idx, 'title', e.target.value)}
                      placeholder="e.g. YouTube, TikTok, LinkedIn"
                    />
                  </div>
                  <div className="form-group">
                    <label>Action Button Text</label>
                    <input
                      type="text"
                      className="form-input"
                      value={social.cta}
                      onChange={(e) => handleSocialChange(idx, 'cta', e.target.value)}
                      placeholder="e.g. Watch, Follow, Connect"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Subtitle / Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={social.text}
                      onChange={(e) => handleSocialChange(idx, 'text', e.target.value)}
                      placeholder="e.g. @CoachVictorDaniels. Free writing lessons."
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile / Channel URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={social.url}
                      onChange={(e) => handleSocialChange(idx, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn-upload"
              onClick={handleAddSocial}
              style={{ marginTop: 8 }}
            >
              <MdAdd size={18} /> Add Another Social Channel
            </button>
          </div>
        )}

        <div className="bottom-save-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e0ab22', fontSize: 13.5, fontWeight: 600 }}>
            <MdCheckCircle size={18} />
            <span>Changes will immediately reflect on the mobile app.</span>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <MdSave size={18} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
