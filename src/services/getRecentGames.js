import fetch from "node-fetch";

export async function handler(event, context) {
  // Function logic here
  const steamApiKey = process.env.STEAM_API_KEY;
  const steamid = event.queryStringParameters.steamid;
  const backendUrl = process.env.VITE_API_URL;

  const token = event.headers.Authorization || event.headers.authorization;

  try {
    const response = await fetch(
      `${backendUrl}/api/recentgames/update/${steamid}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Failed to fetch recent games for steamid: ${steamId}`,
      }),
    };
  }
}
