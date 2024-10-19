import { useEffect, useState } from "react";
import { delayedFetch } from "../utils/rateLimitingAPI";


export const useProfileData = (apiKey, steamId, isAuthenticated) => {

    const [profileData, setProfileData] = useState({});

    useEffect(() => {
        if (isAuthenticated && apiKey && steamId) {
            const fetchProfileData = async () => {
                try {
                    const res = await delayedFetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`);
                    const data = await res.json();
                    setProfileData(data.response.players[0]);
                    console.log("Profile data:", data.response.players[0]);
                    console.log("profile display name:", data.response.players[0].personaname);
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                }
            };
            fetchProfileData();
        }
    }, [isAuthenticated, apiKey, steamId]);

    return {
        profileData,
        isAuthenticated,
        apiKey,
        steamId
    };
}