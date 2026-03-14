import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './MaterialCard.css';

function MaterialCard({ material }) {
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [uploaderName, setUploaderName] = useState('Unknown');
  const [subjectName, setSubjectName] = useState('Unknown Subject');

  useEffect(() => {
    async function fetchRating() {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('material_id', material.id);

      if (!error && data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setRatingData({
          average: (sum / data.length).toFixed(1),
          count: data.length
        });
      }
    }

    async function fetchUploaderName() {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', material.uploaded_by)
        .single();
      
      if (data) setUploaderName(data.name);
    }

    async function fetchSubjectName() {
      const { data } = await supabase
        .from('subjects')
        .select('subject_name')
        .eq('id', material.subject_id)
        .single();
      
      if (data) setSubjectName(data.subject_name);
    }
    
    fetchRating();
    fetchUploaderName();
    fetchSubjectName();
  }, [material.id]);

  const getFileIcon = () => {
    const fileType = material.file_type?.toLowerCase();
    if (fileType === 'pdf') return '📄';
    if (fileType === 'ppt' || fileType === 'pptx') return '📊';
    return '📁';
  };

  const getTypeLabel = () => {
    const types = {
      'notes': 'Notes',
      'assignment': 'Assignment',
      'pyq': 'PYQ'
    };
    return types[material.material_type] || material.material_type;
  };

  return (
    <div className="material-card card-elevated">
      <div className="material-card-header">
        <span className="file-icon">{getFileIcon()}</span>
        <span className={`material-type-badge ${material.material_type}`}>
          {getTypeLabel()}
        </span>
      </div>
      
      <h3 className="material-title">{material.title}</h3>
      
      <div className="material-meta">
        <span className="meta-item">
          <span className="meta-icon">📚</span>
          {subjectName}
        </span>
        <span className="meta-item">
          <span className="meta-icon">🎓</span>
          Sem {material.semester}
        </span>
        <span className="meta-item">
          <span className="meta-icon">👤</span>
          {uploaderName}
        </span>
      </div>
      
      <div className="material-rating">
        <div className="rating-display">
          <svg viewBox="0 0 24 24" fill="#f3e88b" stroke="#d4a81d" strokeWidth="2" className="star-icon">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="rating-value">{ratingData.average}</span>
          <span className="rating-count">({ratingData.count})</span>
        </div>
      </div>
      
      <div className="material-actions">
        <Link to={`/materials/${material.id}`} className="btn-view">
          View Details
        </Link>
        <a 
          href={material.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-download"
        >
          Download
        </a>
      </div>
    </div>
  );
}

export default MaterialCard;