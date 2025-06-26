import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const ResetPasswordPage: React.FC = () => {
  const { requestPasswordReset, resetPassword, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  // Check if we're in reset mode (with token) or request mode
  const isResetMode = !!token;

  // Redirect if already authenticated (except when in reset mode)
  useEffect(() => {
    if (isAuthenticated && !isResetMode) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, isResetMode]);

  // Validation schemas
  const requestSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  const resetSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
      .required('Confirm password is required')
  });

  // Handle request password reset
  const handleRequestReset = async (values: { email: string; }, { setSubmitting, setErrors }: any) => {
    try {
      setLoading(true);
      const result = await requestPasswordReset(values.email);
      
      if (result.success) {
        setResetRequested(true);
        toast.success('Password reset link sent to your email');
      } else {
        setErrors({ general: result.error || 'Failed to send reset email' });
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Request reset error:', error);
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (values: { password: string; }, { setSubmitting, setErrors }: any) => {
    try {
      setLoading(true);
      if (!token) {
        setErrors({ general: 'Invalid or missing reset token.' });
        toast.error('Invalid or missing reset token.');
        return;
      }
      const result = await resetPassword(token, values.password);
      
      if (result.success) {
        toast.success('Password reset successful! You can now login.');
        navigate('/login');
      } else {
        setErrors({ general: result.error || 'Failed to reset password' });
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Request password reset form
  const renderRequestForm = () => {
    if (resetRequested) {
      return (
        <div className="alert alert-success">
          <h5 className="alert-heading">Reset Email Sent!</h5>
          <p>We've sent a password reset link to your email address. Please check your inbox and follow the instructions.</p>
          <hr />
          <p className="mb-0">
            <Link to="/login" className="alert-link">Return to login</Link>
          </p>
        </div>
      );
    }

    return (
      <Formik
        initialValues={{ email: '' }}
        validationSchema={requestSchema}
        onSubmit={handleRequestReset}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            {(errors as any).general && (
              <div className="alert alert-danger">{(errors as any).general}</div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <Field
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email address"
              />
              <ErrorMessage name="email" component="div" className="invalid-feedback" />
            </div>

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none">
                Back to login
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  // Reset password form (with token)
  const renderResetForm = () => {
    return (
      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={resetSchema}
        onSubmit={handleResetPassword}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            {(errors as any).general && (
              <div className="alert alert-danger">{(errors as any).general}</div>
            )}

            <div className="mb-3">
              <label htmlFor="password" className="form-label">New Password</label>
              <Field
                type="password"
                id="password"
                name="password"
                className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                placeholder="Enter new password"
              />
              <ErrorMessage name="password" component="div" className="invalid-feedback" />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <Field
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm new password"
              />
              <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
            </div>

            <div className="d-grid mb-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none">
                Back to login
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3 className="mb-1">Stock Management</h3>
                <p className="mb-0 text-muted">
                  {isResetMode ? 'Create a new password' : 'Reset your password'}
                </p>
              </div>
              
              {isResetMode ? renderResetForm() : renderRequestForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;


