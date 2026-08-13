import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Truck, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  RotateCcw, 
  Search, 
  Eye, 
  Pill, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SupplierProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/supplier/profile');
      if (res.data.success) {
        setProfile(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch supplier profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading profile data');
    }
  };

  const fetchSupplierMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching supplier medicines', err);
    }
  };

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProfile(), fetchSupplierMedicines()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const guessDosage = (name) => {
    if (!name) return 'Tablet';
    const lower = name.toLowerCase();
    if (lower.includes('suspension')) return 'Suspension';
    if (lower.includes('syrup')) return 'Syrup';
    if (lower.includes('capsule')) return 'Capsule';
    if (lower.includes('injection')) return 'Injection';
    if (lower.includes('patch')) return 'Patch';
    return 'Tablet';
  };

  if (loading) {
    return (
      <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Filter profile by search query
  const matchesSearch = 
    profile && (
      profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `SUP-${100 + profile.id}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const supplierCode = profile ? `SUP-${100 + profile.id}` : 'SUP-101';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <Truck size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            My Supplier Profile
          </h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            View and manage your supplier account details and supplied formulations.
          </p>
        </div>
        <button 
          className="btn-icon" 
          onClick={initData} 
          title="Refresh Profile"
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="search-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: '280px' }}>
          <Search />
          <input
            type="text"
            placeholder="Search suppliers by code, name, or contact person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{matchesSearch ? 1 : 0}</strong> vendor profile
        </div>
      </div>

      {/* Supplier Profile Card List */}
      {matchesSearch && profile ? (
        <div className="card" style={{ maxWidth: '480px', padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="badge badge-info" style={{ fontWeight: 600, fontSize: '0.8rem', padding: '4px 10px' }}>
              {supplierCode}
            </span>
            <button 
              className="btn-icon" 
              onClick={() => setDetailsModalOpen(true)}
              title="View Profile Details"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Eye size={16} />
            </button>
          </div>

          <h3 style={{ margin: '16px 0 16px 0', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            {profile.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserIcon size={14} style={{ color: 'var(--primary)' }} />
              <span>{profile.contactPerson || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} style={{ color: 'var(--primary)' }} />
              <span>{profile.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} style={{ color: 'var(--primary)' }} />
              <span style={{ wordBreak: 'break-all' }}>{profile.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              <span>{profile.address || 'N/A'}</span>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <Pill size={14} />
              {medicines.length} Medicines Supplied
            </span>
            <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
              ● ACTIVE SUPPLY CHAIN
            </span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No vendor profiles found matching your query.
        </div>
      )}

      {/* Supplier Profile Detailed Modal */}
      {detailsModalOpen && profile && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div className="card-header-flex" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                    {profile.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Supplier Code: {supplierCode} • Verified Supply Partner
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setDetailsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* BLOCK 1: Company details */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit, sans-serif' }}>
                  <Truck size={14} /> 1. Supplier Company & Contact Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>SUPPLIER CODE</div>
                    <strong style={{ color: 'white' }}>{supplierCode}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>COMPANY NAME</div>
                    <strong style={{ color: 'white' }}>{profile.name}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>CONTACT PERSON</div>
                    <strong style={{ color: 'white' }}>{profile.contactPerson || 'N/A'}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>PHONE NUMBER</div>
                    <strong style={{ color: 'white' }}>{profile.phone || 'N/A'}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>OFFICIAL EMAIL</div>
                    <strong style={{ color: 'white', wordBreak: 'break-all' }}>{profile.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>LOCATION</div>
                    <strong style={{ color: 'white' }}>{profile.address || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: Linked User Account */}
              <div style={{ background: 'rgba(147, 51, 234, 0.02)', border: '1px solid rgba(147, 51, 234, 0.15)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit, sans-serif' }}>
                  <UserCheck size={14} /> 2. Linked Supplier User Account
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>EMPLOYEE ID</div>
                    <strong style={{ color: '#c084fc' }}>{user?.username || 'SUP001'}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>LOGIN ACCOUNT EMAIL</div>
                    <strong style={{ color: 'white', wordBreak: 'break-all' }}>{user?.email || profile.email}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>ASSIGNED ROLE</div>
                    <span className="badge" style={{ background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', border: '1px solid rgba(147, 51, 234, 0.3)', fontWeight: 600, fontSize: '0.75rem', padding: '3px 8px' }}>
                      SUPPLIER
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOCK 3: Medicines Supplied */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif' }}>
                  <Pill size={14} style={{ color: 'var(--primary)' }} /> 
                  <span>3. Medicines Supplied By This Supplier</span>
                  <span className="badge badge-info" style={{ marginLeft: '6px', fontSize: '0.7rem', padding: '2px 8px' }}>
                    {medicines.length} LINKED
                  </span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '6px' }}>
                  {medicines.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No formulations linked to this profile.
                    </div>
                  ) : (
                    medicines.map(med => (
                      <div 
                        key={med.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'rgba(59, 130, 246, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)'
                        }}>
                          <Pill size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ display: 'block', fontSize: '0.88rem', color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {med.name}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            Code: {med.code} • Generic: {med.genericName || 'N/A'} • Mfg: {med.manufacturer || 'N/A'} • Dosage: {guessDosage(med.name)} • <strong style={{ color: 'var(--success)' }}>₹{(med.price || 0).toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setDetailsModalOpen(false)}>
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierProfile;
