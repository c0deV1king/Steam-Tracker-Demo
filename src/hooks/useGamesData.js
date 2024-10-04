import { useState, useEffect, useCallback } from 'react';
import { fetchAchievementsForGames } from '../utils/fetchAchievementsForGames';
import { delayedFetch } from '../utils/rateLimitingAPI';

export const useGamesData = (API_KEY) => {

    const [games, setGames] = useState([]);
    const [gamesToDisplay, setGamesToDisplay] = useState([]);
    const [allAchievements, setAllAchievements] = useState({});
    const [recentGames, setRecentGames] = useState([]);
    const [mostRecentGame, setMostRecentGame] = useState(null);
    const [playtime, setPlaytime] = useState({});
    const [gamesPlayed, setGamesPlayed] = useState({});
    const [gamePictures, setGamePictures] = useState({});
    const [overviewGames, setOverviewGames] = useState([]);
    const [overviewAchievements, setOverviewAchievements] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [isFullySynced, setIsFullySynced] = useState(false);

    // Fetch recent games
    useEffect(() => {
        const fetchOverviewGames = async () => {
            console.log("Fetching overview games");

            const cachedOverviewGames = localStorage.getItem('cachedOverviewGames');
            const cacheTimestampOverviewGames = localStorage.getItem('cacheTimestampOverviewGames');
            const now = new Date().getTime();
            console.log("Recent games cache checked")

            if (cachedOverviewGames && cacheTimestampOverviewGames && now - parseInt(cacheTimestampOverviewGames) < 24 * 60 * 60 * 1000) {
                console.log("Loading recent games from cache");
                const parsedOverviewGames = JSON.parse(cachedOverviewGames);
                setOverviewGames(parsedOverviewGames.games);

                // Randomize screenshot for most recent game
                if (parsedOverviewGames.mostRecentGame && parsedOverviewGames.mostRecentGame.screenshots) {
                    const screenshots = parsedOverviewGames.mostRecentGame.screenshots;
                    const randomScreenshot = screenshots.length > 0
                        ? screenshots[Math.floor(Math.random() * screenshots.length)].path_full
                        : null;
                    setMostRecentGame({
                        ...parsedOverviewGames.mostRecentGame,
                        image: randomScreenshot || parsedOverviewGames.mostRecentGame.image
                    });
                } else {
                    setMostRecentGame(parsedOverviewGames.mostRecentGame);
                }

                console.log("Loaded recent games from cache");
                return;
            }

            console.log("No cached games found, fetching recent games");

            try {
                const res = await fetch(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json`);
                const data = await res.json();
                console.log("Recent games API response:", data);
                const recentGamesData = data.response.games || [];
                console.log("Recent games data:", recentGamesData);

                const gamesWithDetails = await Promise.all(recentGamesData.map(async (game) => {
                    const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}`);
                    const detailsData = await detailsRes.json();
                    const gameDetails = detailsData[game.appid].data;
                    return {
                        ...game,
                        name: gameDetails.name,
                        image: gameDetails.header_image,
                        screenshots: gameDetails.screenshots || []
                    };
                }));

                console.log("Games with details:", gamesWithDetails);
                const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails, 'cachedOverviewAchievements');
                console.log("Games with achievements:", gamesWithAchievements);

                let mostRecentGameData = null;

                if (gamesWithDetails.length > 0) {
                    mostRecentGameData = gamesWithDetails[0];
                    const randomScreenshot = mostRecentGameData.screenshots.length > 0
                        ? mostRecentGameData.screenshots[Math.floor(Math.random() * mostRecentGameData.screenshots.length)].path_full
                        : null;

                    mostRecentGameData = {
                        ...mostRecentGameData,
                        image: randomScreenshot || mostRecentGameData.image
                    };

                    setMostRecentGame(mostRecentGameData);
                }

                setOverviewGames(gamesWithAchievements);
                setOverviewAchievements(gamesWithAchievements.reduce((acc, game) => {
                    acc[game.appid] = game.achievements;
                    return acc;
                }, {}));

                console.log("Setting overview games to: ", gamesWithAchievements);

                // Cache the results
                localStorage.setItem('cachedOverviewGames', JSON.stringify({
                    games: gamesWithAchievements,
                    mostRecentGame: mostRecentGameData
                }));
                localStorage.setItem('cacheTimestampOverviewGames', new Date().getTime().toString());

                console.log("Recent games cached: ", localStorage.getItem('cachedOverviewGames'));

            } catch (error) {
                console.error('Error fetching overview games data:', error);
                setOverviewGames([]);
                setMostRecentGame(null);
            }
        };
        fetchOverviewGames();
    }, []);

    const testSchema = useCallback(async () => {
        console.log("testSchema called")
        try {
            const res = await fetch(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${API_KEY}&appid=230410`);
            const data = await res.json();
            console.log("testSchema data:", data);
        } catch (error) {
            console.error("Error in testSchema:", error);
        }
    }, [API_KEY]);


    useEffect(() => {
        console.log("useEffect triggered for fetching games");
        const fetchGames = async () => {
            console.log("Fetching games");

            const cachedGames = localStorage.getItem('cachedGames');
            const cacheTimestamp = localStorage.getItem('cacheTimestampGames');
            const cachedGamePictures = localStorage.getItem('cachedGamePictures');
            const now = new Date().getTime();

            let allGamesList = [];
            let gamePicturesObj = {};

            if (cachedGames && cacheTimestamp && now - parseInt(cacheTimestamp) < 24 * 60 * 60 * 1000) {
                allGamesList = JSON.parse(cachedGames);
                setGames(allGamesList);
                console.log("Loaded games from cache");

                if (cachedGamePictures) {
                    gamePicturesObj = JSON.parse(cachedGamePictures);
                    setGamePictures(gamePicturesObj);
                    console.log("Loaded game pictures from cache");
                }
            } else {
                // Fetch games from API
                const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json&include_played_free_games=1`);
                const data = await res.json();
                allGamesList = data.response.games || [];
                setGames(allGamesList);

                // Cache the results
                localStorage.setItem('cachedGames', JSON.stringify(allGamesList));
                localStorage.setItem('cacheTimestampGames', now.toString());
            }

            // Calculate total playtime and games played
            const totalPlaytime = Math.round(allGamesList.reduce((acc, game) => acc + game.playtime_forever, 0) / 60);
            setPlaytime(totalPlaytime);
            const totalGamesPlayed = allGamesList.filter(game => game.playtime_forever > 0).length;
            setGamesPlayed(totalGamesPlayed);

            const firstTwenty = allGamesList.slice(0, 20);
            let gamesWithDetails = await getGamesWithDetails(firstTwenty);

            // If we didn't load game pictures from cache, update them now
            if (Object.keys(gamePicturesObj).length === 0) {
                gamesWithDetails.forEach(game => {
                    if (game.image) {
                        gamePicturesObj[game.appid] = game.image;
                    }
                });
                setGamePictures(gamePicturesObj);
                localStorage.setItem('cachedGamePictures', JSON.stringify(gamePicturesObj));
                localStorage.setItem('cacheTimestampGamePictures', now.toString());
            }

            // Fetch or load cached achievements
            const cachedAchievements = localStorage.getItem('cachedGamesAchievements');
            const cacheTimestampAchievements = localStorage.getItem('cacheTimestampGamesAchievements');

            let achievementsObj = {};

            if (cachedAchievements && cacheTimestampAchievements && now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
                achievementsObj = JSON.parse(cachedAchievements);
                console.log("Loaded achievements from cache");
            } else {
                const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails, 'cachedGamesAchievements');
                achievementsObj = gamesWithAchievements.reduce((acc, game) => {
                    acc[game.appid] = game.achievements;
                    return acc;
                }, {});

                // Cache the achievements
                localStorage.setItem('cachedGamesAchievements', JSON.stringify(achievementsObj));
                localStorage.setItem('cacheTimestampGamesAchievements', now.toString());
            }

            setAllAchievements(achievementsObj);

            const gamesWithAchievements = gamesWithDetails.map(game => ({
                ...game,
                achievements: achievementsObj[game.appid] || []
            }));

            setGamesToDisplay(gamesWithAchievements);
        };

        fetchGames();
    }, []);

    const getGamesWithDetails = async (games) => {
        console.log("getGamesWithDetails called")
        const cachedDetails = JSON.parse(localStorage.getItem('cachedGameDetails') || '{}');
        const now = new Date().getTime();

        const gamesNeedingDetails = games.filter(game => 
            !cachedDetails[game.appid] || now - cachedDetails[game.appid].timestamp >= 24 * 60 * 60 * 1000
        );

        if (gamesNeedingDetails.length === 0) {
            console.log("All game details found in cache");
            return games.map(game => ({
                ...game,
                ...(cachedDetails[game.appid] ? cachedDetails[game.appid].data : {})
            }));
        }

        const newDetails = [];
        for (const game of gamesNeedingDetails) {
            try {
                const detailsRes = await delayedFetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}`);
                console.log(`Details requested for game ${game.appid}`);
                const detailsData = await detailsRes.json();
                
                if (detailsData[game.appid].success) {
                    const gameDetails = detailsData[game.appid].data;
                    newDetails.push({
                        appid: game.appid,
                        data: {
                            name: gameDetails.name,
                            image: gameDetails.header_image
                        },
                        timestamp: now
                    });
                } else {
                    console.log(`No details found for game ${game.appid}`);
                }
            } catch (error) {
                console.error(`Error fetching details for game ${game.appid}:`, error);
            }
        }

        // Update cache with new details
        const updatedCache = {...cachedDetails};
        newDetails.forEach(detail => {
            if (detail) {
                updatedCache[detail.appid] = {
                    data: detail.data,
                    timestamp: detail.timestamp
                };
            }
        });
        localStorage.setItem('cachedGameDetails', JSON.stringify(updatedCache));

        // Merge new details with existing games
        return games.map(game => ({
            ...game,
            ...(updatedCache[game.appid] ? updatedCache[game.appid].data : {})
        }));
    };



    // const getOverviewGamesWithDetails = async (games) => {
    //     return Promise.all(games.map(async (game) => {
    //         try {
    //             const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}`);
    //             const detailsData = await detailsRes.json();
    //             const gameDetails = detailsData[game.appid].data;
    //             return {
    //                 ...game,
    //                 name: gameDetails.name,
    //                 image: gameDetails.header_image
    //             };
    //         } catch (error) {
    //             console.error(`Error fetching details for game ${game.appid}:`, error);
    //             return game;
    //         }
    //     }));
    // };

    useEffect(() => {
        const gamesWithoutAchievements = gamesToDisplay.filter(game => !allAchievements[game.appid]);
        if (gamesWithoutAchievements.length > 0) {
            fetchAchievementsForGames(gamesWithoutAchievements);
        }
    }, []);

    const handleLoadMore = useCallback(async () => {
        
        console.log('handleLoadMore called', new Date().toISOString());

        const currentLength = gamesToDisplay.length;
        const newGames = games.slice(currentLength, currentLength + 20);
        
        const gamesWithDetails = await getGamesWithDetails(newGames);
        console.log("Awaiting games with details")
        
        // Check if we have cached achievements
        const cachedAllAchievements = localStorage.getItem('cachedAllAchievements');
        let cachedAchievementsObj = {};
        if (cachedAllAchievements) {
            cachedAchievementsObj = JSON.parse(cachedAllAchievements);
        }

        const gamesWithAchievements = gamesWithDetails.map(game => {
            if (cachedAchievementsObj[game.appid]) {
                return {
                    ...game,
                    achievements: cachedAchievementsObj[game.appid]
                };
            }
            return game;
        });

        // Only fetch achievements for games that don't have cached achievements
        const gamesNeedingAchievements = gamesWithAchievements.filter(game => !game.achievements);
        if (gamesNeedingAchievements.length > 0) {
            const newAchievements = await fetchAchievementsForGames(gamesNeedingAchievements);
            newAchievements.forEach(game => {
                const index = gamesWithAchievements.findIndex(g => g.appid === game.appid);
                if (index !== -1) {
                    gamesWithAchievements[index] = game;
                }
            });
        }

        setGamesToDisplay(prevGames => [...prevGames, ...gamesWithAchievements]);
        
        // Update allAchievements state
        setAllAchievements(prevAchievements => {
            const updatedAchievements = { ...prevAchievements };
            gamesWithAchievements.forEach(game => {
                if (game.achievements) {
                    updatedAchievements[game.appid] = game.achievements;
                }
            });
            return updatedAchievements;
        });

        // Update gamePictures state
        setGamePictures(prevPictures => {
            const updatedPictures = { ...prevPictures };
            gamesWithAchievements.forEach(game => {
                updatedPictures[game.appid] = game.image;
            });
            return updatedPictures;
        });
    }, [games, gamesToDisplay]);

      // Update achievements for recent games
  useEffect(() => {
    const updateRecentGamesAchievements = async () => {
      if (recentGames.length > 0) {
        const recentGamesWithDetails = await getGamesWithDetails(recentGames);
        await fetchAchievementsForGames(recentGamesWithDetails);
        setRecentGames([...recentGamesWithDetails]);
      }
    };
    updateRecentGamesAchievements();
  }, []);

  const syncAllData = useCallback(async () => {
    console.log("syncAllData function called");
    setIsSyncing(true);
    setIsFullySynced(false);

    try {
        // Fetch all owned games
        const res = await delayedFetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json&include_played_free_games=1`);
        const data = await res.json();
        const allGames = data.response.games || [];

        // Fetch details for all games
        const gamesWithDetails = await getGamesWithDetails(allGames);

        // Fetch achievements for all games
        const gamesWithAchievements = await fetchAchievementsForGames(gamesWithDetails, 'cachedAllAchievements');

        // Update state
        setGames(gamesWithAchievements);
        setGamesToDisplay(gamesWithAchievements.slice(0, 20)); // Update gamesToDisplay with the first 20 games

        // Update gamePictures state
        const newGamePictures = gamesWithAchievements.reduce((acc, game) => {
            if (game.image) {
                acc[game.appid] = game.image;
            }
            return acc;
        }, {});
        setGamePictures(newGamePictures);

        // Cache all games
        localStorage.setItem('cachedGames', JSON.stringify(gamesWithAchievements));
        localStorage.setItem('cacheTimestampGames', new Date().getTime().toString());

        // Cache all achievements
        const achievementsObj = gamesWithAchievements.reduce((acc, game) => {
            acc[game.appid] = game.achievements;
            return acc;
        }, {});
        localStorage.setItem('cachedAllAchievements', JSON.stringify(achievementsObj));
        localStorage.setItem('cacheTimestampAllAchievements', new Date().getTime().toString());

        // Cache game pictures
        localStorage.setItem('cachedGamePictures', JSON.stringify(newGamePictures));
        localStorage.setItem('cacheTimestampGamePictures', new Date().getTime().toString());

        console.log("Sync completed successfully");
        setIsSyncing(false);
        setIsFullySynced(true);
    } catch (error) {
        console.error('Failed to sync all data:', error);
        setIsSyncing(false);
    }
  }, [API_KEY]);

    return {
        games,
        gamesToDisplay,
        allAchievements,
        playtime,
        gamesPlayed,
        gamePictures,
        overviewGames,
        recentGames,
        handleLoadMore,
        mostRecentGame,
        isSyncing,
        isFullySynced,
        syncAllData,
        testSchema
    };
};