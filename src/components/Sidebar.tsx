import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isGuest = hasRole('GUEST');
  const isSupervisor = hasRole('SUPERVISOR');
  const isRegularUser = hasRole('USER');
  
  return (
    <nav id="sidebar" className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
      <div className="position-sticky pt-3">
        <div className="text-center mb-4">
          <h5 className="text-white">Stock Management</h5>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
              end
            >
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </NavLink>
          </li>
          
          {/* Only ADMIN, and SUPERVISOR can see users */}
          {!isGuest && !isRegularUser && (
            <li className="nav-item">
              <NavLink 
                to="/users" 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
              >
                <i className="bi bi-people me-2"></i>Users
              </NavLink>
            </li>
          )}
          
          {/* Only ADMIN and SUPERVISOR can see regions */}
          {!isGuest && !isRegularUser && (
            <li className="nav-item">
              <NavLink 
                to="/regions" 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
              >
                <i className="bi bi-geo-alt me-2"></i>Regions
              </NavLink>
            </li>
          )}
          
          <li className="nav-item">
            <NavLink 
              to="/supplies" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="bi bi-box-seam me-2"></i>Supplies
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink 
              to="/transactions" 
              className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
            >
              <i className="bi bi-arrow-left-right me-2"></i>Transactions
            </NavLink>
          </li>
          
          {/* Only ADMIN can see assets (preview) */}
          {isAdmin && (
            <li className="nav-item">
              <NavLink 
                to="/assets" 
                className={({isActive}) => isActive ? "nav-link active" : "nav-link"}
              >
                <i className="bi bi-pc-display me-2"></i>Assets (Preview)
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;


