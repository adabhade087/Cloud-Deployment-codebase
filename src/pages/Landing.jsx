import { Link } from 'react-router-dom';
import { landingServices } from '../data/mockData';
import ServiceCard from '../components/ServiceCard';
import './Landing.css';

export default function Landing() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6366f1"/>
              <path d="M8 20L16 8L24 20H8Z" fill="#a5b4fc"/>
            </svg>
            <span>Cloud Orbit</span>
          </Link>
          <div className="landing-nav-links hide-mobile">
            <a href="#hero">Home</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}>Features</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
            <a href="#about">About</a>
            <a href="#docs">Documentation</a>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/login" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section id="hero" className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">Cloud-Native DevOps Platform</div>
            <h1 className="hero-title">
              Deploy. Manage.<br />
              <span className="gradient-text">Monitor. Optimize.</span>
            </h1>
            <p className="hero-desc">
              A unified cloud-native DevOps platform for deployment pipelines,
              infrastructure management, monitoring and cloud cost optimization.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">Get Started</Link>
              <button className="btn btn-secondary btn-lg" onClick={scrollToFeatures}>Explore Platform</button>
            </div>
            <div className="hero-stats">
              <div><strong>99.9%</strong><span>Uptime SLA</span></div>
              <div><strong>500+</strong><span>Deployments/day</span></div>
              <div><strong>40%</strong><span>Cost savings</span></div>
            </div>
          </div>
          <div className="hero-visual animate-fade-in">
            <div className="hero-dashboard">
              <div className="hd-header">
                <div className="hd-dots"><span/><span/><span/></div>
                <span className="hd-title">Infrastructure Overview</span>
              </div>
              <div className="hd-metrics">
                <div className="hd-metric"><span className="hd-val green">98.4%</span><span>Health</span></div>
                <div className="hd-metric"><span className="hd-val blue">24</span><span>Deploys</span></div>
                <div className="hd-metric"><span className="hd-val purple">12</span><span>Pipelines</span></div>
                <div className="hd-metric"><span className="hd-val orange">₹42K</span><span>Cost/mo</span></div>
              </div>
              <div className="hd-chart">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85].map((h, i) => (
                  <div key={i} className="hd-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <div className="hd-status">
                <div className="hd-status-item"><span className="status-dot green"/> api-gateway — Running</div>
                <div className="hd-status-item"><span className="status-dot green"/> k8s-cluster — Healthy</div>
                <div className="hd-status-item"><span className="status-dot orange"/> pipeline-build — In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Everything you need to ship faster</h2>
            <p>One platform for your entire cloud infrastructure lifecycle</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '🚀', title: 'One-Click Deployments', desc: 'Deploy to any environment with automated rollbacks and release management.' },
              { icon: '⚡', title: 'Visual Pipelines', desc: 'Build, test, and deploy with intuitive CI/CD workflow orchestration.' },
              { icon: '🏗️', title: 'Infrastructure as Code', desc: 'Manage cloud resources with Terraform and Kubernetes integration.' },
              { icon: '📊', title: 'Real-time Monitoring', desc: 'Metrics, logs, alerts, and health checks across your entire stack.' },
              { icon: '💰', title: 'Cost Optimization', desc: 'Track spending, set budgets, and get actionable savings recommendations.' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'Role-based access, audit logs, and compliance-ready infrastructure.' },
            ].map((f, i) => (
              <div key={i} className="feature-card card card-hover">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="landing-section services-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Platform Services</h2>
            <p>Explore our integrated DevOps services</p>
          </div>
          <div className="grid-auto">
            {landingServices.map((s) => (
              <ServiceCard key={s.id} icon={s.icon} name={s.name} description={s.description} status={s.status} route={s.route} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="landing-section">
        <div className="section-inner about-section">
          <div className="about-content">
            <h2>Built for modern cloud teams</h2>
            <p>NexusCloud brings together deployment, pipeline orchestration, infrastructure management, monitoring, and cost optimization into a single unified platform designed for developers and DevOps engineers.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="landing-logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#6366f1"/>
                <path d="M8 20L16 8L24 20H8Z" fill="#a5b4fc"/>
              </svg>
              NexusCloud
            </span>
            <p>Cloud-native DevOps platform</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <Link to="/login">Login</Link>
          </div>
          <p className="footer-copy">&copy; 2026 NexusCloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
