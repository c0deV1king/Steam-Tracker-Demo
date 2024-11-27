import React, { useEffect } from 'react';

interface SteamLoginProps {
  onSteamIdReceived: (steamId: string) => void;
}

const SteamLogin: React.FC<SteamLoginProps> = ({ onSteamIdReceived }) => {
  const handleSteamLogin = (): void => {
    window.location.href = '/.netlify/functions/steam-login';
  };

  useEffect(() => {
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
    <img 
      onClick={handleSteamLogin} 
      src="https://community.fastly.steamstatic.com/public/images/signinthroughsteam/sits_01.png" 
      alt="Sign in with Steam" 
      className='cursor-pointer' 
    />
  );
};

export default SteamLogin;