import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { API } from '../auth/AuthContext';
import { toast } from 'react-toastify';

type Region = {
  id?: number;
  regionCode: string;
  regionName: string;
  cityName: string;
  countryName: string;
  stateName: string;
  addressCode: string;
  responsibleName: string;
  containsAgentsLocal: boolean;

};

const RegionFormPage: React.FC = () => {
  const { regionCode } = useParams<{ regionCode: string }>();

  const navigate = useNavigate();
  const isEditMode = !!regionCode;
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(isEditMode);

  const [dataLoaded, setDataLoaded] = useState(!isEditMode);

  // Validation schema
  const regionSchema = Yup.object().shape({
    regionCode: Yup.string()
      .required('Region code is required')
      .max(3, 'Region code must be 3 characters or less')
      .matches(/^[A-Za-z0-9]+$/, 'Region code must contain only letters and numbers'),
    regionName: Yup.string()
      .required('Region name is required')
      .max(100, 'Region name must be 100 characters or less'),
    cityName: Yup.string()
      .required('City is required')
      .max(100, 'City must be 100 characters or less'),
    countryName: Yup.string()
      .required('Country is required')
      .max(100, 'Country must be 100 characters or less'),
    stateName: Yup.string().max(100, 'State must be 100 characters or less'),
    addressCode: Yup.string().max(50, 'Address Code must be 50 characters or less'),
    responsibleName: Yup.string().max(100, 'Responsible Name must be 100 characters or less'),
    containsAgentsLocal: Yup.boolean()
  });

  // Load region data in edit mode
  useEffect(() => {
    let isMounted = true;

    if (regionCode) {
      fetchRegion(isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [regionCode]);


  const fetchRegion = async (isMounted: boolean) => {
    try {
      setLoading(true);
      const response = await API.get(`/region/${regionCode}`);

      if (response.data && isMounted) {
        setRegion(response.data);
        setDataLoaded(true);
      } else if (isMounted) {
        toast.error('Region not found');
        navigate('/regions');
      }
    } catch (error) {
      console.error('Error loading region:', error);
      const message =
        (error as any)?.response?.data?.message ??
        (error as any)?.message ??
        'Unknown error';
      if (isMounted) {
        toast.error('Error loading region: ' + message);
        navigate('/regions');
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };


  const handleSubmit = async (
    values: Region,
    { setSubmitting }: any
  ) => {
    let isMounted = true;

    try {
      const regionData = {
        regionCode: values.regionCode.toUpperCase(),
        regionName: values.regionName.toUpperCase(),
        cityName: values.cityName.toUpperCase(),
        countryName: values.countryName.toUpperCase(),
        stateName: values.stateName.toUpperCase(),
        addressCode: values.addressCode.toUpperCase(),
        responsibleName: values.responsibleName.toUpperCase(),
        containsAgentsLocal: values.containsAgentsLocal,
      };

      if (isEditMode) {
        await API.put(`region/${regionCode}`, regionData);
        if (isMounted) toast.success('Region updated successfully');
      } else {
        await API.post('region', regionData);
        if (isMounted) toast.success('Region created successfully');
      }

      if (isMounted) navigate('/regions');
    } catch (error) {
      console.error('Error saving region:', error);
      const message =
        (error as any)?.response?.data?.message ??
        (error as any)?.message ??
        'Unknown error';
      if (isMounted) toast.error('Error saving region: ' + message);
    } finally {
      if (isMounted) setSubmitting(false);
    }
  };


  // Initial form values
  const initialValues = dataLoaded && isEditMode && region
    ? {
      regionCode: region.regionCode || '',
      regionName: region.regionName || '',
      cityName: region.cityName || '',
      countryName: region.countryName || '',
      stateName: region.stateName || '',
      addressCode: region.addressCode || '',
      responsibleName: region.responsibleName || '',
      containsAgentsLocal: region.containsAgentsLocal === undefined ? true : region.containsAgentsLocal,
    }
    : {
      regionCode: '',
      regionName: '',
      cityName: '',
      countryName: '',
      stateName: '',
      addressCode: '',
      responsibleName: '',
      containsAgentsLocal: true,
    };


  if (isEditMode && loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading region data...</p>
      </div>
    );
  }

  if (isEditMode && !dataLoaded) {
    return null; // ou um loading mais simples, para evitar renderizar formulário com dados faltando
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          {isEditMode ? 'Edit Region' : 'Create Region'}
        </h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/regions')}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Regions
        </button>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Region Information</h6>
            </div>
            <div className="card-body">
              <Formik

                key={isEditMode ? regionCode : 'new'}
                initialValues={initialValues}
                validationSchema={regionSchema}
                onSubmit={(values, actions) => {
                  console.log('Formik SUBMIT chamado com:', values);
                  handleSubmit(values, actions);
                }}
                validateOnMount={true}
                enableReinitialize={true}

              >

                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="regionCode" className="form-label">Region Code</label>
                        <Field
                          type="text"
                          id="regionCode"
                          name="regionCode"
                          className={`form-control ${errors.regionCode && touched.regionCode ? 'is-invalid' : ''}`}
                          disabled={isEditMode} // Region code cannot be changed in edit mode
                          placeholder="e.g. GRU"
                        />
                        <small className="form-text text-muted">3-letter code, like GRU for Guarulhos</small>
                        <ErrorMessage name="regionCode" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="regionName" className="form-label">Region Name</label>
                        <Field
                          type="text"
                          id="regionName"
                          name="regionName"
                          className={`form-control ${errors.regionName && touched.regionName ? 'is-invalid' : ''}`}
                          placeholder="e.g. Guarulhos Airport"
                        />
                        <ErrorMessage name="regionName" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="cityName" className="form-label">City</label>
                        <Field
                          type="text"
                          id="cityName"
                          name="cityName"
                          className={`form-control ${errors.cityName && touched.cityName ? 'is-invalid' : ''}`}
                          placeholder="e.g. Guarulhos"
                        />
                        <ErrorMessage name="cityName" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="countryName" className="form-label">Country</label>
                        <Field
                          type="text"
                          id="countryName"
                          name="countryName"
                          className={`form-control ${errors.countryName && touched.countryName ? 'is-invalid' : ''}`}
                          placeholder="e.g. Brazil"
                        />
                        <ErrorMessage name="countryName" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="stateName" className="form-label">State</label>
                        <Field
                          type="text"
                          id="stateName"
                          name="stateName"
                          className={`form-control ${errors.stateName && touched.stateName ? 'is-invalid' : ''}`}
                          placeholder="e.g. São Paulo"
                        />
                        <ErrorMessage name="stateName" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="addressCode" className="form-label">Address Code</label>
                        <Field
                          type="text"
                          id="addressCode"
                          name="addressCode"
                          className={`form-control ${errors.addressCode && touched.addressCode ? 'is-invalid' : ''}`}
                          placeholder="e.g. ADD123"
                        />
                        <ErrorMessage name="addressCode" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="responsibleName" className="form-label">Responsible Name</label>
                      <Field
                        type="text"
                        id="responsibleName"
                        name="responsibleName"
                        className={`form-control ${errors.responsibleName && touched.responsibleName ? 'is-invalid' : ''}`}
                        placeholder="e.g. John Doe"
                      />
                      <ErrorMessage name="responsibleName" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3 form-check form-switch">
                      <Field name="containsAgentsLocal">
                        {({ field }: any) => (
                          <div className="form-check form-switch">
                            <input
                              type="checkbox"
                              id="containsAgentsLocal"
                              value='containsAgentsLocal'
                              className="form-check-input"
                              checked={field.value}
                              onChange={() => {
                                field.onChange({
                                  target: {
                                    name: field.name,
                                    value: !field.value
                                  }
                                });
                              }}
                            />
                            <label className="form-check-label" htmlFor="containsAgentsLocal">
                              Contains Local Agents
                            </label>
                          </div>
                        )}
                      </Field>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Region'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionFormPage;


