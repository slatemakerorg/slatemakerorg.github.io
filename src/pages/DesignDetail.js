import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Download, Heart, Eye, Calendar, Tag, User, ArrowLeft, FileBox } from 'lucide-react';
import './DesignDetail.css';

export default function DesignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchDesign() {
      try {
        const { data, error } = await supabase
          .from('designs')
          .select('*, profiles(username, avatar_url)')
          .eq('id', id)
          .single();

        if (!mounted) return;

        if (error) throw error;

        setDesign(data);
        setLikeCount(data.like_count || 0);

        // Increment view count
        await supabase
          .from('designs')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);

      } catch (err) {
        if (!mounted) return;
        if (err.code === 'PGRST116') {
          setError('Design not found.');
        } else {
          setError('Failed to load design.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDesign();
    return () => { mounted = false; };
  }, [id]);

  async function handleDownload(file) {
    // Increment download count
    await supabase
      .from('designs')
      .update({ download_count: (design.download_count || 0) + 1 })
      .eq('id', id);

    setDesign(prev => ({ ...prev, download_count: (prev.download_count || 0) + 1 }));

    // Trigger download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    link.click();
  }

  async function handleLike() {
    if (!user) {
      navigate('/login');
      return;
    }

    const newLiked = !liked;
    const delta = newLiked ? 1 : -1;
    const newCount = likeCount + delta;

    setLiked(newLiked);
    setLikeCount(newCount);

    await supabase
      .from('designs')
      .update({ like_count: newCount })
      .eq('id', id);
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-page"><div className="spinner"></div></div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="alert alert-error">{error || 'Design not found.'}</div>
          <Link to="/designs" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to Designs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="design-detail">

          {/* Back link */}
          <Link to="/designs" className="design-detail-back">
            <ArrowLeft size={16} /> Back to Designs
          </Link>

          <div className="design-detail-grid">
            {/* Left — image + files */}
            <div className="design-detail-left">
              <div className="design-detail-image">
                {design.thumbnail_url ? (
                  <img src={design.thumbnail_url} alt={design.title} />
                ) : (
                  <div className="design-detail-no-image">
                    <FileBox size={64} />
                    <span>No Preview</span>
                  </div>
                )}
              </div>

              {/* Download files */}
              {design.files && design.files.length > 0 && (
                <div className="design-detail-files">
                  <h3 className="design-detail-files-title">Design Files</h3>
                  <ul className="design-detail-file-list">
                    {design.files.map((file, index) => (
                      <li key={index} className="design-detail-file-item">
                        <div className="design-detail-file-info">
                          <FileBox size={16} />
                          <div>
                            <span className="design-detail-file-name">{file.name}</span>
                            <span className="design-detail-file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleDownload(file)}
                        >
                          <Download size={14} /> Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right — details */}
            <div className="design-detail-right">
              <div className="design-detail-header">
                <span className="tag tag-category">{design.category}</span>
                <h1 className="design-detail-title">{design.title}</h1>
              </div>

              {/* Meta */}
              <div className="design-detail-meta">
                <div className="design-detail-meta-item">
                  <User size={14} />
                  <span>by {design.profiles?.username || 'Unknown'}</span>
                </div>
                <div className="design-detail-meta-item">
                  <Calendar size={14} />
                  <span>{new Date(design.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}</span>
                </div>
              </div>

              {/* Stats + Like */}
              <div className="design-detail-stats">
                <div className="design-detail-stat">
                  <Download size={16} />
                  <span>{design.download_count || 0} downloads</span>
                </div>
                <div className="design-detail-stat">
                  <Eye size={16} />
                  <span>{(design.view_count || 0)} views</span>
                </div>
                <button
                  className={`design-detail-like-btn ${liked ? 'liked' : ''}`}
                  onClick={handleLike}
                  title={user ? (liked ? 'Unlike' : 'Like') : 'Log in to like'}
                >
                  <Heart size={16} />
                  <span>{likeCount}</span>
                </button>
              </div>

              {/* Description */}
              {design.description && (
                <div className="design-detail-description">
                  <h3>Description</h3>
                  <p>{design.description}</p>
                </div>
              )}

              {/* Tags */}
              {design.tags && design.tags.length > 0 && (
                <div className="design-detail-tags">
                  <Tag size={14} />
                  {design.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
