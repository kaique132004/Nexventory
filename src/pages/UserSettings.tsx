import React, { useEffect, useState } from 'react';
import { API, useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

// Colunas disponíveis por seção
const AVAILABLE_COLUMNS = {
  dashboard: ['name', 'status', 'lastUpdate'],
  users: ['username', 'email', 'role', 'status'],
  permissions: ['permissionName', 'description'],
  regions: ['regionCode', 'regionName', 'cityName'],
  suppliers: ['supplierCode', 'supplierName', 'contact'],
  transactions: ['transactionId', 'amount', 'status', 'date'],
};

// Valores padrões
const DEFAULT_SITE_SETTINGS = {
  theme: 'light',
  language: 'en',
  dashboardColumns: 'all',
  usersColumns: 'all',
  permissionsColumns: 'all',
  regionsColumns: 'all',
  suppliersColumns: 'all',
  transactionsColumns: 'all',
};

type SiteSettings = typeof DEFAULT_SITE_SETTINGS;
type CustomColumns = Record<string, string[]>;

const UserSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [customColumns, setCustomColumns] = useState<CustomColumns>({});
  const [loading, setLoading] = useState(true);

  // Carrega dados do usuário
  useEffect(() => {
    if (!user) return;

    API.get(`/auth/users/${user.id}`)
      .then(res => {
        const loadedSettings = res.data.siteSettings || {};

        // Atualiza configurações gerais
        setSiteSettings(prev => ({
          ...prev,
          ...loadedSettings
        }));

        // Tenta fazer o parse de customColumns (salvo como string)
        try {
          const parsed = JSON.parse(loadedSettings.customColumns || '{}');
          setCustomColumns(parsed);
        } catch {
          setCustomColumns({});
        }
      })
      .catch(() => toast.error('Falha ao carregar configurações do usuário'))
      .finally(() => setLoading(false));
  }, [user]);

  // Atualiza campos gerais (tema, idioma, etc)
  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSiteSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualiza colunas customizadas
  const handleCheckboxChange = (section: string, column: string, checked: boolean) => {
    setCustomColumns(prev => {
      const current = prev[section] || [];
      const updated = checked
        ? [...current, column]
        : current.filter(col => col !== column);

      return {
        ...prev,
        [section]: updated,
      };
    });
  };

  // Salva configurações no backend
  const handleSave = async () => {
    if (!user) return;

    try {
      await API.put(`/auth/update/${user.id}`, {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        siteSettings: {
          ...siteSettings,
          customColumns: JSON.stringify(customColumns), // 👈 Importante: serializar
        },
        accountNonExpired: true,
        accountNonLocked: true,
        credentialsNonExpired: true,
        enabled: true,
        isNotTemporary: true,
        regionCodes: [],
        permissions: [],
      });

      toast.success('Configurações salvas com sucesso');
    } catch {
      toast.error('Erro ao salvar configurações');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Carregando configurações...</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Configurações do Usuário</h2>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#general" type="button">Geral</button>
        </li>
        <li className="nav-item">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#columns" type="button">Colunas Visíveis</button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Aba Geral */}
        <div className="tab-pane fade show active" id="general">
          <div className="mb-3">
            <label className="form-label">Tema</label>
            <select
              className="form-select"
              value={siteSettings.theme}
              onChange={e => handleChange('theme', e.target.value)}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Idioma</label>
            <select
              className="form-select"
              value={siteSettings.language}
              onChange={e => handleChange('language', e.target.value)}
            >
              <option value="en">Inglês</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>

        {/* Aba de Colunas */}
        <div className="tab-pane fade" id="columns">
          {Object.keys(AVAILABLE_COLUMNS).map(section => (
            <div className="mb-4" key={section}>
              <label className="form-label">{section.charAt(0).toUpperCase() + section.slice(1)} Columns</label>

              <select
                className="form-select mb-2"
                value={siteSettings[`${section}Columns` as keyof SiteSettings]}
                onChange={e => handleChange(`${section}Columns` as keyof SiteSettings, e.target.value)}
              >
                <option value="all">Mostrar todas</option>
                <option value="minimal">Mínimas</option>
                <option value="custom">Personalizado</option>
              </select>

              {siteSettings[`${section}Columns` as keyof SiteSettings] === 'custom' && (
                <div className="ms-3">
                  {AVAILABLE_COLUMNS[section as keyof typeof AVAILABLE_COLUMNS].map(col => (
                    <div className="form-check" key={col}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`${section}-${col}`}
                        checked={customColumns[section]?.includes(col) || false}
                        onChange={(e) => handleCheckboxChange(section, col, e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={`${section}-${col}`}>{col}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
        <button className="btn btn-primary" onClick={handleSave}>Salvar Configurações</button>
      </div>
    </div>
  );
};

export default UserSettings;
