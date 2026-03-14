import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MaterialCard from '../components/MaterialCard';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [myMaterials, setMyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
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
      loadMyMaterials(user.id);
      setLoading(false);
    }
    
    async function loadMyMaterials(userId) {
      const { data } = await supabase
        .from('materials')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false });
      
      if (data) setMyMaterials(data);
    }
    
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header card">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <div className="profile-meta">
              <span className="meta-item">
                <span className="meta-icon">🎓</span>
                {profile.branch}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📚</span>
                Semester {profile.semester}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📅</span>
                Year {profile.year}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{myMaterials.length}</span>
            <span className="stat-label">Materials Uploaded</span>
          </div>
        </div>

        <section className="profile-section">
          <div className="section-header">
            <h2>My Uploads</h2>
            <Link to="/upload" className="btn-add">
              + Add New
            </Link>
          </div>

          {myMaterials.length > 0 ? (
            <div className="materials-grid">
              {myMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📂</span>
              <h3>No materials uploaded yet</h3>
              <p>Start sharing your notes with your fellow students!</p>
              <Link to="/upload" className="btn-primary">
                Upload Material
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;