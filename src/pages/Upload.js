import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload as UploadIcon, X, Image, FileBox } from 'lucide-react';
import './Upload.css';

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

export default function UploadDesign() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [designFiles, setDesignFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Design file dropzone
  const onDropDesign = useCallback((acceptedFiles) => {
    setDesignFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps: getDesignRootProps, getInputProps: getDesignInputProps, isDragActive: isDesignDrag } = useDropzone({
    onDrop: onDropDesign,
    accept: {
      'model/stl': ['.stl'],
      'model/step': ['.step', '.stp'],
      'application/octet-stream': ['.stl', '.step', '.stp', '.3mf', '.obj', '.f3d', '.dxf'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Thumbnail dropzone
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
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  function removeDesignFile(index) {
    setDesignFiles(prev => prev.filter((_, i) => i !== index));
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
    if (designFiles.length === 0) { setError('Please upload at least one design file.'); return; }

    setLoading(true);

    try {
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbPath = `thumbnails/${user.id}/${Date.now()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage
          .from('designs')
          .upload(thumbPath, thumbnailFile);

        if (thumbError) throw thumbError;

        const { data: { publicUrl } } = supabase.storage
          .from('designs')
          .getPublicUrl(thumbPath);

        thumbnailUrl = publicUrl;
      }

      // Upload design files
      const uploadedFiles = [];
      for (const file of designFiles) {
        const filePath = `files/${user.id}/${Date.now()}_${file.name}`;
        const { error: fileError } = await supabase.storage
          .from('designs')
          .upload(filePath, file);

        if (fileError) throw fileError;

        const { data: { publicUrl } } = supabase.storage
          .from('designs')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          url: publicUrl,
          path: filePath,
        });
      }

      // Parse tags
      const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

      // Create design record
      const { data: design, error: insertError } = await supabase
        .from('designs')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tagList,
          thumbnail_url: thumbnailUrl,
          files: uploadedFiles,
          published: true,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/designs/${design.id}`);
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
        <div className="upload-page">
          <div className="section-label">Share Your Work</div>
          <h1 className="section-title">UPLOAD A DESIGN</h1>
          <div className="section-divider"></div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="upload-form-grid">
              {/* Left column - details */}
              <div className="upload-details">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Slate Phone Mount v2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe your design — what it does, how to print/build it, materials needed, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
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
                    placeholder="Comma separated: mount, phone, dashboard, PLA"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <span className="form-help">Separate tags with commas</span>
                </div>
              </div>

              {/* Right column - files */}
              <div className="upload-files">
                {/* Thumbnail upload */}
                <div className="form-group">
                  <label className="form-label">Thumbnail Image</label>
                  {thumbnailPreview ? (
                    <div className="upload-thumb-preview">
                      <img src={thumbnailPreview} alt="Thumbnail preview" />
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

                {/* Design files upload */}
                <div className="form-group">
                  <label className="form-label">Design Files</label>
                  <div {...getDesignRootProps()} className={`upload-dropzone ${isDesignDrag ? 'active' : ''}`}>
                    <input {...getDesignInputProps()} />
                    <FileBox size={32} />
                    <span>Drop design files or click to browse</span>
                    <span className="form-help">STL, STEP, 3MF, OBJ, DXF, PDF, ZIP — 50MB max each</span>
                  </div>

                  {designFiles.length > 0 && (
                    <ul className="upload-file-list">
                      {designFiles.map((file, index) => (
                        <li key={index} className="upload-file-item">
                          <div className="upload-file-info">
                            <FileBox size={16} />
                            <span className="upload-file-name">{file.name}</span>
                            <span className="upload-file-size">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          </div>
                          <button type="button" onClick={() => removeDesignFile(index)}>
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="upload-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <UploadIcon size={16} />
                {loading ? 'Uploading...' : 'Publish Design'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
