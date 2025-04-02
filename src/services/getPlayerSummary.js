import fetch from "node-fetch";

export async function handler(event, context) {
  // Function logic here
  const steamApiKey = process.env.STEAM_API_KEY;
  const steamid = event.queryStringParameters.steamid;
  const backendUrl = process.env.VITE_API_URL;

  try {
    const response = await fetch(
      `${backendUrl}/api/profiles/update/${steamid}`
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
        error: `Failed to fetch achievements for appid: ${appid}`,
      }),
    };
  }
}
