import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { API } from '../auth/AuthContext';
import { toast } from 'react-toastify';

type Permission = {
  id?: number;
  permissionName: string;
  description?: string;
  isActive: boolean;
};

const PermissionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    let mounted = true;
    if (isEditMode && id) {
      (async () => {
        try {
          const response = await API.get(`/permission/${id}`);
          if (mounted) {
            setPermission(response.data);
          }
        } catch (error) {
          toast.error('Error loading permission.');
          navigate('/permissions');
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, navigate]);

  const initialValues: Permission = permission || {
    permissionName: '',
    description: '',
    isActive: true,
  };

  const validationSchema = Yup.object().shape({
    permissionName: Yup.string()
      .required('Permission name is required')
      .max(100, 'Must be 100 characters or less'),
    description: Yup.string().max(250, 'Must be 250 characters or less'),
    isActive: Yup.boolean(),
  });

  const handleSubmit = async (values: Permission, { setSubmitting }: any) => {
    try {
      if (isEditMode && id) {
        await API.put(`/permission/${id}`, values);
        toast.success('Permission updated successfully');
      } else {
        await API.post('/permission', values);
        toast.success('Permission created successfully');
      }
      navigate('/permissions');
    } catch (error: any) {
      toast.error('Error saving permission: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading permission data...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          {isEditMode ? 'Edit Permission' : 'Create Permission'}
        </h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/permissions')}>
          <i className="bi bi-arrow-left me-1"></i> Back to Permissions
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Permission Information</h6>
        </div>
        <div className="card-body">
          <Formik
            key={id || 'new'}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="permissionName" className="form-label">Permission Name</label>
                  <Field
                    type="text"
                    id="permissionName"
                    name="permissionName"
                    className="form-control"
                    placeholder="e.g. MANAGE_USERS"
                  />
                  <ErrorMessage name="permissionName" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    className="form-control"
                    placeholder="Description of the permission"
                  />
                  <ErrorMessage name="description" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-check form-switch mb-3">
                  <Field name="isActive">
                    {({ field }: any) => (
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={field.value}
                        onChange={() => {
                          field.onChange({ target: { name: field.name, value: !field.value } });
                        }}
                      />
                    )}
                  </Field>
                  <label className="form-check-label" htmlFor="isActive">Active</label>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Permission'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default PermissionFormPage;
