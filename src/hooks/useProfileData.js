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

      const apiUrl = import.meta.env.VITE_API_URL;

      console.log("Fetching authenticated profile data");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(`${apiUrl}/api/profiles/${steamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Profile data response:", data);

        if (!data || Object.keys(data).length === 0) {
          console.log("Profile data is null/empty, creating profile data...");
          const updateProfile = await fetch(
            `${apiUrl}/api/profiles/update/${steamId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (updateProfile.ok) {
            const updatedProfile = await updateProfile.json();
            setProfileData([updatedProfile.profile]);
          } else {
            setProfileData(null);
          }
        } else {
          setProfileData(data);
        }
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
