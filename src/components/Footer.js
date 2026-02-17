import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          SLATE<span>MAKER</span>.ORG
        </div>
        <ul className="footer-links">
          <li><a href="https://discord.gg/hA6PFSgX" target="_blank" rel="noopener noreferrer">Discord</a></li>
          <li><a href="https://youtube.com/@SlateMakerHQ" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          <li><a href="https://github.com/slatemakerorg" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="https://reddit.com/r/SlateMaker" target="_blank" rel="noopener noreferrer">Reddit</a></li>
          <li><a href="https://instagram.com/slatemakerorg" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://x.com/SlateMakerOrg" target="_blank" rel="noopener noreferrer">X</a></li>
        </ul>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} SlateMaker.org — An open source community project. Not affiliated with Slate Auto.
        </div>
      </div>
    </footer>
  );
}
