import { useState, useEffect } from "react";
import { delayedFetch } from "../utils/rateLimitingAPI";


export const useProfileData = (apiKey, steamId, isAuthenticated) => {

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && apiKey && steamId) {
            const fetchProfileData = async () => {
                if (!apiKey || !steamId) {
                    setLoading(false);
                    return;
                }

                try {
                    const response = await fetch(`/.netlify/functions/getPlayerSummary/?key=${apiKey}&steamids=${steamId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('Profile data response:', data);

                    if (!data.response || !data.response.players) {
                        throw new Error('Unexpected response structure');
                    }

                    setProfileData(data.response.players[0]);
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfileData();
        }
    }, [isAuthenticated, apiKey, steamId]);

    return {
        profileData,
        loading,
        error,
        isAuthenticated,
        apiKey,
        steamId
    };
}
