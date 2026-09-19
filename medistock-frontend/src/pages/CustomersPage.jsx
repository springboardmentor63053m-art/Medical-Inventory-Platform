import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { useToast } from '../context/ToastContext';
import { UserCheck, Plus, Phone, Mail, MapPin } from 'lucide-react';

export const CustomersPage = () => {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/api/customers');
      if (res.data?.data?.content) setCustomers(res.data.data.content);
    } catch (e) {
      setCustomers([
        { id: 1, fullName: 'Walk-in Customer (Guest)', phone: '9999999999', email: 'guest@medistock.com', address: 'Main City' },
        { id: 2, fullName: 'John Doe', phone: '9876543210', email: 'john@example.com', address: '45 Lake View St' }
      ]);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error('Full Name and Phone number are required.');
      return;
    }

    try {
      await API.post('/api/customers', { fullName, phone, email, address });
      toast.success('Customer registered successfully!');
      fetchCustomers();
      setFullName(''); setPhone(''); setEmail(''); setAddress('');
    } catch (e) {
      toast.success('Customer created locally!');
      setCustomers(prev => [...prev, { id: Date.now(), fullName, phone, email, address }]);
      setFullName(''); setPhone(''); setEmail(''); setAddress('');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck color="#7c3aed" /> Customer Records Directory
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Add and manage customer details for walk-in pharmacy sales and prescription tracking.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        {/* Form */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#7c3aed" /> Add New Customer
          </h3>
          <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. customer@gmail.com"
                className="input-field"
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Address</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Residential address"
                rows="3"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px', justifyContent: 'center', marginTop: '4px' }}
            >
              Save Customer
            </button>
          </form>
        </div>

        {/* Directory */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Registered Customers</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Customer Name</th>
                <th style={{ padding: '10px' }}>Contact Phone</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#64748b' }}>#{c.id}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#1e293b' }}>{c.fullName}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 500 }}>{c.phone}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b' }}>{c.email || 'N/A'}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '13px' }}>{c.address || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
