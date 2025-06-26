import React from 'react';
import { useState, useEffect } from 'react';
import { API, API_SUPPLY_API } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegions: 0,
    totalSupplies: 0,
    totalTransactions: 0,
    totalPricesUsed: 0,
    totalSuppliesUsed: 0
  });

  type Transaction = {
    supplyName?: string;
    regionCode?: string;
    created?: string;
    quantityAmended?: number;
    typeEntry?: string;
    priceUnit?: number;
    totalPrice?: number;
    userName?: string;
  };

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users count
        const usersResponse = await API.get('/auth/users');
        const totalUsers = usersResponse.data.length || 0;

        // Fetch regions count
        const regionsResponse = await API.get('/region');
        const totalRegions = regionsResponse.data.length || 0;

        // Fetch supplies count
        const suppliesResponse = await API_SUPPLY_API.get('/supply/list');
        const totalSupplies = suppliesResponse.data?.length || 0;

        // Fetch transactions with filter for the past month
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);

        const filter = {
          startDate: lastMonth.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };

        const transactionsResponse = await API_SUPPLY_API.post('/supply/finder', filter);

        // Extract transactions array from response
        let transactions = [];
        if (Array.isArray(transactionsResponse.data)) {
          transactions = transactionsResponse.data;
        } else if (Array.isArray(transactionsResponse.data?.transactions)) {
          transactions = transactionsResponse.data.transactions;
        } else if (Array.isArray(transactionsResponse.data)) {
          transactions = transactionsResponse.data;
        }

        // Calculate total prices and quantities for "OUT" transactions
        const totalOutQuantity = transactions
          .filter((tx: any) => tx.typeEntry === 'OUT')
          .reduce((sum: number, tx: any) => sum + (tx.quantityAmended || 0), 0);

        const totalOutValue = transactions
          .filter((tx: any) => tx.typeEntry === 'OUT')
          .reduce((sum: number, tx: any) => {
            const price = tx.priceUnit || 0;
            const quantity = tx.quantityAmended || 0;
            return sum + price * quantity;
          }, 0);

        // Update stats
        setStats({
          totalUsers,
          totalRegions,
          totalSupplies,
          totalTransactions: transactions.length,
          totalPricesUsed: totalOutValue,
          totalSuppliesUsed: totalOutQuantity
        });

        // Get the 10 most recent transactions
        const recentTxs = [...transactions]
          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
          .slice(0, 10);

        setRecentTransactions(recentTxs);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Format date
  const formatDate = (dateString: string | number | Date | undefined) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Stats cards */}
      <div className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalUsers}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-people fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Regions
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalRegions}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-geo-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Supplies
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalSupplies}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-box-seam fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Transactions
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalTransactions}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-arrow-left-right fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional stats row */}
      <div className="row">
        <div className="col-xl-6 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Value Used
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ?
                      <span className="spinner-border spinner-border-sm" /> :
                      formatCurrency(stats.totalPricesUsed)
                    }
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-currency-dollar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Supplies Used
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {loading ? <span className="spinner-border spinner-border-sm" /> : stats.totalSuppliesUsed}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-boxes fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
          <h6 className="m-0 font-weight-bold text-primary">Recent Transactions</h6>
          <a href="/transactions" className="btn btn-sm btn-primary">
            View All
          </a>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered" id="recent-transactions-table" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Supply</th>
                    <th>Region</th>
                    <th>Date</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">No transactions found</td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.supplyName || '-'}</td>
                        <td>{transaction.regionCode || '-'}</td>
                        <td>{String(formatDate(transaction.created) || '-')}</td>
                        <td>
                          <span className={`${transaction.typeEntry === 'IN' ? 'text-success' : 'text-danger'}`}>
                            {transaction.typeEntry === 'IN' ? '+' : '-'}
                            {transaction.quantityAmended || 0}
                          </span>
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

export default DashboardPage;

