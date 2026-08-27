import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span className="breadcrumb-sep">/</span>}
          {item.path && i < items.length - 1 ? (
            <Link to={item.path} className="breadcrumb-link">{item.label}</Link>
          ) : (
            <span className={i === items.length - 1 ? 'breadcrumb-current' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
