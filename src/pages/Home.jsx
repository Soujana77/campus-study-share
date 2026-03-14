import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import './Home.css';

function Home() {
  const features = [
    {
      icon: '📚',
      title: 'Extensive Study Materials',
      description: 'Access thousands of notes, assignments, and previous year questions shared by students across all branches.'
    },
    {
      icon: '🔒',
      title: 'Secure Campus Access',
      description: 'Your campus email ensures only students from your institution can access and share materials.'
    },
    {
      icon: '⭐',
      title: 'Rate & Review',
      description: 'Help others find the best resources by rating materials and reading reviews from fellow students.'
    },
    {
      icon: '📤',
      title: 'Easy Uploads',
      description: 'Share your notes with the community. Upload PDF, PPT, or PPTX files in just a few clicks.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description: 'Create your account using your campus email and academic details.'
    },
    {
      number: '02',
      title: 'Browse & Download',
      description: 'Explore materials from your branch and semester. Find exactly what you need.'
    },
    {
      number: '03',
      title: 'Contribute',
      description: 'Upload your own notes and study materials to help fellow students.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="container hero-content">
          <h1 className="hero-title">
            Share Knowledge,<br />
            <span className="gradient-text">Succeed Together</span>
          </h1>
          <p className="hero-subtitle">
            Your campus platform for sharing study materials, notes, and exam resources. 
            Connect with fellow students and access quality educational content.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-hero-primary">
              Get Started
            </Link>
            <Link to="/materials" className="btn-hero-secondary">
              Browse Materials
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">500+</span>
              <span className="stat-label">Study Materials</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100+</span>
              <span className="stat-label">Active Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">50+</span>
              <span className="stat-label">Subjects</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose CampusStudyShare?</h2>
            <p>Everything you need to excel in your academics</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section section bg-gray-50">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in three simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to Start Learning?</h2>
            <p className="cta-subtitle">
              Join thousands of students already sharing and accessing study materials.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn-cta-primary">
                Sign Up Now
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">📚</span>
              <span className="footer-name">CampusStudyShare</span>
            </div>
            <p className="footer-tagline">
              Empowering students through shared knowledge
            </p>
            <div className="footer-links">
              <span className="footer-copyright">
                © 2026 CampusStudyShare. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;