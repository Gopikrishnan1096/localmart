import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const SubscriptionPage = () => {
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, plansRes] = await Promise.all([
        api.get('/subscriptions/status').catch(() => ({ data: { data: null } })),
        api.get('/subscriptions/plans')
      ]);
      
      setStatus(statusRes.data.data);
      setPlans(plansRes.data.data);
    } catch (error) {
      toast.error('Failed to load subscription data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      toast.loading('Redirecting to secure checkout...');
      const res = await api.post(
        '/subscriptions/create-checkout-session',
        { planId }
      );
      
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to start checkout. Check Stripe API keys.');
    }
  };

  if (loading) return <div className="spinner" />;

  const isUnlimited = status?.productLimit === -1;
  const progressPercentage = isUnlimited ? 0 : Math.min((status?.productsUsed / status?.productLimit) * 100, 100);

  return (
    <div className="card">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Shop Subscription</h1>
      
      <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Current Plan: <span style={{ color: '#059669' }}>{status?.plan}</span></h2>
        
        <div style={{ marginBottom: '10px' }}>
          <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
            <span>Products Used</span>
            <span>{status?.productsUsed} / {isUnlimited ? 'Unlimited' : status?.productLimit}</span>
          </p>
          <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: progressPercentage > 90 ? '#ef4444' : '#10b981',
                width: `${progressPercentage}%` 
              }} 
            />
          </div>
        </div>
        
        {status?.status === 'active' && status?.plan !== 'Free' && (
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>Your premium subscription is active.</p>
        )}
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Upgrade Plan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {plans?.map(plan => (
          <div key={plan._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', textAlign: 'center', background: status?.plan === plan.name ? '#f0fdf4' : '#fff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{plan.name}</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '15px' }}>
              ₹{plan.price} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>/ {plan.billingCycle}</span>
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', textAlign: 'left', fontSize: '14px', color: '#4b5563' }}>
              {plan.features && plan.features.length > 0 ? (
                plan.features.map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>✓ {feature}</li>
                ))
              ) : (
                <>
                  <li style={{ marginBottom: '8px' }}>✓ {plan.productLimit === -1 ? 'Unlimited' : plan.productLimit} Products max</li>
                  <li style={{ marginBottom: '8px' }}>✓ Basic shop dashboard</li>
                  <li style={{ marginBottom: '8px' }}>✓ Order management</li>
                </>
              )}
            </ul>
            
            {status?.plan === plan.name ? (
              <button disabled style={{ width: '100%', padding: '10px', background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                Current Plan
              </button>
            ) : plan.price > 0 && (
              <button 
                onClick={() => handleSubscribe(plan._id)}
                style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Upgrade to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
