import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, X, Image, FileBox } from 'lucide-react';
import './CreateGuide.css';

const CATEGORIES = [
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

export default function CreateGuide() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDropAttachments = useCallback((acceptedFiles) => {
    setAttachments(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps: getAttachRootProps, getInputProps: getAttachInputProps, isDragActive } = useDropzone({
    onDrop: onDropAttachments,
    accept: {
      'model/stl': ['.stl'],
      'application/octet-stream': ['.stl', '.step', '.stp', '.3mf', '.obj', '.f3d', '.dxf'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const onDropThumbnail = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getThumbRootProps, getInputProps: getThumbInputProps } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  function removeAttachment(index) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  function removeThumbnail() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (!content.trim()) { setError('Please write some guide content.'); return; }

    setLoading(true);

    try {
      // Upload thumbnail
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split('.').pop();
        const path = `guide-thumbnails/${user.id}/${Date.now()}.${ext}`;
        const { error: thumbError } = await supabase.storage
          .from('designs')
          .upload(path, thumbnailFile);
        if (thumbError) throw thumbError;
        const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(path);
        thumbnailUrl = publicUrl;
      }

      // Upload attachments
      const uploadedFiles = [];
      for (const file of attachments) {
        const filePath = `guide-files/${user.id}/${Date.now()}_${file.name}`;
        const { error: fileError } = await supabase.storage
          .from('designs')
          .upload(filePath, file);
        if (fileError) throw fileError;
        const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(filePath);
        uploadedFiles.push({ name: file.name, size: file.size, url: publicUrl, path: filePath });
      }

      const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      const { data: guide, error: insertError } = await supabase
        .from('guides')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          category,
          tags: tagList,
          thumbnail_url: thumbnailUrl,
          files: uploadedFiles.length > 0 ? uploadedFiles : null,
          published,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/guides/${guide.id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="page-content">
      <div className="container">
        <div className="create-guide-page">
          <div className="section-label">Share Your Knowledge</div>
          <h1 className="section-title">WRITE A GUIDE</h1>
          <div className="section-divider"></div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="create-guide-form">
            <div className="create-guide-grid">
              {/* Left column */}
              <div className="create-guide-details">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. How to Install a Bed Rack on the Slate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Summary</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Brief description — what does this guide cover and who is it for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Comma separated: bed rack, installation, hardware"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <span className="form-help">Separate tags with commas</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Guide Content</label>
                  <textarea
                    className="form-textarea create-guide-content"
                    placeholder="Write your step-by-step guide here. Describe each step clearly, include tips, tools needed, and any important warnings."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    required
                  />
                  <span className="form-help">Plain text — use blank lines to separate sections or steps</span>
                </div>
              </div>

              {/* Right column */}
              <div className="create-guide-files">
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  {thumbnailPreview ? (
                    <div className="upload-thumb-preview">
                      <img src={thumbnailPreview} alt="Cover preview" />
                      <button type="button" className="upload-remove-thumb" onClick={removeThumbnail}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div {...getThumbRootProps()} className="upload-dropzone upload-dropzone-small">
                      <input {...getThumbInputProps()} />
                      <Image size={24} />
                      <span>Drop an image or click to browse</span>
                      <span className="form-help">JPG, PNG, WebP — 5MB max</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Attachments <span className="form-help">(optional)</span></label>
                  <div {...getAttachRootProps()} className={`upload-dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getAttachInputProps()} />
                    <FileBox size={32} />
                    <span>Drop files or click to browse</span>
                    <span className="form-help">STL, STEP, PDF, ZIP, images — 50MB max each</span>
                  </div>

                  {attachments.length > 0 && (
                    <ul className="upload-file-list">
                      {attachments.map((file, index) => (
                        <li key={index} className="upload-file-item">
                          <div className="upload-file-info">
                            <FileBox size={16} />
                            <span className="upload-file-name">{file.name}</span>
                            <span className="upload-file-size">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          </div>
                          <button type="button" onClick={() => removeAttachment(index)}>
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group">
                  <label className="create-guide-publish-toggle">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                    <span>Publish immediately</span>
                  </label>
                  <span className="form-help">Uncheck to save as a draft</span>
                </div>
              </div>
            </div>

            <div className="upload-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <BookOpen size={16} />
                {loading ? 'Publishing...' : (published ? 'Publish Guide' : 'Save Draft')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
