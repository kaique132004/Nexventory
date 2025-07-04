import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  regions?: { regionCode: string;[key: string]: any }[];
  permissions?: { permissionName: string;[key: string]: any }[];
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => {
      loadUsers();
    });
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/users');

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      const err = error as any;
      setError('Failed to load users. ' + (err?.message));
      toast.error('Failed to load users: ' + (err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId: string) => {
    navigate(`/users/edit/${userId}`);
  };

  const handleDelete = (userId: string, username: string) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete user ${username}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteUser(userId)
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };

  const deleteUser = async (userId: string) => {
    try {
      await API.delete(`/auth/users/${userId}`);
      toast.success('User deleted successfully');
      loadUsers(); // Refresh
    } catch (error) {
      console.error('Error deleting user:', error);
      const err = error as any;
      toast.error('Failed to delete user: ' + (err?.response?.data?.message || err?.message));
    }
  };

  const getRoleBadge = (role: string | undefined | null) => {
    const roleClasses: Record<string, string> = {
      'ADMIN': 'bg-danger',
      'SUPERVISOR': 'bg-warning',
      'USER': 'bg-primary',
      'GUEST': 'bg-secondary',
      'MASTER': 'bg-warning bg-gradient'
    };

    const badgeClass = role && roleClasses[role] ? roleClasses[role] : 'bg-info';
    return <span className={`badge ${badgeClass}`}>{role ?? 'Unknown'}</span>;
  };

  const renderRegionBadges = (regions: { regionCode: string }[] | undefined) => {
    if (!regions || regions.length === 0) {
      return <span className="text-muted">None</span>;
    }

    return regions.map((region, index) => (
      <span key={index} className="badge bg-secondary me-1">
        {region.regionCode}
      </span>
    ));
  };

  const renderPermissionBadges = (permissions: { permissionName: string }[] | undefined) => {
    if (!permissions || permissions.length === 0) {
      return <span className="text-muted">None</span>;
    }

    return permissions.map((perm, index) => (
      <span key={index} className="badge bg-info me-1">{perm.permissionName}</span>
    ));
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/users/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i> Add New User
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
          <h6 className="m-0 font-weight-bold text-primary">Users</h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Regions</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">No users found</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.firstName + " " + user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>
                          {user.isActive ?
                            <span className="badge bg-success">Active</span> :
                            <span className="badge bg-danger">Inactive</span>
                          }
                        </td>
                        <td>{renderRegionBadges(user.regions)}</td>
                        <td>{renderPermissionBadges(user.permissions)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(user.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(user.id, user.username)}
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

export default UsersPage;
