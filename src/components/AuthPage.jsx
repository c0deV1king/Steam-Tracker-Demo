import React, { useState, useEffect } from 'react';
import SteamLogin from './SteamLogin';

const AuthPage = ({ onLogin }) => {
  const [steamId, setSteamId] = useState('');
  const [apiKey, setApiKey] = useState('');

  // NETLIFY SERVERLESS FUNCTION TESTING
  const [mockUser, setMockUser] = useState(null);

  useEffect(() => {
    // Load saved credentials from localStorage on component mount
    const savedSteamId = localStorage.getItem('steamId');
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedSteamId) setSteamId(savedSteamId);
    if (savedApiKey) setApiKey(savedApiKey);

    // NETLIFY SERVERLESS FUNCTION TESTING
    fetchMockUser();
  }, []);

  // NETLIFY SERVERLESS FUNCTION TESTING
  const fetchMockUser = async () => {
    try {
      const response = await fetch('/.netlify/functions/hello');
      if (!response.ok) {
        throw new Error('Failed to fetch mock user data');
      }
      const data = await response.json();
      setMockUser(data);
    } catch (error) {
      console.error('Error fetching mock user:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically validate the credentials
    localStorage.setItem('steamId', steamId);
    localStorage.setItem('apiKey', apiKey);
    onLogin();
    window.location.reload();
  };

  const handleSteamIdReceived = (receivedSteamId) => {
    setSteamId(receivedSteamId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-center">SteamTracker</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="steamId" className="block mb-2">Steam ID</label>
            <input
              type="text"
              id="steamId"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="apiKey" className="block mb-2">API Key</label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full btn btn-primary mb-4">
            Authenticate
          </button>
        </form>
        <div className="text-center">
          <p className="mb-2">Or</p>
          <SteamLogin onSteamIdReceived={handleSteamIdReceived} />
        </div>
      </div>
    </div>
  );
};

export { AuthPage };
