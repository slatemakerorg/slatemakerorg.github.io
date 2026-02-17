import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DesignCard from '../components/DesignCard';
import { Search, Filter } from 'lucide-react';
import './Designs.css';

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

export default function Designs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(() => {
    const cat = searchParams.get('category');
    return cat && CATEGORIES.includes(cat) ? cat : 'All';
  });
  const [sortBy, setSortBy] = useState('newest');

  function handleCategoryChange(cat) {
    setActiveCategory(cat);
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  }

  useEffect(() => {
    let mounted = true;

    async function fetchDesigns() {
      setLoading(true);
      try {
        let query = supabase
          .from('designs')
          .select('*, profiles(username)')
          .eq('published', true);

        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }

        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query.order('download_count', { ascending: false });
            break;
          case 'liked':
            query = query.order('like_count', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query.limit(50);

        if (!mounted) return;

        if (error) {
          console.error('Supabase designs query error:', error);
          throw error;
        }
        console.log('Designs fetched:', data?.length || 0, data);
        setDesigns(data || []);
      } catch (err) {
        if (!mounted) return;
        console.error('[DEBUG] Designs fetch error:', err.name, err.message, err);
        if (err.name !== 'AbortError') {
          console.error('Error fetching designs:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDesigns();

    return () => {
      mounted = false;
    };
  }, [activeCategory, sortBy]);

  const filteredDesigns = designs.filter(design => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      design.title?.toLowerCase().includes(q) ||
      design.description?.toLowerCase().includes(q) ||
      design.tags?.some(tag => tag.includes(q))
    );
  });

  return (
    <div className="page-content">
      <div className="container">
        <div className="section-label">Browse</div>
        <h1 className="section-title">DESIGN REPOSITORY</h1>
        <div className="section-divider"></div>

        {/* Search and Filter Bar */}
        <div className="designs-toolbar">
          <div className="designs-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="designs-sort">
            <Filter size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="popular">Most Downloaded</option>
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
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : filteredDesigns.length > 0 ? (
          <>
            <p className="designs-count">{filteredDesigns.length} design{filteredDesigns.length !== 1 ? 's' : ''}</p>
            <div className="designs-grid">
              {filteredDesigns.map(design => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          </>
        ) : (
          <div className="designs-empty">
            <p>No designs found{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.</p>
            <p>Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
