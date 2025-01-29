import React, { useState } from 'react';

const apiURL = import.meta.env.VITE_API_URL;

function ConnectionTest() {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');

    try {
      console.log("API URL:", apiURL);
      console.log("Full Request URL:", `${apiURL}/api/test-connection`);
      const response = await fetch(`${apiURL}/api/test-connection`);
      console.log("Getting request from backend");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received:" + data);

      setStatus(`Success: ${data.message}`);

    } catch (error) {
      console.error("Error:", error);
      setStatus('Failed to connect to API');
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
        {loading ? "Testing..." : "Test Connection"}
      </button>
      <p>Status: {status}</p>
    </div>
  );
};

export default ConnectionTest;