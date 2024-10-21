import React from 'react';

const SteamLogin = ({ onSteamIdReceived }) => {
  const handleSteamLogin = () => {
    window.location.href = '/.netlify/functions/steam-login';
  };

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamId = urlParams.get('steamId');
    const error = urlParams.get('error');
    
    if (steamId) {
      localStorage.setItem('steamId', steamId);
      onSteamIdReceived(steamId);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('Authentication failed:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  }, [onSteamIdReceived]);

  return (
    <button onClick={handleSteamLogin} className="btn btn-primary">
      Sign in with Steam
    </button>
  );
};

export default SteamLogin;
