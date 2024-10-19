import React, { useEffect } from 'react';

const SteamLogin = ({ onSteamIdReceived }) => {
  const handleSteamLogin = () => {
    const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
    const baseUrl = import.meta.env.BASE_URL || '/'; // Use Vite's base URL if available
    const returnUrl = `${window.location.origin}${baseUrl}auth/steam/return`;
    
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl,
      'openid.realm': window.location.origin,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    window.location.href = `${steamOpenIdUrl}?${params.toString()}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamIdParam = urlParams.get('openid.claimed_id');
    
    if (steamIdParam) {
      const steamId = steamIdParam.split('/').pop();
      localStorage.setItem('steamId', steamId);
      onSteamIdReceived(steamId);
      // Redirect back to the auth page
      const baseUrl = import.meta.env.BASE_URL || '/';
      window.location.href = baseUrl;
    }
  }, [onSteamIdReceived]);

  return (
    <button onClick={handleSteamLogin} className="btn btn-primary">
      Sign in with Steam
    </button>
  );
};

export default SteamLogin;
