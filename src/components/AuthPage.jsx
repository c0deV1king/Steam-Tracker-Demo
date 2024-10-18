import React, { useState, useEffect } from 'react';

const AuthPage = ({ onLogin }) => {
  const [steamId, setSteamId] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load saved credentials from localStorage on component mount
    const savedSteamId = localStorage.getItem('steamId');
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedSteamId) setSteamId(savedSteamId);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically validate the credentials
    localStorage.setItem('steamId', steamId);
    localStorage.setItem('apiKey', apiKey);
    onLogin();
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
          <button type="submit" className="w-full btn btn-primary">
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export { AuthPage };
