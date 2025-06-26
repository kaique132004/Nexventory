import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { API } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const SupplyFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  interface SupplyData {
    supplyName?: string;
    supplyDescription?: string;
    active?: boolean | string;
    regionalPrices?: any[];
    [key: string]: any;
  }
  const [supply, setSupply] = useState<SupplyData | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  type Region = { regionCode: string; regionName: string; active: boolean };
  const [regions, setRegions] = useState<Region[]>([]);
  
  // Validation schema
  const supplySchema = Yup.object().shape({
    supplyName: Yup.string()
      .required('Supply name is required')
      .max(100, 'Supply name must be 100 characters or less'),
    supplyDescription: Yup.string()
      .max(500, 'Description must be 500 characters or less'),
    active: Yup.boolean(),
    regionalPrices: Yup.array().of(
      Yup.object().shape({
        regionCode: Yup.string()
          .required('Region is required'),
        price: Yup.number()
          .required('Price is required')
          .min(0, 'Price must be greater than or equal to 0'),
        currency: Yup.string()
          .required('Currency is required'),
        supplier: Yup.string(),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(0, 'Quantity must be greater than or equal to 0')
          .integer('Quantity must be a whole number')
      })
    ).min(1, 'At least one regional price is required')
  });

  // Load supply data in edit mode and regions
  useEffect(() => {
    fetchRegions();
    
    if (isEditMode) {
      fetchSupply();
    }
  }, [id]);

  const fetchSupply = async () => {
    try {
      setLoading(true);
      const response = await API.get(`supply/list/${id}`);
      
      if (response.data && response.data.data) {
        const supplyData = response.data.data;
        
        // Ensure that regionalPrices are properly formatted
        if (supplyData.regionalPrices && Array.isArray(supplyData.regionalPrices)) {
          supplyData.regionalPrices = supplyData.regionalPrices.map((rp: { price: string; quantity: string; }) => ({
            ...rp,
            // Ensure numeric values are numbers, not strings
            price: parseFloat(rp.price),
            quantity: parseInt(rp.quantity) || 0
          }));
        } else {
          supplyData.regionalPrices = [];
        }
        
        setSupply(supplyData);
      } else {
        toast.error('Failed to load supply data');
        navigate('/supplies');
      }
    } catch (error) {
      console.error('Error loading supply:', error);
      const errMsg =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as any).response?.data?.message || (error as any).message)
          : (error as any)?.message || String(error);
      toast.error('Error loading supply: ' + errMsg);
      navigate('/supplies');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await API.get('region/list');
      
      if (Array.isArray(response.data)) {
        // Filter to only include active regions
        const activeRegions = response.data.filter(region => region.active);
        setRegions(activeRegions);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      const errMsg =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as any).response?.data?.message || (error as any).message)
          : (error as any)?.message || String(error);
      toast.error('Error loading regions: ' + errMsg);
    }
  };

  interface SupplyFormValues {
    supplyName?: string;
    supplyDescription?: string;
    active: boolean;
    regionalPrices: any[];
    id?: string;
    supplyId?: string;
    supplyImages?: any[];
  }

  const handleSubmit = async (values: SupplyFormValues, { setSubmitting }: any) => {
    try {
      // Convert values to match API expectations
      const supplyData: SupplyFormValues = {
        ...values,
        // Convert boolean to string for the API
        active: values.active.toString() as unknown as boolean,
        // Ensure regionalPrices have string values for price and quantity
        regionalPrices: values.regionalPrices.map(rp => ({
          ...rp,
          price: rp.price.toString(),
          quantity: rp.quantity.toString()
        }))
      };
      
      if (isEditMode) {
        // Add the ID for update
        supplyData.id = id;
      } else {
        // Add empty supplyId for create
        supplyData.supplyId = "";
      }
      
      // Add empty supplyImages array
      supplyData.supplyImages = [];
      
      let response;
      
      if (isEditMode) {
        // Update existing supply
        response = await API.put(`supply/update/${id}`, supplyData);
        toast.success('Supply updated successfully');
      } else {
        // Create new supply
        response = await API.post('supply/add', supplyData);
        toast.success('Supply created successfully');
      }
      
      navigate('/supplies');
    } catch (error) {
      console.error('Error saving supply:', error);
      const errMsg =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as any).response?.data?.message || (error as any).message)
          : (error as any)?.message || String(error);
      toast.error('Error saving supply: ' + errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Initial form values
  const initialValues = isEditMode && supply
    ? {
        supplyName: supply.supplyName || '',
        supplyDescription: supply.supplyDescription || '',
        active: supply.active === undefined ? true : (supply.active === 'true' || supply.active === true),
        regionalPrices: supply.regionalPrices && supply.regionalPrices.length > 0
          ? supply.regionalPrices
          : [{ regionCode: '', price: '', currency: 'USD', supplier: '', quantity: 0 }]
      }
    : {
        supplyName: '',
        supplyDescription: '',
        active: true,
        regionalPrices: [{ regionCode: '', price: '', currency: 'USD', supplier: '', quantity: 0 }]
      };

  if (isEditMode && loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading supply data...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          {isEditMode ? 'Edit Supply' : 'Create Supply'}
        </h1>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/supplies')}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Supplies
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Supply Information</h6>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={supplySchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="supplyName" className="form-label">Supply Name</label>
                    <Field
                      type="text"
                      id="supplyName"
                      name="supplyName"
                      className={`form-control ${errors.supplyName && touched.supplyName ? 'is-invalid' : ''}`}
                      placeholder="Enter supply name"
                    />
                    <ErrorMessage name="supplyName" component="div" className="invalid-feedback" />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch mt-4">
                      <Field
                        type="checkbox"
                        id="active"
                        name="active"
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="active">Active</label>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="supplyDescription" className="form-label">Description</label>
                  <Field
                    as="textarea"
                    id="supplyDescription"
                    name="supplyDescription"
                    className={`form-control ${errors.supplyDescription && touched.supplyDescription ? 'is-invalid' : ''}`}
                    placeholder="Enter supply description"
                    rows="3"
                  />
                  <ErrorMessage name="supplyDescription" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Regional Prices</label>
                  {errors.regionalPrices && typeof errors.regionalPrices === 'string' && (
                    <div className="alert alert-danger">{errors.regionalPrices}</div>
                  )}
                  
                  <FieldArray name="regionalPrices">
                    {({ push, remove }) => (
                      <div>
                        {values.regionalPrices.map((_, index) => (
                          <div key={index} className="card mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="card-title mb-0">Region #{index + 1}</h6>
                                {values.regionalPrices.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => remove(index)}
                                  >
                                    <i className="bi bi-trash"></i> Remove
                                  </button>
                                )}
                              </div>
                              
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <label htmlFor={`regionalPrices.${index}.regionCode`} className="form-label">Region</label>
                                  <Field
                                    as="select"
                                    id={`regionalPrices.${index}.regionCode`}
                                    name={`regionalPrices.${index}.regionCode`}
                                    className={`form-select ${
                                      errors.regionalPrices && 
                                      errors.regionalPrices[index] && 
                                      typeof errors.regionalPrices[index] === 'object' &&
                                      (errors.regionalPrices[index] as any).regionCode && 
                                      Array.isArray(touched.regionalPrices) && 
                                      touched.regionalPrices[index] && 
                                      touched.regionalPrices[index].regionCode 
                                        ? 'is-invalid' 
                                        : ''
                                    }`}
                                  >
                                    <option value="">Select a region</option>
                                    {regions.map(region => (
                                      <option 
                                        key={region.regionCode} 
                                        value={region.regionCode}
                                        disabled={values.regionalPrices.some(
                                          (rp, i) => i !== index && rp.regionCode === region.regionCode
                                        )}
                                      >
                                        {region.regionCode} - {region.regionName}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage name={`regionalPrices.${index}.regionCode`} component="div" className="invalid-feedback" />
                                </div>
                                <div className="col-md-6">
                                  <label htmlFor={`regionalPrices.${index}.supplier`} className="form-label">Supplier</label>
                                  <Field
                                    type="text"
                                    id={`regionalPrices.${index}.supplier`}
                                    name={`regionalPrices.${index}.supplier`}
                                    className="form-control"
                                    placeholder="Enter supplier name"
                                  />
                                </div>
                              </div>
                              
                              <div className="row mb-3">
                                <div className="col-md-4">
                                  <label htmlFor={`regionalPrices.${index}.price`} className="form-label">Price</label>
                                  <Field
                                    type="number"
                                    id={`regionalPrices.${index}.price`}
                                    name={`regionalPrices.${index}.price`}
                                    className={`form-control ${
                                      errors.regionalPrices && 
                                      errors.regionalPrices[index] && 
                                      typeof errors.regionalPrices[index] === 'object' &&
                                      (errors.regionalPrices[index] as any).price && 
                                      Array.isArray(touched.regionalPrices) && 
                                      touched.regionalPrices[index] && 
                                      touched.regionalPrices[index].price 
                                        ? 'is-invalid' 
                                        : ''
                                    }`}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                  />
                                  <ErrorMessage name={`regionalPrices.${index}.price`} component="div" className="invalid-feedback" />
                                </div>
                                <div className="col-md-4">
                                  <label htmlFor={`regionalPrices.${index}.currency`} className="form-label">Currency</label>
                                  <Field
                                    as="select"
                                    id={`regionalPrices.${index}.currency`}
                                    name={`regionalPrices.${index}.currency`}
                                    className="form-select"
                                  >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="BRL">BRL</option>
                                  </Field>
                                </div>
                                <div className="col-md-4">
                                  <label htmlFor={`regionalPrices.${index}.quantity`} className="form-label">Stock Quantity</label>
                                  <Field
                                    type="number"
                                    id={`regionalPrices.${index}.quantity`}
                                    name={`regionalPrices.${index}.quantity`}
                                    className={`form-control ${
                                      errors.regionalPrices && 
                                      errors.regionalPrices[index] && 
                                      typeof errors.regionalPrices[index] === 'object' &&
                                      (errors.regionalPrices[index] as any).quantity && 
                                      Array.isArray(touched.regionalPrices) && 
                                      touched.regionalPrices[index] && 
                                      touched.regionalPrices[index].quantity 
                                        ? 'is-invalid' 
                                        : ''
                                    }`}
                                    placeholder="0"
                                    step="1"
                                    min="0"
                                  />
                                  <ErrorMessage name={`regionalPrices.${index}.quantity`} component="div" className="invalid-feedback" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => push({ regionCode: '', price: '', currency: 'USD', supplier: '', quantity: 0 })}
                        >
                          <i className="bi bi-plus-circle me-1"></i> Add Regional Price
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                <div className="mt-4">
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
                      'Save Supply'
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

export default SupplyFormPage;


