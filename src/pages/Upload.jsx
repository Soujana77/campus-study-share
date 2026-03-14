import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Upload.css';

function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  const [materialType, setMaterialType] = useState('notes');
  const [subjects, setSubjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      loadSubjects(profileData?.branch);
    }
    
    async function loadSubjects(branch) {
      if (!branch) return;
      
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('branch', branch)
        .order('subject_name');
      
      if (data) setSubjects(data);
    }
    
    checkUser();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!file) {
      setError('Please select a file');
      setLoading(false);
      return;
    }

    if (!subjectId) {
      setError('Please select a subject');
      setLoading(false);
      return;
    }

    // Get file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(fileName, file);

    if (uploadError) {
      setError('Failed to upload file: ' + uploadError.message);
      setLoading(false);
      return;
    }

    // Get public file URL
    const { data: urlData } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Insert record in database
    const { error: dbError } = await supabase
      .from('materials')
      .insert([
        {
          title,
          description,
          file_url: fileUrl,
          subject_id: subjectId,
          uploaded_by: user.id,
          material_type: materialType,
          branch: profile.branch,
          semester: profile.semester,
          file_type: fileExt
        }
      ]);

    if (dbError) {
      setError('Failed to save material: ' + dbError.message);
      setLoading(false);
      return;
    }

    alert('Material uploaded successfully!');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-card card">
          <div className="upload-header">
            <h1>Upload Study Material</h1>
            <p>Share your notes, assignments, and PYQs with your fellow students</p>
          </div>

          {error && (
            <div className="upload-error">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">
                Subject *
              </label>
              <select
                id="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="materialType">
                Material Type *
              </label>
              <select
                id="materialType"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                <option value="notes">Notes</option>
                <option value="assignment">Assignment</option>
                <option value="pyq">Previous Year Question (PYQ)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Add a brief description of the material (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                File Upload *
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                <div className="file-info">
                  <span className="file-types">Supported formats: PDF, PPT, PPTX</span>
                </div>
              </div>
              {file && (
                <div className="selected-file">
                  <span className="file-icon">📎</span>
                  <span className="file-name">{file.name}</span>
                  <button 
                    type="button" 
                    className="remove-file"
                    onClick={() => setFile(null)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary upload-submit"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Upload;