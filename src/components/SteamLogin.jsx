import React, { useEffect } from "react";

const SteamLogin = ({ onSteamIdReceived }) => {
  const handleSteamLogin = () => {
    const baseUrl = window.location.origin;
    const returnUrl = `${baseUrl}${window.location.pathname}`;

    const steamOpenIdUrl = "https://steamcommunity.com/openid/login";
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnUrl,
      "openid.realm": baseUrl,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });

    window.location.href = `${steamOpenIdUrl}?${params.toString()}`;
  };

  useEffect(() => {
    const validateSteamResponse = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const openidParams = Object.fromEntries(urlParams.entries());

      if (openidParams["openid.mode"] === "id_res") {
        // Validate the Steam response
        const validationResponse = await fetch(
          "https://steamcommunity.com/openid/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              ...openidParams,
              "openid.mode": "check_authentication",
            }),
          }
        );

        const validationText = await validationResponse.text();

        if (validationText.includes("is_valid:true")) {
          const steamId = openidParams["openid.claimed_id"].split("/").pop();
          localStorage.setItem("steamId", steamId);
          onSteamIdReceived(steamId);

          // Clear the URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else {
          console.error("Steam authentication failed.");
          alert("Steam authentication failed. Please try again.");
        }
      } else if (urlParams.get("error")) {
        console.error("Authentication failed:", urlParams.get("error"));
        alert("Authentication failed. Please try again.");
      }
    };

    validateSteamResponse();
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
