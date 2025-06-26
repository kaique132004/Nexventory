import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { API } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

type Region = {
  id: number;
  regionCode: string;
  regionName: string;
  cityName: string;
};

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  regionCodes?: { regionCode: string }[];
};

const UserFormPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = !!userId;
  const navigate = useNavigate();

  const [user, setUser] = useState<UserFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    isActive: true,
  });


  const [regions, setRegions] = useState<Region[]>([]);
  const [assignedRegionCodes, setAssignedRegionCodes] = useState<string[]>([]);
  const [selectedAvailableCodes, setSelectedAvailableCodes] = useState<string[]>([]);
  const [selectedAssignedCodes, setSelectedAssignedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditMode);

  const schema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: isEditMode ? Yup.string() : Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
  });

  useEffect(() => {
    API.get('/region')
      .then((res) => setRegions(res.data))
      .catch(() => toast.error('Error loading regions'));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      API.get(`/auth/users/${userId}`)
        .then((res) => {
          const data = res.data;
          setUser({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            password: '',
            role: data.role || '',
            isActive: data.isActive ?? true,
          });

          // CORRIGIDO AQUI 👇
          setAssignedRegionCodes(data.regions?.map((r: any) => r.regionCode) || []);
        })
        .catch(() => {
          toast.error('User not found');
          navigate('/users');
        })
        .finally(() => setLoading(false));
    }
  }, [userId, isEditMode, navigate]);


  const availableRegions = useMemo(
    () => regions.filter((r) => !assignedRegionCodes.includes(r.regionCode)),
    [regions, assignedRegionCodes]
  );

  const assignedRegions = useMemo(
    () => regions.filter(r => assignedRegionCodes.some(code => code.toUpperCase() === r.regionCode.toUpperCase())),
    [regions, assignedRegionCodes]
  );

  const assignSelected = () => {
    setAssignedRegionCodes((prev) => [...prev, ...selectedAvailableCodes]);
    setSelectedAvailableCodes([]);
  };

  const unassignSelected = () => {
    setAssignedRegionCodes((prev) => prev.filter((code) => !selectedAssignedCodes.includes(code)));
    setSelectedAssignedCodes([]);
  };

  const handleSubmit = async (values: UserFormValues, { setSubmitting }: any) => {
    try {
      const payload = {
        ...values,
        password: values.password || undefined,
        regionCodes: assignedRegionCodes.map((code) => ({ regionCode: code })),
        isNotTemporary: true,
        permissions: [],
        siteSettings: {},
        accountNonExpired: true,
        accountNonLocked: true,
        credentialsNonExpired: true,
      };


      if (isEditMode) {
        await API.put(`/auth/update/${userId}`, payload);
        toast.success('User updated successfully');
      } else {
        await API.post('/auth/register', payload);
        toast.success('User created successfully');
      }

      navigate('/users');
    } catch {
      toast.error('Error saving user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading user data...</div>;
  }

  return (
    <div className="container py-4">
      <h2>{isEditMode ? 'Edit User' : 'Create User'}</h2>

      <Formik
        initialValues={user}
        validationSchema={schema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#info" type="button">
                  User
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link" data-bs-toggle="tab" data-bs-target="#regions" type="button">
                  Regions
                </button>
              </li>
            </ul>

            <div className="tab-content">
              <div className="tab-pane fade show active" id="info">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <Field
                      name="firstName"
                      type="text"
                      className={`form-control ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <Field
                      name="lastName"
                      type="text"
                      className={`form-control ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">Email</label>
                    <Field
                      name="email"
                      type="email"
                      className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage name="email" component="div" className="invalid-feedback" />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label">
                      Password {isEditMode && '(optional)'}
                    </label>
                    <Field
                      name="password"
                      type="password"
                      className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <Field
                    name="role"
                    as="select"
                    className={`form-select ${errors.role && touched.role ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select a role</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                    {/* outros se necessário */}
                  </Field>
                  <ErrorMessage name="role" component="div" className="invalid-feedback" />
                </div>
              </div>

              <div className="tab-pane fade" id="regions">
                <div className="row">
                  <div className="col-md-5">
                    <label className="form-label">Available Regions</label>
                    <select
                      multiple
                      className="form-select"
                      size={10}
                      value={selectedAvailableCodes}
                      onChange={(e) =>
                        setSelectedAvailableCodes(Array.from(e.target.selectedOptions, (opt) => opt.value))
                      }
                    >
                      {availableRegions.map((region) => (
                        <option key={region.regionCode} value={region.regionCode}>
                          {region.regionName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2 d-flex flex-column justify-content-center align-items-center">
                    <button
                      type="button"
                      className="btn btn-primary mb-2"
                      onClick={assignSelected}
                      disabled={selectedAvailableCodes.length === 0}
                    >
                      &gt;&gt;
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={unassignSelected}
                      disabled={selectedAssignedCodes.length === 0}
                    >
                      &lt;&lt;
                    </button>
                  </div>


                  <div className="col-md-5">
                    <label className="form-label">Assigned Regions</label>
                    <select
                      multiple
                      className="form-select"
                      size={10}
                      value={selectedAssignedCodes}
                      onChange={(e) =>
                        setSelectedAssignedCodes(Array.from(e.target.selectedOptions, (opt) => opt.value))
                      }
                    >
                      {assignedRegions.map((region) => (
                        <option key={region.regionCode} value={region.regionCode}>
                          {region.regionName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-success mt-3" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UserFormPage;
