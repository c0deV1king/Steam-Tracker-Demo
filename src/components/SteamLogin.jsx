import React, { useEffect } from "react";

const SteamLogin = ({ onSteamIdReceived }) => {
  const handleSteamLogin = () => {
    window.location.href = "./src/services/steam-login.js";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const steamId = urlParams.get("steamId");
    const error = urlParams.get("error");

    if (steamId) {
      localStorage.setItem("steamId", steamId);
      onSteamIdReceived(steamId);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error("Authentication failed:", error);
      // Handle the error (e.g., show an error message to the user)
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
