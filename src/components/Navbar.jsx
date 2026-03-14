import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);
      }
    }
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        checkUser();
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">CampusStudyShare</span>
        </Link>

        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            {!user ? (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/materials" className="nav-link">Browse Materials</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link btn-nav">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/materials" className="nav-link">Browse Materials</Link>
                <Link to="/upload" className="nav-link">Upload</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="nav-link btn-nav btn-logout">
                  Logout
                </button>
              </>
            )}
          </div>
          
          {user && profile && (
            <div className="navbar-user">
              <span className="user-greeting">Hello, {profile.name}</span>
              <span className="user-info">{profile.branch} - Sem {profile.semester}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;