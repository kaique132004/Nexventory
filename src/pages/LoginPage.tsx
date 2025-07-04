import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);


  interface LoginFormValues {
    username: string;
    password: string;
    general?: string;
  }

  const loginSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  interface LoginResult {
    encryptedToken?: string;
    username?: string;
    role?: string;
    error?: string; // opcional para fallback
  }

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setErrors }: import('formik').FormikHelpers<LoginFormValues>
  ) => {
    let isMounted = true;

    try {
      setLoading(true);

      const result: LoginResult = await login(values.username, values.password);

      if (result && result.encryptedToken) {
        localStorage.setItem('token', result.encryptedToken);
        localStorage.setItem('username', result.username || '');
        localStorage.setItem('role', result.role || '');

        if (isMounted) toast.success('Login successful!');
        if (isMounted) navigate('/');
      } else {
        const errorMsg = result.error || 'Login failed: Invalid credentials or response';
        if (isMounted) {
          setErrors({ general: errorMsg });
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
          ? (error as any).message
          : 'An unexpected error occurred';

      if (isMounted) {
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setSubmitting(false);
      }
    }

    return () => {
      isMounted = false;
    };
  };


  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4">
          <Formik<LoginFormValues>
            initialValues={{ username: '', password: '', general: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                {errors.general && (
                  <div className="alert alert-danger">{errors.general}</div>
                )}

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    className={`form-control ${errors.username && touched.username ? 'is-invalid' : ''}`}
                    placeholder="Enter your username"
                  />
                  <ErrorMessage name="username" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                    placeholder="Enter your password"
                  />
                  <ErrorMessage name="password" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3 text-end">
                  <Link to="/reset-password" className="text-decoration-none">
                    Forgot password?
                  </Link>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
