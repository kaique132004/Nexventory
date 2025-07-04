import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  const isMaster = hasRole('MASTER');
  const isAdmin = hasRole('ADMIN');
  const isSupervisor = hasRole('SUPERVISOR');
  const isGuest = hasRole('GUEST');
  const isRegularUser = hasRole('USER');

  const showUserManagement = isAdmin || isSupervisor || isMaster;
  const showPermissions = !isGuest;
  const showRegions = isAdmin || isSupervisor || isMaster;

  return (
    <nav
      id="sidebar"
      className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse d-flex flex-column"
      style={{ minHeight: '100vh' }}
    >
      <div className="pt-3 flex-grow-1">
        <div className="text-center mb-4">
          <h5 className="text-white">
            <img src="/logo.png" alt="Logo" className="logo w-100 p-3" />
          </h5>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </NavLink>
          </li>

          {showUserManagement && (
            <li className="nav-item">
              <NavLink to="/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <i className="bi bi-people me-2"></i>Users
              </NavLink>
            </li>
          )}

          {showPermissions && (
            <li className="nav-item">
              <NavLink to="/permissions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <i className="bi bi-shield-lock me-2"></i>Permissions
              </NavLink>
            </li>
          )}

          {showRegions && (
            <li className="nav-item">
              <NavLink to="/regions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <i className="bi bi-geo-alt me-2"></i>Regions
              </NavLink>
            </li>
          )}

          <li className="nav-item">
            <NavLink to="/supplies" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-box-seam me-2"></i>Supplies
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/transactions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <i className="bi bi-arrow-left-right me-2"></i>Transactions
            </NavLink>
          </li>

          {isMaster && (
            <li className="nav-item">
              <NavLink to="/assets" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                <i className="bi bi-pc-display me-2"></i>Assets (Preview)
              </NavLink>
            </li>
          )}
        </ul>
      </div>

      {/* Rodapé sempre no final do sidebar, sem sobrepor conteúdo */}
      <div className="text-center text-secondary small py-3 mt-auto">
        © 2025
      </div>
    </nav>
  );
};

export default Sidebar;
