import { useState, useEffect } from 'react';
import { pageService } from '../services/pageService';
import { getImageUrl } from '../utils/imageHelper';
import './Pages.css';

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await pageService.getAllPages();
      if (response.success) {
        setPages(response.pages || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) {
      return;
    }
    try {
      await pageService.deletePage(pageId);
      fetchPages();
    } catch (error) {
      alert('Error deleting page: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="pages-page">
      <div className="page-header">
        <h2>Pages Management</h2>
      </div>

      {loading ? (
        <div className="loading">Loading pages...</div>
      ) : (
        <div className="pages-grid">
          {pages.length === 0 ? (
            <div className="empty-state">No pages found</div>
          ) : (
            pages.map((page) => {
              const logoUrl = page.logo ? getImageUrl(page.logo) : null;
              return (
              <div key={page.id} className="page-card">
                <div className="page-logo">
                  {logoUrl ? (
                    <img src={logoUrl} alt={page.pageName} onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                  ) : null}
                  <div className="logo-placeholder" style={{ display: logoUrl ? 'none' : 'flex' }}>
                    {page.pageName?.charAt(0) || 'P'}
                  </div>
                </div>
                <div className="page-info">
                  <h3>{page.pageName || 'Unnamed Page'}</h3>
                  <p className="page-type">{page.instituteType || 'Institute'}</p>
                  <p className="page-followers">Followers: {page.followersCount || 0}</p>
                  <p className="page-website">{page.website || 'No website'}</p>
                </div>
                <div className="page-actions">
                  <button className="btn-delete" onClick={() => handleDelete(page.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Pages;

