import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API, API_SUPPLY_API, useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import { Modal } from 'react-bootstrap';
// Definindo interfaces para tipagem
interface Region {
  regionCode: string;
  regionName: string;
}

interface Supply {
  id: string;
  supplyName: string;
  description?: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  userName: string;
  supplyName: string;
  regionCode: string;
  typeEntry: 'IN' | 'OUT';
  quantityAmended: number;
  quantityBefore: number;
  quantityAfter: number;
  priceUnit: number;
  created: string;
}

interface Filter {
  startDate: string | null;
  endDate: string | null;
  regionCodes: string[] | null; // <- agora é um array
  nameSupply: string[] | null;
  typeEntry: string | null;
}


const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const { user } = useAuth();

  const visibleColumns = user?.siteSettings?.transactionsColumns === 'custom'
    ? user.siteSettings.customColumns?.transactions || []
    : user?.siteSettings?.transactionsColumns === 'all';

  const isVisible = (column: string) => {
    if (!visibleColumns) return true; // Se não houver colunas personalizadas, todas são visíveis
    return visibleColumns.includes(column);
  }

  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  // Default filter values - last 30 days
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 24);

  const defaultFilter: Filter = {
    startDate: lastMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    regionCodes: [],
    nameSupply: [],
    typeEntry: '',
  };

  const handleEdit = (transactionId: string) => {
    const selected = transactions.find(t => t.id === transactionId);
    if (selected) {
      setEditTransaction(selected);
      handleShow();
    }
  }

  const updateTransaction = async (id: string, values: { quantityAmended: number; }) => {
    try {
      const response = await API_SUPPLY_API.put(`supply/consumptions/${id}/edit`, values);
      toast.success('Transação atualizada com sucesso');
      setShow(false);
      console.log('Valores enviados para atualização:', values);
      applyFilter(filter);
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error.response?.data || error.message);
      toast.error('Falha ao atualizar transação: ' + (error.response?.data?.message || error.message));
    }
  };


  const [filter, setFilter] = useState<Filter>(defaultFilter);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadRegions(), loadSupplies()]);
        await applyFilter(defaultFilter);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setError('Erro ao carregar dados iniciais');
      }
    };

    requestAnimationFrame(() => {
      loadData();
    });
  }, []);

  const loadRegions = async () => {
    try {
      const response = await API.get<Region[]>('region');

      if (Array.isArray(response.data)) {
        const allRegions = response.data;

        if (user && user.regionCode && Array.isArray(user.regionCode)) {
          const userRegionCodes = user.regionCode.map(r =>
            typeof r === 'object' ? r.regionCode : r
          );

          const filteredRegions = allRegions.filter(region =>
            userRegionCodes.includes(region.regionCode)
          );

          setRegions(filteredRegions);
        } else {
          setRegions(allRegions);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar regiões:', error);
      toast.error('Erro ao carregar regiões: ' + (error.message));
    }
  };


  const loadSupplies = async () => {
    try {
      const response = await API_SUPPLY_API.get<{ data: Supply[] }>('supply/list');

      if (response.data && Array.isArray(response.data)) {
        // Filter to only include active supplies
        const activeSupplies = response.data.filter(supply =>
          supply.isActive === true
        );

        setSupplies(activeSupplies);
      }
    } catch (error: any) {
      console.error('Erro ao carregar suprimentos:', error);
      toast.error('Erro ao carregar suprimentos: ' + (error.message));
    }
  };

  const applyFilter = async (filterValues: Filter) => {
    console.log('Filtro enviado para o backend:', filterValues);
    try {
      setLoading(true);
      setFilter(filterValues);

      const apiFilter: Record<string, any> = { ...filterValues };

      Object.keys(apiFilter).forEach(key => {
        if (
          apiFilter[key] === "" ||
          (Array.isArray(apiFilter[key]) && apiFilter[key].length === 0)
        ) {
          delete apiFilter[key];
        }
      });


      console.log('Filtro processado para API:', apiFilter);

      const response = await API_SUPPLY_API.post('supply/finder', apiFilter);

      console.log('Resposta do backend:', response.data);

      let transactionData: Transaction[] = [];

      if (Array.isArray(response.data)) {
        transactionData = response.data;
      } else if (response.data && Array.isArray((response.data as any).data)) {
        transactionData = (response.data as any).data;
      } else if (response.data && Array.isArray((response.data as any).transactions)) {
        transactionData = (response.data as any).transactions;
      }

      setTransactions(transactionData);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao carregar transações:', error);
      const errorMessage = error.message;
      setError('Falha ao carregar transações. ' + errorMessage);
      toast.error('Falha ao carregar transações: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);

      // Prepara o filtro (removendo campos vazios)
      const apiFilter: Record<string, any> = { ...filter };

      Object.keys(apiFilter).forEach(key => {
        if (
          apiFilter[key] === '' ||
          (Array.isArray(apiFilter[key]) && apiFilter[key].length === 0)
        ) {
          delete apiFilter[key];
        }
      });


      const response = await API_SUPPLY_API.post('supply/consumptions/export?format=csv', apiFilter, {
        responseType: 'blob', // importante para receber binário
      });

      // Cria o blob e faz o download automático
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'transacoes.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url); // limpa o objeto na memória

      toast.success('Transações exportadas com sucesso');
    } catch (error: any) {
      console.error('Erro ao exportar transações:', error);
      toast.error('Falha ao exportar transações: ' + ('Erro desconhecido'));
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get supply name by ID
  const getSupplyName = (supplyId: string) => {
    const supply = supplies.find(s => s.id === supplyId);
    return supply ? supply.supplyName : supplyId;
  };

  // Calculate total value
  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">Transações</h1>
        <Link to="/transactions/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i> Nova Transação
        </Link>
      </div>

      {/* Filter Section */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Filtros</h6>
          <button
            className="btn btn-sm btn-outline-primary"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#filterCollapse"
            aria-expanded="true"
            aria-controls="filterCollapse"
            aria-label="Alternar visibilidade dos filtros"
          >
            <i className="bi bi-funnel me-1"></i> Alternar Filtros
          </button>
        </div>
        <div className="collapse show" id="filterCollapse">
          <div className="card-body">
            <Formik
              initialValues={filter}
              onSubmit={applyFilter}
            >
              {({ values, handleSubmit, resetForm, setFieldValue }) => (
                <Form>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label htmlFor="startDate" className="form-label">Data Inicial *</label>
                      <Field
                        type="date"
                        id="startDate"
                        name="startDate"
                        className="form-control"
                        max={values.endDate || today.toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="endDate" className="form-label">Data Final *</label>
                      <Field
                        type="date"
                        id="endDate"
                        name="endDate"
                        className="form-control"
                        min={values.startDate}
                        max={today.toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="regionCode" className="form-label">Região</label>
                      <Field
                        as="select"
                        id="regionCodes"
                        name="regionCodes"
                        className="form-select"
                        multiple

                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                          setFieldValue("regionCodes", selectedOptions);
                        }}

                      >
                        {regions.map(region => (
                          <option key={region.regionCode} value={region.regionCode}>
                            {region.regionCode} - {region.regionName}
                          </option>
                        ))}

                      </Field>
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="nameSupply" className="form-label">Suprimento</label>
                      <Field
                        as="select"
                        id="nameSupply"
                        name="nameSupply"
                        className="form-select"
                        multiple
                      >
                        {supplies.map(supply => (
                          <option key={supply.supplyName} value={supply.supplyName}>
                            {supply.supplyName}
                          </option>
                        ))}
                      </Field>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <button type="submit" className="btn btn-primary me-2">
                        <i className="bi bi-search me-1"></i> Aplicar Filtros
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          resetForm({ values: defaultFilter });
                          applyFilter(defaultFilter);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-1"></i> Redefinir
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={exportToCSV}
                      disabled={exportLoading || transactions.length === 0}
                      aria-label="Exportar para CSV"
                    >
                      {exportLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Exportando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-file-earmark-excel me-1"></i> Exportar CSV
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            Transações {transactions.length > 0 ? `(${transactions.length})` : ''}
          </h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-2">Carregando transações...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt fs-1 text-muted"></i>
              <p className="mt-3">Nenhuma transação encontrada</p>
              <button
                className="btn btn-outline-primary mt-2"
                onClick={() => applyFilter(defaultFilter)}
              >
                Recarregar dados
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    {isVisible("date") && <th>Data</th>}
                    {isVisible("userName") && <th>Usuário</th>}
                    {isVisible("regionCode") && <th>Região</th>}
                    {isVisible("supplyName") && <th>Suprimento</th>}
                    {isVisible("typeEntry") && <th>Tipo</th>}
                    {isVisible("quantityAmended") && <th>Quantidade</th>}
                    {isVisible("priceUnit") && <th>Valor Unitário</th>}
                    {isVisible("total") && <th>Total</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Carregando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        {isVisible("date") && <td>{formatDate(transaction.created)}</td>}
                        {isVisible("userName") && <td>{transaction.userName || '-'}</td>}
                        {isVisible("regionCode") && <td>{transaction.regionCode}</td>}
                        {isVisible("supplyName") && <td>{transaction.supplyName || '-'}</td>}
                        {isVisible("typeEntry") && (
                          <td>
                            <span className={`badge ${transaction.typeEntry === 'IN' ? 'bg-success' : 'bg-danger'}`}>
                              {transaction.typeEntry === 'IN' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                        )}
                        {isVisible("quantityAmended") && <td>{transaction.quantityAmended}</td>}
                        {isVisible("priceUnit") && <td>R$ {transaction.priceUnit.toFixed(2)}</td>}
                        {isVisible("total") && (
                          <td>R$ {calculateTotal(transaction.priceUnit, transaction.quantityAmended).toFixed(2)}</td>
                        )}
                        <td>
                          <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(transaction.id)}>
                            <i className='bi bi-pencil'></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger me-2">
                            <i className='bi bi-trash'></i>
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

      <Modal
        show={show}
        onHide={handleClose}
        backdrop={true}
        keyboard={true}
        centered
      >
        <Formik
          initialValues={{
            userName: editTransaction?.userName || '',
            supplyName: editTransaction?.supplyName || '',
            supplyId: supplies.find(s => s.supplyName === editTransaction?.supplyName)?.id || '',
            regionCode: editTransaction?.regionCode || '',
            typeEntry: editTransaction?.typeEntry || '',
            quantityAmended: editTransaction?.quantityAmended || 0,
            priceUnit: editTransaction?.priceUnit || 0,
          }}

          onSubmit={(values) => {
            if (!editTransaction?.id) {
              toast.error('Transação não encontrada para edição');
              return;
            }

            const supplyId = supplies.find(s => s.supplyName === editTransaction.supplyName)?.id;
            if (!supplyId) {
              toast.error('Suprimento inválido');
              return;
            }

            const fixedValues = {
              supplyId,
              regionCode: editTransaction.regionCode,
              quantityAmended: values.quantityAmended,
              priceUnit: values.priceUnit,
              typeEntry: values.typeEntry || editTransaction.typeEntry || 'IN', // garantir não null
            };

            updateTransaction(editTransaction.id, fixedValues);
          }}



        >
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>Editar Transação</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <div className="mb-3">
                  <label htmlFor="userName" className="form-label">Usuário</label>
                  <Field disabled type="text" id="userName" name="userName" className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="supplyName" className="form-label">Suprimento</label>
                  <Field disabled type="text" id="supplyName" name="supplyName" className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="regionCode" className="form-label">Região</label>
                  <Field disabled type="text" id="regionCode" name="regionCode" className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="typeEntry" className="form-label">Tipo de Entrada/Saída</label>
                  <Field disabled as="select" id="typeEntry" name="typeEntry" className="form-select">
                    <option value="IN">Entrada</option>
                    <option value="OUT">Saída</option>
                  </Field>
                </div>
                <div className="mb-3">
                  <label htmlFor="quantityAmended" className="form-label">Quantidade</label>
                  <Field type="number" id="quantityAmended" name="quantityAmended" className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="priceUnit" className="form-label">Valor Unitário</label>
                  <Field type="number" id="priceUnit" name="priceUnit" className="form-control" />
                </div>
              </Modal.Body>

              <Modal.Footer>
                <button
                  type="button"           // <-- MUITO IMPORTANTE: evitar submit ao clicar neste botão
                  className="btn btn-outline-secondary"
                  onClick={() => setShow(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-1"></i> Salvar alterações
                </button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

    </div>

  );
};

export default TransactionsPage;