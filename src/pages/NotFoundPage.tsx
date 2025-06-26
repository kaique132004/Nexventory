import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  // Add a simple fade-in animation when the component mounts
  useEffect(() => {
    const container = document.getElementById('not-found-container');
    if (container) {
      container.style.opacity = '0';
      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transition = 'opacity 0.5s ease-in-out';
      }, 100);
    }
  }, []);

  return (
    <div 
      id="not-found-container" 
      className="d-flex flex-column justify-content-center align-items-center min-vh-100"
    >
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <p className="fs-3 text-dark">
          <span className="text-danger">Oops!</span> Page not found.
        </p>
        <p className="lead">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-4 animate__animated animate__bounce">
          <Link to="/" className="btn btn-primary btn-lg px-4 py-2">
            <i className="bi bi-house-door me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;


