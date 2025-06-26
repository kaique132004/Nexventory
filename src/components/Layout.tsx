import React from 'react';
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  
  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      setPageTitle('Dashboard');
    } else if (path.startsWith('/users')) {
      setPageTitle('User Management');
    } else if (path.startsWith('/regions')) {
      setPageTitle('Region Management');
    } else if (path.startsWith('/supplies')) {
      setPageTitle('Supply Management');
    } else if (path.startsWith('/transactions')) {
      setPageTitle('Transactions');
    } else if (path.startsWith('/assets')) {
      setPageTitle('Assets (Preview)');
    }
  }, [location]);
  
  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <Header title={pageTitle} />
          
          <div id="main-content">
            <Outlet />
          </div>
          
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </main>
      </div>
    </div>
  );
};

export default Layout;


