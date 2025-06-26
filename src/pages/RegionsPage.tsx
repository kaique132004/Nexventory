import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

type Region = {
  id: number;
  regionCode: string;
  regionName: string;
  cityName: string;
  countryName: string;
  stateName: string;
  addressCode: string;
  responsibleName: string;
  containsAgentsLocal: boolean;

};

const RegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const response = await API.get('/region');

      if (Array.isArray(response.data)) {
        setRegions(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      const err = error as any;
      setError('Failed to load regions. ' + (err.response?.data?.message || err.message));
      toast.error('Failed to load regions: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (regionCode: string) => {
    navigate(`/regions/edit/${regionCode}`);
  };

  const handleDelete = (regionCode: string) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete region ${regionCode}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteRegion(regionCode)
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const deleteRegion = async (regionCode: string) => {
    try {
      await API.delete(`region/${regionCode}`);
      toast.success('Region deleted successfully');
      loadRegions(); // Reload regions after deletion
    } catch (error) {
      console.error('Error deleting region:', error);
      const err = error as any;
      toast.error('Failed to delete region: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/regions/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i> Add New Region
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
          <h6 className="m-0 font-weight-bold text-primary">Regions</h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading regions...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                <thead className="table-light">
                  <tr>
                    <th>Region Code</th>
                    <th>Region Name</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">No regions found</td>
                    </tr>
                  ) : (
                    regions.map((region) => (
                      <tr key={region.id}>
                        <td>{region.regionCode}</td>
                        <td>{region.regionName}</td>
                        <td>{region.addressCode}</td>
                        <td>{region.cityName}</td>
                        <td>{region.stateName}</td>
                        <td>{region.countryName}</td>
                        
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(region.regionCode)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(region.regionCode)}
                          >
                            <i className="bi bi-trash"></i>
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

export default RegionsPage;


