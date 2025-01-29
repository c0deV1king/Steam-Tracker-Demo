import React, { useState } from 'react';

function ConnectionTest() {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    try {
      // Make sure to replace this URL with your actual backend URL
      const response = await fetch('https://your-backend-url.railway.app/api/test-connection');
      const data = await response.json();
      
      if (data.status === 'success') {
        setStatus('✅ Everything is connected and working!');
      } else {
        setStatus('❌ Something went wrong: ' + data.message);
      }
    } catch (error) {
      setStatus('❌ Connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={testConnection}
        disabled={loading}
      >
        Test Connection
      </button>
      <p>Status: {status}</p>
    </div>
  );
}

export default ConnectionTest;