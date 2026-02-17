import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="page-content">
      <div className="container">
        <div className="about-page">
          <div className="section-label">About SlateMaker</div>
          <h1 className="section-title">BY MAKERS, FOR MAKERS</h1>
          <div className="section-divider"></div>

          <div className="about-content">
            <p>
              SlateMaker started with a simple idea: the Slate EV pickup is built for people who
              love to <strong>build, modify, and make things their own</strong>. With its
              service-it-yourself philosophy and modular design, the Slate provides the perfect 
              foundation for a dedicated maker community to rally around. .p
            </p>
            <p>
              Based in Central Indiana — near Slate's factory in Warsaw — SlateMaker is the
              go-to hub for <strong>open source designs, fabrication guides, and community knowledge</strong>.
              Whether you're 3D printing a custom phone mount or CNC-cutting a bed rack,
              this is your place.
            </p>
            <p>
              We believe in <strong>open source by default</strong>, helping each other learn,
              and making the Slate ownership experience better for everyone.
            </p>

            <h2>What We Offer</h2>
            <p>
              SlateMaker is a community-driven platform where Slate EV owners and enthusiasts
              can share 3D printable designs, CNC projects, electrical mods, service guides,
              and more. Every design in our repository is available for the community to
              download, remix, and improve.
            </p>

            <h2>Open Source Philosophy</h2>
            <p>
              We believe the best accessories and mods come from the community. By sharing
              designs openly, we enable faster iteration, better quality, and a richer
              ecosystem for every Slate owner. Creators retain credit for their work, and
              the community benefits from shared knowledge.
            </p>

            <h2>Get Involved</h2>
            <p>
              Whether you're a CAD expert, a weekend tinkerer, or just picking up your first
              Slate — there's a place for you here. Upload your designs, contribute to
              existing projects, help others troubleshoot, or just share your build stories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
