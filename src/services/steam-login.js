import querystring from "querystring";

exports.handler = async (event, context) => {
  const steamOpenIdUrl = "https://steamcommunity.com/openid/login";
  const isLocalDev =
    event.headers.host.includes("localhost") ||
    event.headers.host.includes("127.0.0.1");
  const baseUrl = isLocalDev
    ? `http://${event.headers.host}`
    : "https://steam-tracker.codeviking.io";
  const returnUrl = `${baseUrl}/src/services/steam-callback`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl,
    "openid.realm": baseUrl,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return {
    statusCode: 302,
    headers: {
      Location: `${steamOpenIdUrl}?${params.toString()}`,
    },
  };
};
