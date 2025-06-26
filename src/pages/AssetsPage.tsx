import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const AssetsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_MASTER');
  const [loading, setLoading] = useState(true);

  // Simulate loading delay for the preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Sample placeholder data for asset statistics
  const assetStats = {
    totalAssets: 128,
    totalValue: 245000,
    categories: [
      { name: 'Computers', count: 45, value: 90000 },
      { name: 'Office Equipment', count: 32, value: 48000 },
      { name: 'Furniture', count: 25, value: 37500 },
      { name: 'Vehicles', count: 12, value: 60000 },
      { name: 'Other', count: 14, value: 9500 }
    ]
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Display admin-only message if not admin
  if (!isAdmin) {
    return (
      <div className="container-fluid px-4">
        <div className="alert alert-warning mt-4">
          <h4 className="alert-heading">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Admin Access Required
          </h4>
          <p>This section is only available to administrators.</p>
          <hr />
          <p className="mb-0">
            <Link to="/" className="alert-link">Return to Dashboard</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">Assets Management</h1>
        <Link to="/" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
        </Link>
      </div>

      {/* Coming Soon Banner */}
      <div className="card bg-gradient-primary text-white shadow mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-white">
                <i className="bi bi-pc-display me-2"></i>
                Asset Management
              </h2>
              <p className="lead mb-0">Coming Soon - This feature is currently in development</p>
            </div>
            <div>
              <span className="badge bg-warning p-2 fs-6">Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Assets
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      assetStats.totalAssets
                    )}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-collection fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Value
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      formatCurrency(assetStats.totalValue)
                    )}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-currency-dollar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Active Assignments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      42
                    )}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-person-badge fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pending Maintenance
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      7
                    )}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-tools fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Asset Categories</h6>
              <div className="dropdown no-arrow">
                <button className="btn btn-sm btn-outline-primary" disabled>
                  <i className="bi bi-download me-1"></i> Export
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Total Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetStats.categories.map((category, index) => (
                        <tr key={index}>
                          <td>{category.name}</td>
                          <td>{category.count}</td>
                          <td>{formatCurrency(category.value)}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1" disabled>
                              <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" disabled>
                              <i className="bi bi-pencil"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Coming Features</h6>
            </div>
            <div className="card-body">
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  Asset Tracking
                  <span className="badge bg-primary rounded-pill">Q3 2025</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  Maintenance Scheduling
                  <span className="badge bg-primary rounded-pill">Q3 2025</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  QR Code Integration
                  <span className="badge bg-secondary rounded-pill">Q4 2025</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  Depreciation Tracking
                  <span className="badge bg-secondary rounded-pill">Q4 2025</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  Audit Trail
                  <span className="badge bg-secondary rounded-pill">Q1 2026</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-0 text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  Asset management features are currently in development. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Feedback</h6>
            </div>
            <div className="card-body">
              <p className="mb-3">
                We'd love to hear your thoughts on what features you'd like to see in the asset management module.
              </p>
              <button className="btn btn-primary w-100" disabled>
                <i className="bi bi-chat-dots me-1"></i> Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;


