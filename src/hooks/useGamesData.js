import { useState, useEffect, useCallback } from "react";
import { fetchAchievementsForGames } from "../utils/fetchAchievementsForGames";
import { delayedFetch } from "../utils/rateLimitingAPI";
import { storeData, getAllData } from "../utils/indexedDB";
import fallbackImage from "../img/capsule404.png";

export function useGamesData(steamId, isAuthenticated) {
  const [games, setGames] = useState([]);
  const [gamesToDisplay, setGamesToDisplay] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [mostRecentGame, setMostRecentGame] = useState(null);
  const [playtime, setPlaytime] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamePictures, setGamePictures] = useState({});
  const [overviewGames, setOverviewGames] = useState([]);
  const [overviewAchievements, setOverviewAchievements] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullySynced, setIsFullySynced] = useState(() => {
    const stored = localStorage.getItem("isFullySynced");
    return stored === "true";
  });
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [allGamesList, setAllGamesList] = useState([]);
  const [mostPlayedGame, setMostPlayedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update localStorage when isFullySynced changes
  useEffect(() => {
    localStorage.setItem("isFullySynced", isFullySynced.toString());
  }, [isFullySynced]);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch recent games data from backend.
  // Originally, this also grabbed screenshots and achievements for the dashboard.
  // Now, it is grabbing the recentgames data for display.
  // Later, i'll have screenshots to grab for the banner.
  useEffect(() => {
    const fetchOverviewGames = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(
          `${apiUrl}/api/recentgames/update/${steamId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched recent games data:", data);
        if (data.recentGames) {
          setOverviewGames(data.recentGames);
        } else {
          console.error("No recentGames found in response:", data);
        }
      } catch (error) {
        console.error("Error fetching recent games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && steamId) {
      fetchOverviewGames();
    }
  }, [isAuthenticated, steamId]);

  // check to see the updated recent games state
  useEffect(() => {
    if (overviewGames.length > 0) {
      console.log("Recent games state updated:", overviewGames);
    }
  }, [overviewGames]);

  // fetches all the owned games from the steam user as well as some additional data (playtime, ect)
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(`${apiUrl}/api/games/update/${steamId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched all owned games data:", data);
        if (!data.games || !Array.isArray(data.games)) {
          console.error("Unexpected response format:", data);
          throw new Error("Invalid response format: games array not found");
        }
        setAllGamesList(data.games);

        // Calculate total playtime and games played
        const totalPlaytime = Math.round(
          data.games.reduce((acc, game) => acc + game.playtime_forever, 0) / 60
        );
        setPlaytime(totalPlaytime);
        const totalGamesPlayed = data.games.filter(
          (game) => game.playtime_forever > 0
        ).length;
        setGamesPlayed(totalGamesPlayed);

        setGamesToDisplay(data.games);
      } catch (error) {
        console.error("Error fetching owned games:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated && steamId) {
      fetchGames();
    }
  }, [isAuthenticated, steamId]);

  useEffect(() => {
    if (allGamesList.length > 0) {
      console.log("All owned games state updated:", allGamesList);
    }
  }, [allGamesList]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log(
          `Fetching achievements from: ${apiUrl}/api/achievements/${steamId}`
        );

        const response = await fetch(`${apiUrl}/api/achievements/${steamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API returned status ${response.status}: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Achievements API response:", data);

        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Fetched all achievement data:", data);
          setAllAchievements(data);
          const recentAchievs = getRecentAchievements();
          setRecentAchievements(recentAchievs);
        } else {
          console.log("No achievements found in the database.");
          setAllAchievements([]);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAllAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated && steamId) {
      fetchAchievements();
    }
  }, [isAuthenticated, steamId, apiUrl]);

  // const getGamesWithDetails = async (games) => {
  //   const cachedDetails = JSON.parse(
  //     localStorage.getItem("cachedGameDetails") || "{}"
  //   );
  //   const now = new Date().getTime();

  //   const gamesNeedingDetails = games.filter(
  //     (game) =>
  //       !cachedDetails[game.appid] ||
  //       now - cachedDetails[game.appid].timestamp >= 12 * 60 * 60 * 1000
  //   );

  //   if (gamesNeedingDetails.length === 0) {
  //     return games.map((game) => ({
  //       ...game,
  //       ...(cachedDetails[game.appid] ? cachedDetails[game.appid].data : {}),
  //     }));
  //   }

  //   const newDetails = [];

  //   if (isAuthenticated && steamId) {
  //     for (const game of gamesNeedingDetails) {
  //       try {
  //         const detailsRes = await delayedFetch(
  //           `/.netlify/functions/getAppDetails/?appid=${game.appid}`
  //         );
  //         const detailsData = await detailsRes.json();

  //         if (detailsData[game.appid].success) {
  //           const gameDetails = detailsData[game.appid].data;
  //           newDetails.push({
  //             appid: game.appid,
  //             data: {
  //               name: gameDetails.name,
  //               image: gameDetails.header_image,
  //               genres: gameDetails.genres,
  //               developers: gameDetails.developers,
  //               metacritic: gameDetails.metacritic,
  //               type: gameDetails.type,
  //             },
  //             timestamp: now,
  //           });
  //         }
  //       } catch (error) {
  //         console.error(
  //           `Error fetching details for game ${game.appid}:`,
  //           error
  //         );
  //       }
  //     }
  //   }

  // Update cache and return updated games
  //   const updatedCache = { ...cachedDetails };
  //   newDetails.forEach((detail) => {
  //     if (detail) {
  //       updatedCache[detail.appid] = {
  //         data: detail.data,
  //         timestamp: detail.timestamp,
  //       };
  //     }
  //   });
  //   localStorage.setItem("cachedGameDetails", JSON.stringify(updatedCache));

  //   return games.map((game) => ({
  //     ...game,
  //     ...(updatedCache[game.appid] ? updatedCache[game.appid].data : {}),
  //   }));
  // };

  // useEffect(() => {
  //   if (isAuthenticated && steamId) {
  //     const updateMostPlayedGame = async () => {
  //       if (games.length > 0) {
  //         const highestPlayedGame = games.reduce(
  //           (max, game) =>
  //             game.playtime_forever > max.playtime_forever ? game : max,
  //           games[0]
  //         );

  //         // Fetch details for the most played game if not already available
  //         if (!highestPlayedGame.name || !highestPlayedGame.image) {
  //           const gamesWithDetails = await getGamesWithDetails([
  //             highestPlayedGame,
  //           ]);
  //           if (gamesWithDetails.length > 0) {
  //             setMostPlayedGame(gamesWithDetails[0]);
  //           }
  //         } else {
  //           setMostPlayedGame(highestPlayedGame);
  //         }
  //       }
  //     };

  //     updateMostPlayedGame();
  //   }
  // }, [isAuthenticated, steamId, games]);

  // const handleLoadMore = useCallback(async () => {
  //   if (isAuthenticated && steamId) {
  //     setIsLoading(true);
  //     try {
  //       const currentLength = gamesToDisplay.length;
  //       const newGames = games.slice(currentLength, currentLength + 20);

  //       const gamesWithDetails = await getGamesWithDetails(newGames);

  //       // Check if we have cached achievements
  //       const cachedGamesAchievements = localStorage.getItem(
  //         "cachedGamesAchievements"
  //       );
  //       let cachedAchievementsObj = {};
  //       if (cachedGamesAchievements) {
  //         cachedAchievementsObj = JSON.parse(cachedGamesAchievements);
  //       }

  //       const gamesWithAchievements = gamesWithDetails.map((game) => {
  //         if (cachedAchievementsObj[game.appid]) {
  //           return {
  //             ...game,
  //             achievements: cachedAchievementsObj[game.appid],
  //           };
  //         }
  //         return game;
  //       });

  // Only fetch achievements for games that don't have cached achievements
  // const gamesNeedingAchievements = gamesWithAchievements.filter(
  //   (game) => !game.achievements
  // );
  // if (gamesNeedingAchievements.length > 0) {
  //   const newAchievements = await fetchAchievementsForGames(
  //     gamesNeedingAchievements,
  //     "cachedGamesAchievements",
  //     steamId,
  //     isAuthenticated
  //   );
  //   newAchievements.forEach((game) => {
  //     const index = gamesWithAchievements.findIndex(
  //       (g) => g.appid === game.appid
  //     );
  //     if (index !== -1) {
  //       gamesWithAchievements[index] = game;
  //     }
  //   });
  // }

  // setGamesToDisplay((prevGames) => [
  //   ...prevGames,
  //   ...gamesWithAchievements,
  // ]);

  // Update allAchievements state
  //       setAllAchievements((prevAchievements) => {
  //         const updatedAchievements = { ...prevAchievements };
  //         gamesWithAchievements.forEach((game) => {
  //           if (game.achievements) {
  //             updatedAchievements[game.appid] = game.achievements;
  //           }
  //         });
  //         return updatedAchievements;
  //       });

  //       // Update gamePictures state
  //       setGamePictures((prevPictures) => {
  //         const updatedPictures = { ...prevPictures };
  //         gamesWithAchievements.forEach((game) => {
  //           if (game.image) {
  //             updatedPictures[game.appid] = game.image;
  //           }
  //         });
  //         return updatedPictures;
  //       });
  //     } catch (error) {
  //       console.error("Error loading more games:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // }, [isAuthenticated, steamId, games, gamesToDisplay, getGamesWithDetails]);

  // Update achievements for recent games
  // useEffect(() => {
  //   if (isAuthenticated && steamId) {
  //     const updateRecentGamesAchievements = async () => {
  //       if (recentGames.length > 0) {
  //         const recentGamesWithDetails = await getGamesWithDetails(recentGames);
  //         await fetchAchievementsForGames(
  //           recentGamesWithDetails,
  //           "cachedGamesAchievements",
  //           steamId,
  //           isAuthenticated
  //         );
  //         setRecentGames([...recentGamesWithDetails]);
  //       }
  //     };
  //     updateRecentGamesAchievements();
  //   }
  // }, [
  //   isAuthenticated,
  //   steamId,
  //   recentGames,
  //   getGamesWithDetails,
  //   fetchAchievementsForGames,
  // ]);

  const syncAllData = useCallback(async () => {
    if (isAuthenticated && steamId) {
      setIsSyncing(true);
      setIsFullySynced(false);
      setIsLoading(true);

      console.time("Syncing all data");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log("Syncing all data for Steam ID:", steamId);
        console.log("fetching games data...");
        console.time("Fetching games data");
        const gamesResponse = await fetch(
          `${apiUrl}/api/games/update/${steamId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!gamesResponse.ok) {
          throw new Error(`HTTP error! status: ${gamesResponse.status}`);
        }
        const gamesData = await gamesResponse.json();
        console.log("Fetched all owned games data:", gamesData);

        if (!gamesData.games || !Array.isArray(gamesData.games)) {
          throw new Error(
            "Unexpected response format: gamesData.games is not an array"
          );
        }

        const gamesArray = gamesData.games;

        setAllGamesList(gamesData.games);

        // Calculate total playtime and games played
        console.log("Calculating total playtime and games played...");
        const totalPlaytime = Math.round(
          gamesArray.reduce((acc, game) => acc + game.playtime_forever, 0) / 60
        );
        setPlaytime(totalPlaytime);
        const totalGamesPlayed = gamesArray.filter(
          (game) => game.playtime_forever > 0
        ).length;
        setGamesPlayed(totalGamesPlayed);
        console.log("Gathered playtime and games played data.");

        setGamesToDisplay(gamesArray);
        console.log("Displayed games updated.");
        console.timeEnd("Fetching games data");

        setIsFullySynced(true);
        localStorage.setItem("isFullySynced", "true");
      } catch (error) {
        console.error("Failed to sync all data:", error);
      } finally {
        console.timeEnd("Syncing all data");
        setIsSyncing(false);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, steamId, gamesToDisplay]);

  const syncAllAchievements = useCallback(async () => {
    if (isAuthenticated && steamId) {
      setIsSyncing(true);
      setIsLoading(true);
      // Fetch achievements for all games
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log(
          "Fetching achievements for all games... this will take a while."
        );
        console.time("Fetching achievements data");
        const achievementsResponse = await fetch(
          `${apiUrl}/api/achievements/update/${steamId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!achievementsResponse.ok) {
          throw new Error(`HTTP error! status: ${achievementsResponse.status}`);
        }
        const achievementData = await achievementsResponse.json();

        if (achievementData && achievementData.length > 0) {
          console.log("Fetched all achievement data:", achievementData);
          setAllAchievements(achievementData);
          console.timeEnd("Fetching achievements data");
        } else {
          console.log("No achievements found");
        }
      } catch (error) {
        console.error("Failed to sync all achievement data:", error);
      } finally {
        setIsSyncing(false);
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, steamId]);

  const getRecentAchievements = useCallback(() => {
    if (!isAuthenticated || !steamId || !allAchievements) {
      return [];
    }

    try {
      // Make sure we're working with an array
      if (!Array.isArray(allAchievements)) {
        console.error("allAchievements is not an array:", allAchievements);
        return [];
      }

      const achievedList = allAchievements.filter(
        (achievement) =>
          achievement && achievement.achieved === 1 && achievement.unlocktime
      );

      // Sort by unlock time in descending order
      const sortedAchievements = achievedList.sort(
        (a, b) => b.unlocktime - a.unlocktime
      );

      // Return the top 10 most recent achievements
      return sortedAchievements.slice(0, 10);
    } catch (error) {
      console.error("Error processing recent achievements:", error);
      return [];
    }
  }, [isAuthenticated, steamId, allAchievements]);

  // log the recentAchievements state
  useEffect(() => {
    if (recentAchievements.length > 0) {
      console.log("Recent achievements state updated:", recentAchievements);
    }
  }, [recentAchievements]);

  // sync individual game data achievements
  const syncIndividualGameAchievements = useCallback(
    async (appid) => {
      if (isAuthenticated && steamId) {
        setIsSyncing(true);
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No auth token found");
          }

          // Make sure appid is a string or number, not an object
          const gameId = typeof appid === "object" ? appid.appid : appid;

          console.log(`Syncing achievements for game ${gameId}...`);
          const response = await fetch(
            `${apiUrl}/api/achievements/update/${steamId}/appid/${gameId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched game achievement data:", data);

          // Update the allAchievements state with the new data
          setAllAchievements((prevAchievements) => {
            // Check if prevAchievements is an array
            // Ensure prevAchievements is an array
            const achievementsArray = Array.isArray(prevAchievements)
              ? prevAchievements
              : [];

            // Remove any existing achievements for this game by appid property
            const filteredAchievements = prevAchievements.filter(
              (achievement) => achievement.appid !== Number(gameId)
            );

            // Process the new achievements data
            let gameAchievements = [];
            if (data.achievements && Array.isArray(data.achievements)) {
              gameAchievements = data.achievements;
            } else if (Array.isArray(data)) {
              gameAchievements = data;
            } else if (typeof data === "object" && data !== null) {
              gameAchievements = [data];
            }

            // Add the new achievements to the filtered list
            return [...filteredAchievements, ...gameAchievements];
          });

          // Trigger update of recentAchievements if needed
          const achievements = getRecentAchievements();
          if (achievements) {
            setRecentAchievements(achievements);
          }
        } catch (error) {
          console.error("Failed to sync game achievements:", error);
        } finally {
          setIsSyncing(false);
          setIsLoading(false);
        }
      }
    },
    [
      isAuthenticated,
      steamId,
      apiUrl,
      setAllAchievements,
      getRecentAchievements,
      setRecentAchievements,
    ]
  );
  const handleImageError = (e, appId) => {
    // Set a default/fallback image
    e.target.src = fallbackImage;
    console.log(`Failed to load image for app ${appId}`);
  };

  // return functions and states to useSteamData
  return {
    games,
    gamesToDisplay,
    allAchievements,
    setAllAchievements,
    playtime,
    gamesPlayed,
    gamePictures,
    overviewGames,
    recentGames,
    mostRecentGame,
    isSyncing,
    isFullySynced,
    syncAllData,
    recentAchievements,
    mostPlayedGame,
    isAuthenticated,
    steamId,
    isLoading,
    setIsLoading,
    syncIndividualGameAchievements,
    handleImageError,
  };
}
