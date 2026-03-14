import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MaterialCard from '../components/MaterialCard';
import './Dashboard.css';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [trendingMaterials, setTrendingMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
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
      setLoading(false);
    }
    
    checkUser();
  }, []);

  useEffect(() => {
    if (!profile) return;
    
    // Fetch subjects
    async function loadSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('branch', profile.branch)
        .order('subject_name');
      
      if (data) setSubjects(data);
    }
    
    // Fetch recent materials
    async function loadRecentMaterials() {
      let query = supabase
        .from('materials')
        .select('*')
        .eq('branch', profile.branch)
        .lte('semester', profile.semester)
        .order('created_at', { ascending: false })
        .limit(6);

      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }

      if (selectedSemester) {
        query = query.eq('semester', parseInt(selectedSemester));
      }

      const { data } = await query;
      if (data) setRecentMaterials(data);
    }
    
    // Fetch trending materials
    async function loadTrendingMaterials() {
      const { data: materials } = await supabase
        .from('materials')
        .select('*')
        .eq('branch', profile.branch)
        .lte('semester', profile.semester);

      if (materials) {
        const materialsWithRatings = await Promise.all(
          materials.map(async (material) => {
            const { data: ratings } = await supabase
              .from('ratings')
              .select('rating')
              .eq('material_id', material.id);
            
            const avgRating = ratings?.length 
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
              : 0;
            
            return { ...material, avgRating, ratingCount: ratings?.length || 0 };
          })
        );

        const trending = materialsWithRatings
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 3);
        
        setTrendingMaterials(trending);
      }
    }
    
    loadSubjects();
    loadRecentMaterials();
    loadTrendingMaterials();
  }, [profile, selectedSubject, selectedSemester]);

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
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {profile.name}! 👋</h1>
            <p>Here's what's happening with your study materials</p>
          </div>
          <div className="quick-stats">
            <div className="stat-card">
              <span className="stat-icon">🎓</span>
              <div className="stat-info">
                <span className="stat-value">{profile.branch}</span>
                <span className="stat-label">Branch</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📚</span>
              <div className="stat-info">
                <span className="stat-value">Sem {profile.semester}</span>
                <span className="stat-label">Semester</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/upload" className="action-card">
            <span className="action-icon">📤</span>
            <span className="action-text">Upload Material</span>
          </Link>
          <Link to="/materials" className="action-card">
            <span className="action-icon">🔍</span>
            <span className="action-text">Browse All</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span className="action-text">My Profile</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <h2>Filter Materials</h2>
          <div className="filters">
            <div className="filter-group">
              <label>Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="filter-select"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Semester</label>
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="filter-select"
              >
                <option value="">All Semesters</option>
                {[...Array(profile.semester)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semester {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trending Materials */}
        {trendingMaterials.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>🔥 Trending Materials</h2>
              <Link to="/materials" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="materials-grid">
              {trendingMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Materials */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>📚 Recent Materials</h2>
            <Link to="/materials" className="view-all-link">
              View All →
            </Link>
          </div>
          {recentMaterials.length > 0 ? (
            <div className="materials-grid">
              {recentMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No materials found</h3>
              <p>Try adjusting your filters or upload some materials yourself!</p>
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

export default Dashboard;