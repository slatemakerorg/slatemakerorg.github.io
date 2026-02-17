import React from 'react';
import './Community.css';

const PLATFORMS = [
  { name: 'Discord', handle: 'SlateMaker', url: 'https://discord.gg/hA6PFSgX', desc: 'Real-time chat, build discussions, design collaboration, and community support.' },
  { name: 'YouTube', handle: '@SlateMakerHQ', url: 'https://youtube.com/@SlateMakerHQ', desc: 'Build videos, design walkthroughs, install guides, and Slate news coverage.' },
  { name: 'GitHub', handle: 'slatemakerorg', url: 'https://github.com/slatemakerorg', desc: 'Open source design files, STLs, documentation, and version-controlled projects.' },
  { name: 'Reddit', handle: 'r/SlateMaker', url: 'https://reddit.com/r/SlateMaker', desc: 'Community discussion, build showcases, design requests, and Slate news.' },
  { name: 'Instagram', handle: '@slatemakerorg', url: 'https://instagram.com/slatemakerorg', desc: 'Build photos, project showcases, and behind-the-scenes maker content.' },
  { name: 'X / Twitter', handle: '@SlateMakerOrg', url: 'https://x.com/SlateMakerOrg', desc: 'Quick updates, Slate news, and community highlights.' },
  { name: 'TikTok', handle: '@slatemaker', url: 'https://tiktok.com/@slatemaker', desc: 'Short-form maker content, time-lapses, and quick build clips.' },
  { name: 'Printables', handle: 'SlateMaker', url: 'https://www.printables.com/@SlateMaker_4408798', desc: '3D printable designs and STL files for the Slate community.' },
  { name: 'Thingiverse', handle: 'SlateMaker', url: 'https://www.thingiverse.com/slatemaker', desc: 'Additional 3D printable designs hosted on the Thingiverse platform.' },
];

export default function Community() {
  return (
    <div className="page-content">
      <div className="container">
        <div className="section-label">Find Us</div>
        <h1 className="section-title">JOIN THE COMMUNITY</h1>
        <div className="section-divider"></div>

        <div className="community-grid">
          {PLATFORMS.map(platform => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="community-card card"
            >
              <span className="community-card-platform">{platform.name}</span>
              <span className="community-card-handle">{platform.handle}</span>
              <span className="community-card-desc">{platform.desc}</span>
              <span className="community-card-arrow">&rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
