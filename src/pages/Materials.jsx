import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MaterialCard from '../components/MaterialCard';
import './Materials.css';

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Allow access even if not logged in, but with limited visibility
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);
      } else {
        // For non-logged in users, use default filters
        setProfile({ branch: 'CSE', semester: 8 });
      }
      setLoading(false);
    }
    
    checkUser();
  }, []);

  useEffect(() => {
    if (!profile) return;
    
    async function loadSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('branch', profile.branch)
        .order('subject_name');
      
      if (data) setSubjects(data);
    }
    
    loadSubjects();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    
    async function loadMaterials() {
      let query = supabase
        .from('materials')
        .select('*')
        .eq('branch', profile.branch)
        .lte('semester', profile.semester)
        .order('created_at', { ascending: false });

      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject);
      }

      if (selectedType) {
        query = query.eq('material_type', selectedType);
      }

      if (selectedSemester) {
        query = query.eq('semester', parseInt(selectedSemester));
      }

      const { data } = await query;
      if (data) setMaterials(data);
    }
    
    loadMaterials();
  }, [profile, selectedSubject, selectedType, selectedSemester]);

  function clearFilters() {
    setSelectedSubject('');
    setSelectedType('');
    setSelectedSemester('');
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="materials-page">
      <div className="container">
        <div className="materials-header">
          <h1>Browse Study Materials</h1>
          <p>Find notes, assignments, and previous year questions from your campus</p>
        </div>

        {/* Filters */}
        <div className="materials-filters card">
          <div className="filter-row">
            <div className="filter-group">
              <label>Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
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
              <label>Material Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="notes">Notes</option>
                <option value="assignment">Assignment</option>
                <option value="pyq">PYQ</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Semester</label>
              <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">All Semesters</option>
                {[...Array(profile?.semester || 8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semester {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="materials-results">
          <div className="results-header">
            <span className="results-count">{materials.length} materials found</span>
          </div>

          {materials.length > 0 ? (
            <div className="materials-grid">
              {materials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No materials found</h3>
              <p>Try adjusting your filters or be the first to upload!</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/upload')}
              >
                Upload Material
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Materials;