import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, API_SUPPLY_API } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

interface RegionalPrices {
  regionCode: string;
  price: number | string;
  currency?: string;
  quantity?: number;
  supplier?: string;
}

interface Supply {
  id?: string | number;
  supplyName: string;
  description?: string;
  regionalPrices?: RegionalPrices[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const SuppliesPage: React.FC = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => {
      loadSupplies();
    });
  }, []);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const response = await API_SUPPLY_API.get('supply/list');

      if (response.data && Array.isArray(response.data)) {
        setSupplies(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading supplies:', error);
      const err = error as any;
      setError('Failed to load supplies. ' + (err?.response?.data?.message || err?.message));
      toast.error('Failed to load supplies: ' + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplyId: any) => {
    navigate(`/supplies/edit/${supplyId}`);
  };

  const handleDelete = (supplyId: any, supplyName: any) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete supply "${supplyName}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteSupply(supplyId)
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const deleteSupply = async (supplyId: any) => {
    try {
      await API_SUPPLY_API.delete(`supply/del/${supplyId}`);
      toast.success('Supply deleted successfully');
      loadSupplies(); // Reload supplies after deletion
    } catch (error) {
      console.error('Error deleting supply:', error);
      const err = error as any;
      toast.error('Failed to delete supply: ' + (err?.response?.data?.message || err?.message));
    }
  };

  // Helper function to render supply regions and prices as badges
  const renderRegionalPrices = (regionalPrices: any[] | undefined) => {
    if (!regionalPrices || !Array.isArray(regionalPrices) || regionalPrices.length === 0) {
      return <span className="text-muted">None</span>;
    }

    return regionalPrices.map((rp, index) => {
      const currency = rp.currency || 'USD';
      const price = parseFloat(rp.price).toFixed(2);
      return (
        <span
          key={index}
          className="badge bg-info me-1 mb-1"
          title={`Price: ${price} ${currency}, Stock: ${rp.quantity || 0}`}
        >
          {rp.regionCode}: {price} {currency}
        </span>
      );
    });
  };

  const handleAddTransaction = (supplyId: any, supplyName: string | number | boolean) => {
    // Navigate to new transaction page with supply pre-selected
    navigate(`/transactions/new?supply=${supplyId}&name=${encodeURIComponent(supplyName)}`);
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">Supply Management</h1>
        <Link to="/supplies/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i> Add New Supply
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Supplies</h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading supplies...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                <thead className="table-light">
                  <tr>
                    <th>Supply Name</th>
                    <th>Description</th>
                    <th>Regional Prices</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center">No supplies found</td>
                    </tr>
                  ) : (
                    supplies.map((supply) => (
                      <tr key={supply.id}>
                        <td>{supply.supplyName}</td>
                        <td>{supply.description || '-'}</td>
                        <td>
                          <div className="d-flex flex-wrap">
                            {renderRegionalPrices(supply.regionalPrices)}
                          </div>
                        </td>
                        <td>
                          {supply.isActive ?
                            <span className="badge bg-success">Active</span> :
                            <span className="badge bg-danger">Inactive</span>
                          }
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(supply.id)}
                            title="Edit supply"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => handleDelete(supply.id, supply.supplyName)}
                            title="Delete supply"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleAddTransaction(supply.id, supply.supplyName)}
                            title="Add transaction for this supply"
                          >
                            <i className="bi bi-plus-circle"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuppliesPage;


