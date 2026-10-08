import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../config/navigation';
import { initials } from '../../utils/format';
import Icon from '../ui/Icon';

/* Branch selector only appears when the business has more than one branch */
function BranchControl() {
  const { isMultiBranch, isAdmin, branches, selectedBranch, setSelectedBranchId } = useApp();

  if (isMultiBranch && isAdmin) {
    return (
      <div className="input-wrap has-icon branch-control">
        <Icon name="pin" size={16} className="input-icon" />
        <label htmlFor="branch-select" className="sr-only">
          Current branch
        </label>
        <select
          id="branch-select"
          className="select branch-select"
          value={selectedBranch.id}
          onChange={(e) => setSelectedBranchId(e.target.value)}
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} Branch
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <span className="branch-pill branch-control">
      <Icon name="pin" size={16} />
      {selectedBranch.name} Branch
    </span>
  );
}

function UserMenu() {
  const { currentUser, session, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="avatar">{initials(currentUser.name)}</span>
        <span className="user-chip-text">
          <span className="user-chip-name">{currentUser.name}</span>
          <span className="user-chip-role">{ROLE_LABELS[session.role]}</span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="dropdown" role="menu">
          <Link to="/settings" className="dropdown-item" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="settings" size={18} /> Settings
          </Link>
          <button
            type="button"
            className="dropdown-item"
            role="menuitem"
            onClick={() => {
              signOut();
              navigate('/login');
            }}
          >
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenu, alertCount }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar-menu" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" size={22} />
      </button>

      <div className="topbar-search">
        <div className="input-wrap has-icon">
          <Icon name="search" size={18} className="input-icon" />
          <label htmlFor="global-search" className="sr-only">
            Search
          </label>
          <input id="global-search" className="input" type="search" placeholder="Search products, batches..." />
        </div>
      </div>

      <div className="topbar-right">
        <BranchControl />
        {/* Risk alerts bell: later phase, hidden while alertCount is null */}
        {alertCount !== null && (
          <Link to="/risk" className="icon-btn notif-btn" aria-label={`${alertCount} high-risk alerts`}>
            <Icon name="bell" size={22} />
            {alertCount > 0 && <span className="notif-count">{alertCount}</span>}
          </Link>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
