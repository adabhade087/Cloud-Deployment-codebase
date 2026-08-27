import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceSwitcher.css';

const services = [
  { name: 'Deployment', path: '/deployment', icon: '🚀' },
  { name: 'Pipelines', path: '/pipelines', icon: '⚡' },
  { name: 'Infrastructure', path: '/infrastructure', icon: '🏗️' },
  { name: 'Monitoring', path: '/monitoring', icon: '📊' },
  { name: 'Cost Estimation', path: '/cost', icon: '💰' },
];

export default function ServiceSwitcher({ onClose }) {
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="service-switcher" ref={ref}>
      <div className="switcher-title">Switch Service</div>
      {services.map((s) => (
        <button
          key={s.path}
          className="switcher-item"
          onClick={() => handleSelect(s.path)}
        >
          <span className="switcher-icon">{s.icon}</span>
          <span>{s.name}</span>
        </button>
      ))}
    </div>
  );
}
