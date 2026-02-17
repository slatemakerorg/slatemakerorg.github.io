import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Heart, Eye } from 'lucide-react';
import './DesignCard.css';

export default function DesignCard({ design }) {
  const {
    id,
    title,
    description,
    category,
    thumbnail_url,
    download_count = 0,
    like_count = 0,
    view_count = 0,
    profiles: author,
  } = design;

  return (
    <Link to={`/designs/${id}`} className="design-card card">
      <div className="design-card-image">
        {thumbnail_url ? (
          <img src={thumbnail_url} alt={title} />
        ) : (
          <div className="design-card-placeholder">
            <span>No Preview</span>
          </div>
        )}
        {category && <span className="design-card-category tag tag-category">{category}</span>}
      </div>
      <div className="design-card-body">
        <h3 className="design-card-title">{title}</h3>
        <p className="design-card-desc">
          {description?.length > 100 ? description.substring(0, 100) + '...' : description}
        </p>
        <div className="design-card-meta">
          <span className="design-card-author">
            by {author?.username || 'Unknown'}
          </span>
          <div className="design-card-stats">
            <span><Download size={14} /> {download_count}</span>
            <span><Heart size={14} /> {like_count}</span>
            <span><Eye size={14} /> {view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
