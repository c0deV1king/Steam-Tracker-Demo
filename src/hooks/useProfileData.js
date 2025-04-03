import { useState, useEffect } from "react";
import { delayedFetch } from "../utils/rateLimitingAPI";

export const useProfileData = (steamId, isAuthenticated, isDemo) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      console.log("Fetching authenticated profile data");
      try {
        const response = await fetch(`http://localhost:3000/api/profiles/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Profile data response:", data);

        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(error.message);
      }

      setLoading(false);
    };

    if (isAuthenticated && steamId) {
      fetchProfileData();
    } else {
      setProfileData(null);
    }
  }, [isAuthenticated, steamId]);

  return {
    profileData,
    loading,
    error,
    isAuthenticated,
    steamId,
  };
};
