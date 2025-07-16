import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 className="h2">{title || 'Dashboard'}</h1>
      <div className="btn-toolbar mb-2 mb-md-0">
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            id="user-dropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle me-1"></i>
            <span id="current-user">{user?.name || user?.username || 'User'}</span>
          </button>
          <ul className="dropdown-menu" aria-labelledby="user-dropdown">
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;


