import { useState, useEffect } from "react";
import { delayedFetch } from "../utils/rateLimitingAPI";


export const useProfileData = (steamId, isAuthenticated, isDemo) => {

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('isDemo:', isDemo);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);

            if (isDemo) {
                console.log('Fetching demo profile data');
                try {
                    const response = await fetch('/.netlify/functions/getDemoPlayerSummary');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setProfileData(data.response.players[0]);
                } catch (error) {
                    console.error('Error fetching demo profile data:', error);
                    setError(error.message);
                }
            } else if (isAuthenticated && steamId) {
                console.log('Fetching authenticated profile data');
                try {
                    const response = await fetch(`/.netlify/functions/getPlayerSummary/?steamid=${steamId}`);
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
                }
            } else {
                setProfileData(null);
            }

            setLoading(false);
        };

        fetchProfileData();
    }, [isAuthenticated, steamId, isDemo]);

    return {
        profileData,
        loading,
        error,
        isAuthenticated,
        steamId
    };
}
