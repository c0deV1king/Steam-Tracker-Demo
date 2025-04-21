import React, { useEffect } from "react";

const SteamLogin = ({ onSteamIdReceived }) => {
  const handleSteamLogin = () => {
    const baseUrl = window.location.origin;
    const backendUrl = import.meta.env.VITE_API_URL;
    const returnUrl = `${backendUrl}/api/validate-steam/`;

    const steamOpenIdUrl = "https://steamcommunity.com/openid/login";
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnUrl,
      "openid.realm": backendUrl,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });

    // Redirect the user to the Steam login page
    window.location.href = `${steamOpenIdUrl}?${params.toString()}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamId = urlParams.get("steamId");
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    if (steamId && token) {
      localStorage.setItem("steamId", steamId);
      localStorage.setItem("token", token);
      onSteamIdReceived(steamId);

      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error("Authentication failed:", error);
      alert("Authentication failed. Please try again.");
    }
  }, [onSteamIdReceived]);

  return (
    <img
      onClick={handleSteamLogin}
      src="https://community.fastly.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
      alt="Sign in with Steam"
      className="cursor-pointer"
    />
  );
};

export default SteamLogin;
