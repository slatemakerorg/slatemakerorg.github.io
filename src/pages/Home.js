import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DesignCard from '../components/DesignCard';
import { ArrowRight, Wrench, Cpu, Zap, BookOpen, FolderOpen, GraduationCap } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchRecentDesigns() {
      // Small delay to let auth initialize first
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted) return;

      try {
        const { data, error } = await supabase
          .from('designs')
          .select('*, profiles(username)')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (!mounted) return;

        if (error) throw error;
        setRecentDesigns(data || []);
      } catch (err) {
        if (!mounted) return;
        console.error('[DEBUG] Home fetch error:', err.name, err.message, err);
        if (err.name !== 'AbortError') {
          console.error('Error fetching designs:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchRecentDesigns();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-grid"></div>
        <div className="home-hero-glow"></div>
        <div className="home-hero-content">
          <img
            src="/SlateMakerLogo.png"
            alt="SlateMaker — Build · Modify · Share"
            className="home-hero-logo"
          />
          <p className="home-hero-tagline">
            The open source maker community for the Slate EV pickup truck.
            Design, fabricate, and share accessories, mods, and upgrades — together.
          </p>
          <div className="home-hero-cta">
            <Link to="/designs" className="btn btn-primary">
              Browse Designs <ArrowRight size={16} />
            </Link>
            <Link to="/signup" className="btn btn-outline">
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="container">
          <div className="section-label">What We Do</div>
          <h2 className="section-title">BUILD · MODIFY · SHARE</h2>
          <div className="section-divider"></div>
          <div className="home-features-grid">
            <Link to="/designs?category=3D+Printing" className="home-feature-card">
              <Wrench size={28} className="home-feature-icon" />
              <h3>3D Printing</h3>
              <p>Download and share open source STL files for brackets, mounts, holders, and accessories designed for the Slate.</p>
            </Link>
            <Link to="/designs?category=CNC+%26+Fabrication" className="home-feature-card">
              <Cpu size={28} className="home-feature-icon" />
              <h3>CNC & Fabrication</h3>
              <p>Laser-cut panels, CNC-milled accessories, welded bumpers — share your designs and build processes.</p>
            </Link>
            <Link to="/designs?category=Electrical+%26+Wiring" className="home-feature-card">
              <Zap size={28} className="home-feature-icon" />
              <h3>Electrical & Wiring</h3>
              <p>Custom lighting, audio upgrades, wiring harnesses, and electrical mods documented for the community.</p>
            </Link>
            <Link to="/designs?category=Service+%26+Repair" className="home-feature-card">
              <BookOpen size={28} className="home-feature-icon" />
              <h3>Service & Repair</h3>
              <p>Slate is built to be serviced by you. Share repair guides, maintenance tips, and documentation.</p>
            </Link>
            <Link to="/designs" className="home-feature-card">
              <FolderOpen size={28} className="home-feature-icon" />
              <h3>Design Repository</h3>
              <p>A growing open source library of maker-created designs, version controlled and community reviewed.</p>
            </Link>
            <Link to="/guides" className="home-feature-card">
              <GraduationCap size={28} className="home-feature-icon" />
              <h3>Guides & Tutorials</h3>
              <p>Step-by-step build guides and video walkthroughs for every skill level.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Designs */}
      <section className="home-designs">
        <div className="container">
          <div className="home-designs-header">
            <div>
              <div className="section-label">Latest</div>
              <h2 className="section-title">RECENT DESIGNS</h2>
              <div className="section-divider"></div>
            </div>
            <Link to="/designs" className="btn btn-outline btn-small">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="loading-page"><div className="spinner"></div></div>
          ) : recentDesigns.length > 0 ? (
            <div className="home-designs-grid">
              {recentDesigns.map(design => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          ) : (
            <div className="home-designs-empty">
              <p>No designs shared yet — be the first!</p>
              <Link to="/upload" className="btn btn-primary">
                Upload a Design
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label">Get Started</div>
          <h2 className="section-title">READY TO BUILD?</h2>
          <div className="section-divider" style={{ marginLeft: 'auto', marginRight: 'auto' }}></div>
          <p className="home-cta-text">
            Join the SlateMaker community and start sharing your designs,
            learning from other makers, and building something amazing.
          </p>
          <div className="home-hero-cta">
            <Link to="/signup" className="btn btn-primary">
              Create an Account
            </Link>
            <a href="https://discord.gg/hA6PFSgX" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
