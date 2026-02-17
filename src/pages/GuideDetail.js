import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Download, Heart, Eye, Calendar, Tag, User, ArrowLeft, FileBox, BookOpen } from 'lucide-react';
import './GuideDetail.css';

export default function GuideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchGuide() {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*, profiles(username, avatar_url)')
          .eq('id', id)
          .single();

        if (!mounted) return;
        if (error) throw error;

        setGuide(data);
        setLikeCount(data.like_count || 0);

        // Increment view count
        await supabase
          .from('guides')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);

      } catch (err) {
        if (!mounted) return;
        if (err.code === 'PGRST116') {
          setError('Guide not found.');
        } else {
          setError('Failed to load guide.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchGuide();
    return () => { mounted = false; };
  }, [id]);

  async function handleDownload(file) {
    await supabase
      .from('guides')
      .update({ download_count: (guide.download_count || 0) + 1 })
      .eq('id', id);

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
      .from('guides')
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

  if (error || !guide) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="alert alert-error">{error || 'Guide not found.'}</div>
          <Link to="/guides" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to Guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="guide-detail">

          <Link to="/guides" className="guide-detail-back">
            <ArrowLeft size={16} /> Back to Guides
          </Link>

          <div className="guide-detail-grid">
            {/* Left — image + files */}
            <div className="guide-detail-left">
              <div className="guide-detail-image">
                {guide.thumbnail_url ? (
                  <img src={guide.thumbnail_url} alt={guide.title} />
                ) : (
                  <div className="guide-detail-no-image">
                    <BookOpen size={64} />
                    <span>No Preview</span>
                  </div>
                )}
              </div>

              {guide.files && guide.files.length > 0 && (
                <div className="guide-detail-files">
                  <h3 className="guide-detail-files-title">Attachments</h3>
                  <ul className="guide-detail-file-list">
                    {guide.files.map((file, index) => (
                      <li key={index} className="guide-detail-file-item">
                        <div className="guide-detail-file-info">
                          <FileBox size={16} />
                          <div>
                            <span className="guide-detail-file-name">{file.name}</span>
                            <span className="guide-detail-file-size">{formatFileSize(file.size)}</span>
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

            {/* Right — details + content */}
            <div className="guide-detail-right">
              <div className="guide-detail-header">
                {guide.category && <span className="tag tag-category">{guide.category}</span>}
                <h1 className="guide-detail-title">{guide.title}</h1>
              </div>

              <div className="guide-detail-meta">
                <div className="guide-detail-meta-item">
                  <User size={14} />
                  <span>by {guide.profiles?.username || 'Unknown'}</span>
                </div>
                <div className="guide-detail-meta-item">
                  <Calendar size={14} />
                  <span>{new Date(guide.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}</span>
                </div>
              </div>

              <div className="guide-detail-stats">
                <div className="guide-detail-stat">
                  <Eye size={16} />
                  <span>{guide.view_count || 0} views</span>
                </div>
                <button
                  className={`guide-detail-like-btn ${liked ? 'liked' : ''}`}
                  onClick={handleLike}
                  title={user ? (liked ? 'Unlike' : 'Like') : 'Log in to like'}
                >
                  <Heart size={16} />
                  <span>{likeCount}</span>
                </button>
              </div>

              {guide.description && (
                <div className="guide-detail-description">
                  <p>{guide.description}</p>
                </div>
              )}

              {guide.content && (
                <div className="guide-detail-content">
                  <h3>Guide</h3>
                  <div className="guide-detail-content-body">
                    {guide.content}
                  </div>
                </div>
              )}

              {guide.tags && guide.tags.length > 0 && (
                <div className="guide-detail-tags">
                  <Tag size={14} />
                  {guide.tags.map(tag => (
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
