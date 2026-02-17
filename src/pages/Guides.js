import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, BookOpen, Download, Heart, Eye, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Guides.css';

const CATEGORIES = [
  'All',
  '3D Printing',
  'CNC & Fabrication',
  'Electrical & Wiring',
  'Service & Repair',
  'Interior',
  'Exterior',
  'Bed Accessories',
  'Lighting',
  'Audio',
  'Storage',
  'Other',
];

export default function Guides() {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let mounted = true;

    async function fetchGuides() {
      setLoading(true);
      try {
        let query = supabase
          .from('guides')
          .select('*, profiles(username)')
          .eq('published', true);

        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }

        switch (sortBy) {
          case 'popular':
            query = query.order('view_count', { ascending: false });
            break;
          case 'liked':
            query = query.order('like_count', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query.limit(50);

        if (!mounted) return;
        if (error) throw error;
        setGuides(data || []);
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching guides:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchGuides();
    return () => { mounted = false; };
  }, [activeCategory, sortBy]);

  const filteredGuides = guides.filter(guide => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      guide.title?.toLowerCase().includes(q) ||
      guide.description?.toLowerCase().includes(q) ||
      guide.tags?.some(tag => tag.includes(q))
    );
  });

  return (
    <div className="page-content">
      <div className="container">
        <div className="guides-page-header">
          <div>
            <div className="section-label">Community Knowledge</div>
            <h1 className="section-title">GUIDES & TUTORIALS</h1>
            <div className="section-divider"></div>
          </div>
          {user && (
            <Link to="/create-guide" className="btn btn-primary">
              <Plus size={16} />
              Write a Guide
            </Link>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="designs-toolbar">
          <div className="designs-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="designs-sort">
            <Filter size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="popular">Most Viewed</option>
              <option value="liked">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="designs-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`designs-category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : filteredGuides.length > 0 ? (
          <>
            <p className="designs-count">{filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}</p>
            <div className="guides-grid">
              {filteredGuides.map(guide => (
                <Link key={guide.id} to={`/guides/${guide.id}`} className="guide-card card">
                  <div className="guide-card-image">
                    {guide.thumbnail_url ? (
                      <img src={guide.thumbnail_url} alt={guide.title} />
                    ) : (
                      <div className="guide-card-placeholder">
                        <BookOpen size={32} />
                      </div>
                    )}
                    {guide.category && (
                      <span className="guide-card-category tag tag-category">{guide.category}</span>
                    )}
                  </div>
                  <div className="guide-card-body">
                    <h3 className="guide-card-title">{guide.title}</h3>
                    <p className="guide-card-desc">
                      {guide.description?.length > 100
                        ? guide.description.substring(0, 100) + '...'
                        : guide.description}
                    </p>
                    <div className="guide-card-meta">
                      <span className="guide-card-author">
                        by {guide.profiles?.username || 'Unknown'}
                      </span>
                      <div className="guide-card-stats">
                        <span><Eye size={14} /> {guide.view_count || 0}</span>
                        <span><Heart size={14} /> {guide.like_count || 0}</span>
                        {guide.files?.length > 0 && (
                          <span><Download size={14} /> {guide.files.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="designs-empty">
            <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No guides found{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.</p>
            {user ? (
              <Link to="/create-guide" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <Plus size={16} /> Write the First Guide
              </Link>
            ) : (
              <p>Be the first to share your knowledge!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
