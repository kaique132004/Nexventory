import { API, useAuth } from '../auth/AuthContext';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';

type Permission = {
    id: number;
    permissionName: string;
    description?: string;
    isActive: boolean;
}

const PermissionsPage: React.FC = () => {
    const { user } = useAuth();

    const [permissions, setPermissions] = React.useState<Permission[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const navigate = useNavigate();


    const loadPermissions = async () => {
        setLoading(true);
        try {
            const response = await API.get<Permission[]>('/permission');
            if (Array.isArray(response.data)) {
                setPermissions(response.data);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error loading permissions:', err);
            setError('Failed to load permissions: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        requestAnimationFrame(() => {
            loadPermissions();
        });
    }, []);

    const handleEdit = (name: string) => {
        navigate(`/permissions/edit/${name}`);
    };

    const handleDelete = (name: string) => {
        confirmAlert({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete permission ${name}?`,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => deletePermission(name)
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    const deletePermission = async (name: string) => {
        try {
            await API.delete(`/permission/${name}`);
            toast.success('Permission deleted successfully');
            loadPermissions();
        } catch (err: any) {
            toast.error('Failed to delete permission: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container-fluid px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to="/permissions/new" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i> Add New Permission
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
                    <h6 className="m-0 font-weight-bold text-primary">Permissions</h6>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading permissions...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center">No permissions found</td>
                                        </tr>
                                    ) : (
                                        permissions.map((per) => (
                                            <tr key={per.id}>
                                                <td>{per.permissionName}</td>
                                                <td>{per.description}</td>
                                                <td>
                                                    {per.isActive
                                                        ? <span className="badge bg-success">Active</span>
                                                        : <span className="badge bg-secondary">Inactive</span>}
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(per.permissionName)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(per.permissionName)}
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
}

export default PermissionsPage;