import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Button from "../ui/Button";
import API from "../api/axios";
import { useEffect, useState } from "react";

export default function Landing() {
  const [stats, setStats] = useState({ users: 0, donations: 0, requests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/public/stats');
      if (res.data && res.data.data) {
        setStats({ users: res.data.data.users || 0, donations: res.data.data.donations || 0, requests: res.data.data.requests || 0 });
      } else {
        setError('Invalid response');
      }
    } catch (e) {
      setError('Unable to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="landing-root">
      <header className="landing-header container">
        <div className="brand">
          <div className="brand-mark">BD</div>
          <div>
            <div className="brand-title">BDMS</div>
            <div className="muted brand-sub">Blood Donation Management</div>
          </div>
        </div>
        <div className="landing-actions">
          <Link to="/login"><Button>Log In / Register</Button></Link>
        </div>
      </header>

      <main className="container landing-hero">
        <section className="hero-left">
          <h1 className="hero-title">Coordinating Donations, Inventory and Care</h1>
          <p className="hero-sub muted">A secure, role-based platform to manage donors, blood banks and hospital requests with visibility and audit trails.</p>
          {/* Single authentication action to avoid duplicates */}

          <div className="feature-grid">
            <Card className="feature-card">
              <h3>Donors</h3>
              <p className="muted">Register and track donations with ease.</p>
            </Card>
            <Card className="feature-card">
              <h3>Blood Banks</h3>
              <p className="muted">Manage inventory and fulfill requests.</p>
            </Card>
            <Card className="feature-card">
              <h3>Hospitals</h3>
              <p className="muted">Request blood and receive updates quickly.</p>
            </Card>
            <Card className="feature-card">
              <h3>Admins</h3>
              <p className="muted">Govern users, logs and system health.</p>
            </Card>
          </div>
        </section>

        <aside className="hero-right">
          <Card>
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label muted">Total Users</div>
                <div className="stat-value">{loading ? 'Loading…' : error ? '—' : stats.users}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label muted">Total Donations</div>
                <div className="stat-value">{loading ? 'Loading…' : error ? '—' : stats.donations}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label muted">Total Requests</div>
                <div className="stat-value">{loading ? 'Loading…' : error ? '—' : stats.requests}</div>
              </div>
            </div>
            {error && <div className="muted" style={{ marginTop: 8 }}>Error loading stats</div>}
          </Card>

          <Card style={{ marginTop: 12 }}>
            <h3>Why BDMS?</h3>
            <ul className="muted why-list">
              <li>Role based access control for secure operations</li>
              <li>Audit trails for transparency and compliance</li>
              <li>Centralized inventory and request management</li>
            </ul>
          </Card>
        </aside>
      </main>
    </div>
  );
}
