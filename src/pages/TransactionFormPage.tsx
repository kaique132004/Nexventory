import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { API, API_SUPPLY_API, useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const TransactionFormPage: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  type Region = {
    regionCode: string;
    regionName?: string;
    [key: string]: any;
  };
  type Supply = {
    id?: string;
    supplyName?: string;
    isActive?: boolean | string;
    regionalPrices?: any[];
    [key: string]: any;
  };

  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  // Parse query parameters for pre-selected supply
  const queryParams = new URLSearchParams(location.search);
  const preSelectedSupplyId = queryParams.get('supply');
  const preSelectedSupplyName = queryParams.get('name');

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  // Validation schema
  const transactionSchema = Yup.object().shape({
    supplyId: Yup.string()
      .required('Supply is required'),
    regionCode: Yup.string()
      .required('Region is required'),
    typeEntry: Yup.string()
      .required('Transaction type is required')
      .oneOf(['IN', 'OUT'], 'Invalid transaction type'),
    quantity: Yup.number()
      .required('Quantity is required')
      .positive('Quantity must be greater than 0')
      .integer('Quantity must be a whole number'),
    created: Yup.date()
      .required('Date is required')
      .max(today, 'Cannot select a future date')
  });

  // Load supplies and regions on component mount
  useEffect(() => {
    loadSupplies();
    loadRegions();
  }, []);

  useEffect(() => {
    if (selectedSupply && Array.isArray(selectedSupply.regionalPrices) && regions.length > 0) {
      updateAvailableRegions(selectedSupply);
    }
  }, [selectedSupply, regions]);


  // Load supply details when a supply is selected
  useEffect(() => {
    if (preSelectedSupplyId) {
      loadSupplyDetails(preSelectedSupplyId);
    }
  }, [preSelectedSupplyId]);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const response = await API_SUPPLY_API.get('supply/list');

      if (response.data && Array.isArray(response.data)) {
        // Filter to only include active supplies
        const activeSupplies = response.data.filter((supply: { isActive: string | boolean; }) =>
          supply.isActive === true || supply.isActive === 'true'
        );

        setSupplies(activeSupplies);
      }
    } catch (error) {
      console.error('Error loading supplies:', error);
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          errorMessage = (error.response as any).data.message;
        } else if ('message' in error) {
          errorMessage = (error as any).message;
        }
      }
      toast.error('Error loading supplies: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      setLoading(true);
      const response = await API.get('region');

      if (Array.isArray(response.data)) {
        // Filter to only include active regions

        // Get user's regions
        const userRegions: string[] = [];
        if (user && user.regionCode && Array.isArray(user.regionCode)) {
          user.regionCode.forEach(region => {
            if (typeof region === 'object' && region.regionCode) {
              userRegions.push(region.regionCode);
            } else if (typeof region === 'string') {
              userRegions.push(region);
            }
          });
        }

        // Filter regions to only include those assigned to the user
        const filteredRegions = userRegions.length > 0
          ? response.data.filter((region: Region) => userRegions.includes(region.regionCode))
          : response.data;

        setRegions(filteredRegions);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          errorMessage = (error.response as any).data.message;
        } else if ('message' in error) {
          errorMessage = (error as any).message;
        }
      }
      toast.error('Error loading regions: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplyDetails = async (supplyId: string) => {
    try {
      setLoading(true);
      const response = await API_SUPPLY_API.get(`supply/list/${supplyId}`);

      if (response.data) {
        const supplyData = response.data;
        setSelectedSupply(supplyData);

        // Filter available regions for this supply
        updateAvailableRegions(supplyData);
      }
    } catch (error) {
      console.error('Error loading supply details:', error);
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          errorMessage = (error.response as any).data.message;
        } else if ('message' in error) {
          errorMessage = (error as any).message;
        }
      }
      toast.error('Error loading supply details: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailableRegions = (supply: { regionalPrices?: any[]; }) => {
    if (!supply.regionalPrices || !Array.isArray(supply.regionalPrices)) {
      setAvailableRegions([]);
      return;
    }

    // Get user's regions
    const userRegions: string[] = [];
    if (user && user.regionCode && Array.isArray(user.regionCode)) {
      user.regionCode.forEach(region => {
        if (typeof region === 'object' && region.regionCode) {
          userRegions.push(region.regionCode);
        } else if (typeof region === 'string') {
          userRegions.push(region);
        }
      });
    }

    // Get supply's regions
    const supplyRegionCodes = supply.regionalPrices.map(rp => rp.regionCode);

    // Find overlapping regions (user's regions that are also defined for this supply)
    const overlappingRegionCodes = userRegions.length > 0
      ? supplyRegionCodes.filter(code => userRegions.includes(code))
      : supplyRegionCodes;

    // Map to full region objects
    const availableRegionsList = regions.filter(region =>
      overlappingRegionCodes.includes(region.regionCode)
    );

    setAvailableRegions(availableRegionsList);
  };

  const handleSupplyChange = async (e: { target: { value: any; }; }, setFieldValue: {
    (field: string, value: any, shouldValidate?: boolean): Promise<void | FormikErrors<{
      supplyId: string; regionCode: string; typeEntry: string; // Default to OUT
      quantity: number; created: string; // Default to today
    }>>; (arg0: string, arg1: string): void;
  }) => {
    const supplyId = e.target.value;
    setFieldValue('supplyId', supplyId);
    setFieldValue('regionCode', ''); // Reset region when supply changes

    if (supplyId) {
      await loadSupplyDetails(supplyId);
    } else {
      setSelectedSupply(null);
      setAvailableRegions([]);
    }
  };

  const getRegionalPrice = (regionCode: string) => {
    if (!selectedSupply || !selectedSupply.regionalPrices || !Array.isArray(selectedSupply.regionalPrices)) {
      return null;
    }

    return selectedSupply.regionalPrices.find(rp => rp.regionCode === regionCode);
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setLoading(true);

      // Quebra a string YYYY-MM-DD em partes
      const [year, month, day] = values.created.split('-').map(Number);

      // Cria a data no horário local (sem confundir com UTC)
      const createdDate = new Date(year, month - 1, day);

      // Data de hoje no horário local
      const today = new Date();

      // Verifica se a data do form é igual ao dia atual (ano, mês, dia)
      const isSameDate =
        createdDate.getFullYear() === today.getFullYear() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getDate() === today.getDate();

      let formattedCreatedDate: string;

      if (!isSameDate) {
        // Data manual - fixa o horário para 00:00:00 (string ISO local sem fuso)
        formattedCreatedDate = `${values.created}T00:00:00`;
      } else {
        // Data automática - hora atual menos 3h (UTC-3)
        const now = new Date();
        now.setHours(now.getHours() - 3);
        formattedCreatedDate = now.toISOString().slice(0, 19);
      }

      const regionalPrice = getRegionalPrice(values.regionCode);
      const priceUnit = regionalPrice?.price || 0;
      const quantity = parseInt(values.quantity, 10);
      const totalPrice = priceUnit * quantity;

      const transactionData = {
        supplyId: parseInt(values.supplyId, 10),
        quantityAmended: quantity,
        created: formattedCreatedDate,
        regionCode: values.regionCode,
        priceUnit,
        totalPrice,
        typeEntry: values.typeEntry,
      };

      await API_SUPPLY_API.post('supply/consumptions', transactionData);

      toast.success('Transaction created successfully');
      navigate('/transactions');
    } catch (error) {
      console.error('Error creating transaction:', error);
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object') {
        if (
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
        ) {
          errorMessage = (error.response as any).data.message;
        } else if ('message' in error) {
          errorMessage = (error as any).message;
        }
      }
      toast.error('Error creating transaction: ' + errorMessage);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };



  // Initial form values
  const initialValues = {
    supplyId: preSelectedSupplyId || '',
    regionCode: '',
    typeEntry: 'OUT', // Default to OUT
    quantity: 1,
    created: today // Default to today
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">New Transaction</h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/transactions')}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Transactions
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Transaction Details</h6>
            </div>
            <div className="card-body">
              <Formik
                initialValues={initialValues}
                validationSchema={transactionSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="supplyId" className="form-label">Supply</label>
                      <Field
                        as="select"
                        id="supplyId"
                        name="supplyId"
                        className={`form-select ${errors.supplyId && touched.supplyId ? 'is-invalid' : ''}`}
                        onChange={(e: { target: { value: any; }; }) => handleSupplyChange(e, setFieldValue)}
                        disabled={!!preSelectedSupplyId}
                      >
                        <option value="">Select a supply</option>
                        {supplies.map(supply => (
                          <option
                            key={supply.id || supply.supplyId}
                            value={supply.id || supply.supplyId}
                          >
                            {supply.supplyName}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="supplyId" component="div" className="invalid-feedback" />
                      {preSelectedSupplyName && (
                        <div className="form-text">
                          Pre-selected supply: {preSelectedSupplyName}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="regionCode" className="form-label">Region</label>
                      <Field
                        as="select"
                        id="regionCode"
                        name="regionCode"
                        className={`form-select ${errors.regionCode && touched.regionCode ? 'is-invalid' : ''}`}
                        disabled={!values.supplyId || availableRegions.length === 0}
                      >
                        <option value="">Select a region</option>
                        {availableRegions.map(region => {
                          const regionalPrice = getRegionalPrice(region.regionCode);
                          const priceText = regionalPrice ?
                            ` (Price: ${regionalPrice.price} ${regionalPrice.currency || 'USD'}, Stock: ${regionalPrice.quantity || 0})` :
                            '';

                          return (
                            <option
                              key={region.regionCode}
                              value={region.regionCode}
                            >
                              {region.regionCode} - {region.regionName}{priceText}
                            </option>
                          );
                        })}
                      </Field>
                      <ErrorMessage name="regionCode" component="div" className="invalid-feedback" />
                      {values.supplyId && availableRegions.length === 0 && (
                        <div className="form-text text-danger">
                          No regions available for this supply. Please select a different supply.
                        </div>
                      )}
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="typeEntry" className="form-label">Transaction Type</label>
                        <Field
                          as="select"
                          id="typeEntry"
                          name="typeEntry"
                          className={`form-select ${errors.typeEntry && touched.typeEntry ? 'is-invalid' : ''}`}
                        >
                          <option value="IN">IN (Add to stock)</option>
                          <option value="OUT">OUT (Remove from stock)</option>
                        </Field>
                        <ErrorMessage name="typeEntry" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="quantity" className="form-label">Quantity</label>
                        <Field
                          type="number"
                          id="quantity"
                          name="quantity"
                          className={`form-control ${errors.quantity && touched.quantity ? 'is-invalid' : ''}`}
                          min="1"
                          step="1"
                        />
                        <ErrorMessage name="quantity" component="div" className="invalid-feedback" />

                        {/* Stock warning for OUT transactions */}
                        {values.typeEntry === 'OUT' && values.regionCode && (
                          (() => {
                            const regionalPrice = getRegionalPrice(values.regionCode);
                            const currentStock = regionalPrice ? parseInt(regionalPrice.quantity) || 0 : 0;
                            const requestedQuantity = parseInt(values.quantity.toString()) || 0;

                            if (currentStock < requestedQuantity) {
                              return (
                                <div className="form-text text-danger">
                                  Warning: Requested quantity exceeds current stock ({currentStock}).
                                </div>
                              );
                            } else if (currentStock <= 5) {
                              return (
                                <div className="form-text text-warning">
                                  Low stock warning: Only {currentStock} items remaining.
                                </div>
                              );
                            }

                            return null;
                          })()
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="created" className="form-label">Transaction Date</label>
                      <Field
                        type="date"
                        id="created"
                        name="created"
                        className={`form-control ${errors.created && touched.created ? 'is-invalid' : ''}`}
                        max={today}
                      />
                      <ErrorMessage name="created" component="div" className="invalid-feedback" />
                      <div className="form-text">
                        Transaction date cannot be in the future. Time will be set to current time.
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting || loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Transaction...
                        </>
                      ) : (
                        'Create Transaction'
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

export default TransactionFormPage;


