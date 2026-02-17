import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, MapPin, Globe, Save, Camera } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ designs: 0, downloads: 0, likes: 0 });

  useEffect(() => {
    let mounted = true;

    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    console.log('Profile page - user:', user?.id);
    console.log('Profile page - profile data:', profile);

    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
      setAvatarUrl(profile.avatar_url || '');
    }

    async function fetchStats() {
      if (!user || !mounted) return;
      console.log('[Profile] Fetching stats for user:', user.id);
      try {
        const { data: designs, error } = await supabase
          .from('designs')
          .select('id, download_count, like_count')
          .eq('user_id', user.id);

        if (!mounted) return;

        console.log('[Profile] Stats query result:', { designs, error, count: designs?.length });

        if (error) {
          console.error('[Profile] Stats error:', error);
        }

        if (!error && designs) {
          setStats({
            designs: designs.length,
            downloads: designs.reduce((sum, d) => sum + (d.download_count || 0), 0),
            likes: designs.reduce((sum, d) => sum + (d.like_count || 0), 0),
          });
        }
      } catch (err) {
        if (!mounted) return;
        console.error('[Profile] Stats catch error:', err);
        if (err.name !== 'AbortError') {
          console.error('Error fetching stats:', err);
        }
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [user, profile, authLoading, navigate]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let newAvatarUrl = avatarUrl;

      // Upload new avatar if selected
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `avatars/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('designs')
          .upload(path, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('designs')
          .getPublicUrl(path);

        newAvatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim(),
          bio: bio.trim(),
          location: location.trim(),
          website: website.trim(),
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess('Profile updated successfully!');
      fetchProfile(user.id);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page-content">
        <div className="loading-page"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!user) return null;

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="page-content">
      <div className="container">
        <div className="profile-page">
          <div className="section-label">Your Account</div>
          <h1 className="section-title">MY PROFILE</h1>
          <div className="section-divider"></div>

          {/* Stats bar */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.designs}</span>
              <span className="profile-stat-label">Designs</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.downloads}</span>
              <span className="profile-stat-label">Downloads</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.likes}</span>
              <span className="profile-stat-label">Likes</span>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-grid">
              {/* Left column - avatar and info */}
              <div className="profile-sidebar">
                <div className="profile-avatar-section">
                  <div className="profile-avatar">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Avatar" />
                    ) : (
                      <User size={48} />
                    )}
                    <label className="profile-avatar-overlay" htmlFor="avatar-upload">
                      <Camera size={20} />
                      <span>Change</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <p className="form-help" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    Click to upload avatar
                  </p>
                </div>

                <div className="profile-info-card">
                  <div className="profile-info-item">
                    <User size={14} />
                    <span>{username || 'Username'}</span>
                  </div>
                  {location && (
                    <div className="profile-info-item">
                      <MapPin size={14} />
                      <span>{location}</span>
                    </div>
                  )}
                  {website && (
                    <div className="profile-info-item">
                      <Globe size={14} />
                      <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer">
                        {website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="profile-info-item profile-info-email">
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Right column - edit form */}
              <div className="profile-details">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your unique username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name (optional)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community about yourself — what you build, your experience, your Slate setup..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. East Central Indiana"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    className="form-input"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://your-site.com"
                  />
                </div>

                <div className="profile-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
