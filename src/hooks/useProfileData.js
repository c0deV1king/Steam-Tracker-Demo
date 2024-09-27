import { useEffect, useState } from "react";
export const useProfileData = (API_KEY) => {

    const [profileData, setProfileData] = useState({});

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=76561198119786249`);
                const data = await res.json();
                setProfileData(data.response.players[0]);
                console.log("Profile data:", data.response.players[0]);
                console.log("profile display name:", data.response.players[0].personaname);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        fetchProfileData();
    }, []);

    return {
        profileData
    };
}