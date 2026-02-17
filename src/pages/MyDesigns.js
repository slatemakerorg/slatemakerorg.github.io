import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, Edit3, Trash2, Eye, EyeOff, Download, Heart, FileBox, Plus } from 'lucide-react';
import './MyDesigns.css';

export default function MyDesigns() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    let mounted = true;
    let abortController = new AbortController();

    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchDesigns() {
      console.log('MyDesigns - fetching for user:', user.id);

      // Add a small delay to ensure component is stable
      await new Promise(resolve => setTimeout(resolve, 50));

      if (!mounted) {
        console.log('[MyDesigns] Component unmounted before fetch');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('designs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!mounted || abortController.signal.aborted) {
          console.log('[MyDesigns] Component unmounted or aborted during fetch');
          return;
        }

        console.log('MyDesigns query result:', { data, error, dataLength: data?.length });

        if (error) {
          console.error('MyDesigns query error:', error);
          setError(`Database error: ${error.message}`);
          throw error;
        }
        console.log('MyDesigns fetched successfully:', data?.length || 0, data);
        setDesigns(data || []);
      } catch (err) {
        if (!mounted) return;
        console.error('[MyDesigns] Catch block error:', err);
        // Check for both regular AbortError and Supabase-wrapped AbortError (code '20')
        const isAbortError = err.name === 'AbortError' ||
                            err.code === '20' ||
                            err.message?.includes('AbortError');
        if (!isAbortError) {
          setError(err.message || 'Failed to load designs.');
        } else {
          console.log('[MyDesigns] Ignoring AbortError');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDesigns();

    return () => {
      console.log('[MyDesigns] Cleanup called');
      mounted = false;
      // Don't abort - let the request complete
    };
  }, [user, authLoading, navigate]);

  async function togglePublished(design) {
    try {
      const { error } = await supabase
        .from('designs')
        .update({ published: !design.published, updated_at: new Date().toISOString() })
        .eq('id', design.id);

      if (error) throw error;

      setDesigns(prev =>
        prev.map(d => d.id === design.id ? { ...d, published: !d.published } : d)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteDesign(designId) {
    try {
      // Delete associated storage files
      const design = designs.find(d => d.id === designId);
      if (design?.files) {
        for (const file of design.files) {
          if (file.path) {
            await supabase.storage.from('designs').remove([file.path]);
          }
        }
      }
      if (design?.thumbnail_url) {
        const thumbPath = design.thumbnail_url.split('/designs/')[1];
        if (thumbPath) {
          await supabase.storage.from('designs').remove([thumbPath]);
        }
      }

      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      setDesigns(prev => prev.filter(d => d.id !== designId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredDesigns = designs.filter(d => {
    if (filter === 'published') return d.published;
    if (filter === 'draft') return !d.published;
    return true;
  });

  const publishedCount = designs.filter(d => d.published).length;
  const draftCount = designs.filter(d => !d.published).length;

  if (authLoading) {
    return (
      <div className="page-content">
        <div className="loading-page"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page-content">
      <div className="container">
        <div className="mydesigns-page">
          <div className="mydesigns-header">
            <div>
              <div className="section-label">Your Workshop</div>
              <h1 className="section-title">MY DESIGNS</h1>
              <div className="section-divider"></div>
            </div>
            <Link to="/upload" className="btn btn-primary">
              <Plus size={16} />
              New Design
            </Link>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Filter tabs */}
          <div className="mydesigns-filters">
            <button
              className={`mydesigns-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({designs.length})
            </button>
            <button
              className={`mydesigns-filter-btn ${filter === 'published' ? 'active' : ''}`}
              onClick={() => setFilter('published')}
            >
              Published ({publishedCount})
            </button>
            <button
              className={`mydesigns-filter-btn ${filter === 'draft' ? 'active' : ''}`}
              onClick={() => setFilter('draft')}
            >
              Drafts ({draftCount})
            </button>
          </div>

          {loading ? (
            <div className="loading-page">
              <div className="spinner"></div>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="mydesigns-empty">
              <FileBox size={48} />
              <h3>{filter === 'all' ? "You haven't uploaded any designs yet" : `No ${filter} designs`}</h3>
              <p>Share your Slate mods, 3D prints, and builds with the community.</p>
              <Link to="/upload" className="btn btn-primary">
                <Upload size={16} />
                Upload Your First Design
              </Link>
            </div>
          ) : (
            <div className="mydesigns-list">
              {filteredDesigns.map(design => (
                <div key={design.id} className="mydesign-row">
                  <div className="mydesign-thumb">
                    {design.thumbnail_url ? (
                      <img src={design.thumbnail_url} alt={design.title} />
                    ) : (
                      <FileBox size={24} />
                    )}
                  </div>

                  <div className="mydesign-info">
                    <h3 className="mydesign-title">{design.title}</h3>
                    <div className="mydesign-meta">
                      <span className="tag tag-category">{design.category}</span>
                      <span className={`mydesign-status ${design.published ? 'published' : 'draft'}`}>
                        {design.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="mydesign-date">
                        {new Date(design.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mydesign-stats">
                    <div className="mydesign-stat" title="Downloads">
                      <Download size={14} />
                      <span>{design.download_count || 0}</span>
                    </div>
                    <div className="mydesign-stat" title="Likes">
                      <Heart size={14} />
                      <span>{design.like_count || 0}</span>
                    </div>
                    <div className="mydesign-stat" title="Views">
                      <Eye size={14} />
                      <span>{design.view_count || 0}</span>
                    </div>
                  </div>

                  <div className="mydesign-actions">
                    <button
                      className="mydesign-action-btn"
                      onClick={() => togglePublished(design)}
                      title={design.published ? 'Unpublish' : 'Publish'}
                    >
                      {design.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="mydesign-action-btn"
                      onClick={() => navigate(`/upload?edit=${design.id}`)}
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    {deleteConfirm === design.id ? (
                      <div className="mydesign-delete-confirm">
                        <span>Delete?</span>
                        <button className="mydesign-confirm-yes" onClick={() => deleteDesign(design.id)}>Yes</button>
                        <button className="mydesign-confirm-no" onClick={() => setDeleteConfirm(null)}>No</button>
                      </div>
                    ) : (
                      <button
                        className="mydesign-action-btn mydesign-action-danger"
                        onClick={() => setDeleteConfirm(design.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
