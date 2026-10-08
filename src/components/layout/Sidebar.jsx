import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { businessNav, mainNav } from '../../config/navigation';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';

function NavItem({ item, onNavigate }) {
  return (
    <li>
      <NavLink
        to={item.to}
        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        onClick={onNavigate}
      >
        <Icon name={item.icon} size={20} />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

export default function Sidebar({ open, onClose }) {
  const { isAdmin, signOut } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Main navigation">
        <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
          <Icon name="x" />
        </button>
        <Logo variant="dark" />

        <nav>
          <ul className="nav-list">
            {mainNav.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onClose} />
            ))}
          </ul>

          {isAdmin && (
            <>
              <p className="nav-section-label">Business</p>
              <ul className="nav-list">
                {businessNav.map((item) => (
                  <NavItem key={item.to} item={item} onNavigate={onClose} />
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <ul className="nav-list">
            <NavItem item={{ to: '/settings', label: 'Settings', icon: 'settings' }} onNavigate={onClose} />
            <li>
              <button type="button" className="nav-link" onClick={handleLogout}>
                <Icon name="logout" size={20} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
