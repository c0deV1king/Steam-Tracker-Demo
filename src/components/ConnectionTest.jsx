import React, { useState } from 'react';

const apiURL = import.meta.env.VITE_API_URL;

function ConnectionTest() {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');

    try {
      const response = await fetch(`${apiURL}/api/test-connection`);
      console.log("Getting request from backend");
      const data = await response.json();
      console.log("Data" + data);

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Connection failed` })
      }
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
};

export default ConnectionTest;