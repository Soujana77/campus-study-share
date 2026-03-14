import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import RatingStars from '../components/RatingStars';
import './MaterialDetail.css';

function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [subject, setSubject] = useState(null);
  const [uploader, setUploader] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    async function loadMaterial() {
      setLoading(true);
      
      const { data: materialData, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !materialData) {
        navigate('/materials');
        return;
      }

      setMaterial(materialData);

      // Get subject name
      if (materialData.subject_id) {
        const { data: subjectData } = await supabase
          .from('subjects')
          .select('subject_name')
          .eq('id', materialData.subject_id)
          .single();
        
        if (subjectData) setSubject(subjectData.subject_name);
      }

      // Get uploader name
      if (materialData.uploaded_by) {
        const { data: uploaderData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', materialData.uploaded_by)
          .single();
        
        if (uploaderData) setUploader(uploaderData.name);
      }

      // Get ratings
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('material_id', id);

      if (ratings && ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        setRatingData({
          average: (sum / ratings.length).toFixed(1),
          count: ratings.length
        });
      }

      setLoading(false);
    }
    
    checkUser();
    loadMaterial();
  }, [id]);

  const getFileIcon = () => {
    const fileType = material?.file_type?.toLowerCase();
    if (fileType === 'pdf') return '📄';
    if (fileType === 'ppt' || fileType === 'pptx') return '📊';
    return '📁';
  };

  const getTypeLabel = () => {
    const types = {
      'notes': 'Notes',
      'assignment': 'Assignment',
      'pyq': 'Previous Year Question'
    };
    return types[material?.material_type] || material?.material_type;
  };

  const getFileTypeLabel = () => {
    const fileType = material?.file_type?.toUpperCase();
    return fileType || 'FILE';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <div className="material-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/materials">Materials</Link>
          <span>/</span>
          <span>{subject}</span>
        </div>

        <div className="material-detail-card card">
          <div className="detail-header">
            <div className="detail-icon">{getFileIcon()}</div>
            <div className="detail-title-section">
              <h1>{material.title}</h1>
              <div className="detail-meta">
                <span className={`material-type-badge ${material.material_type}`}>
                  {getTypeLabel()}
                </span>
                <span className="file-type-badge">{getFileTypeLabel()}</span>
              </div>
            </div>
          </div>

          {material.description && (
            <div className="detail-description">
              <h3>Description</h3>
              <p>{material.description}</p>
            </div>
          )}

          <div className="detail-info">
            <div className="info-item">
              <span className="info-label">Subject</span>
              <span className="info-value">{subject || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Semester</span>
              <span className="info-value">Semester {material.semester}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Branch</span>
              <span className="info-value">{material.branch}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Uploaded By</span>
              <span className="info-value">{uploader || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Upload Date</span>
              <span className="info-value">
                {new Date(material.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="detail-rating">
            <div className="rating-section">
              <div className="rating-display">
                <svg viewBox="0 0 24 24" fill="#f3e88b" stroke="#d4a81d" strokeWidth="2" className="star-icon large">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="rating-value">{ratingData.average}</span>
                <span className="rating-count">({ratingData.count} ratings)</span>
              </div>
            </div>
            
            <div className="rate-section">
              <h4>Rate this material</h4>
              <RatingStars 
                materialId={material.id} 
                userId={user?.id}
                initialRating={0}
              />
            </div>
          </div>

          <div className="detail-actions">
            <a 
              href={material.file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary btn-download"
            >
              <span>⬇️</span>
              Download Material
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialDetail;