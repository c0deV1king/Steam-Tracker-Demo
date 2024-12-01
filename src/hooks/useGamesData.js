import { useState, useEffect, useCallback } from 'react';
import { fetchAchievementsForGames } from '../utils/fetchAchievementsForGames';
import { delayedFetch } from '../utils/rateLimitingAPI';
import { storeData, getAllData } from '../utils/indexedDB';

export function useGamesData(steamId, isAuthenticated) {
    const [games, setGames] = useState([]);
    const [gamesToDisplay, setGamesToDisplay] = useState([]);
    const [allAchievements, setAllAchievements] = useState({});
    const [recentGames, setRecentGames] = useState([]);
    const [mostRecentGame, setMostRecentGame] = useState(null);
    const [playtime, setPlaytime] = useState(0);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [gamePictures, setGamePictures] = useState({});
    const [overviewGames, setOverviewGames] = useState([]);
    const [overviewAchievements, setOverviewAchievements] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [isFullySynced, setIsFullySynced] = useState(false);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [allGamesList, setAllGamesList] = useState([]);
    const [mostPlayedGame, setMostPlayedGame] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // load cached achievements on initial render
    useEffect(() => {
        if (isAuthenticated && steamId) {
            const loadCachedAchievements = async () => {
                const cachedAchievements = await getAllData('achievements');
                if (cachedAchievements.length > 0) {
                    const achievementsObj = cachedAchievements.reduce((acc, item) => {
                        acc[item.appid] = item.achievements;
                        return acc;
                    }, {});
                    setAllAchievements(achievementsObj);
                }
            };

            loadCachedAchievements();
        }
    }, [isAuthenticated, steamId]);

    // Fetch recent games as well as some screenshot data based on the recent games
    useEffect(() => {
        if (isAuthenticated && steamId) {
            const fetchOverviewGames = async () => {
                const cachedOverviewGames = localStorage.getItem('cachedOverviewGames');
                const cacheTimestampOverviewGames = localStorage.getItem('cacheTimestampOverviewGames');
                const now = new Date().getTime();

                if (cachedOverviewGames && cacheTimestampOverviewGames && 
                    now - parseInt(cacheTimestampOverviewGames) < 12 * 60 * 60 * 1000) {
                    const parsedOverviewGames = JSON.parse(cachedOverviewGames);
                    setOverviewGames(parsedOverviewGames.games);

                    if (parsedOverviewGames.mostRecentGame?.screenshots?.length) {
                        const screenshots = parsedOverviewGames.mostRecentGame.screenshots;
                        const randomScreenshot = screenshots[Math.floor(Math.random() * screenshots.length)].path_full;
                        setMostRecentGame({
                            ...parsedOverviewGames.mostRecentGame,
                            image: randomScreenshot || parsedOverviewGames.mostRecentGame.image
                        });
                    } else {
                        setMostRecentGame(parsedOverviewGames.mostRecentGame);
                    }
                    return;
                }

                try {
                    const res = await delayedFetch(`/.netlify/functions/getRecentGames/?steamid=${steamId}`);
                    const data = await res.json();
                    const recentGamesData = data.response.games || [];

                    const gamesWithDetails = await Promise.all(
                        recentGamesData.map(async (game) => {
                            const detailsRes = await delayedFetch(`/.netlify/functions/getAppDetails/?appid=${game.appid}`);
                            const detailsData = await detailsRes.json();
                            const gameDetails = detailsData[game.appid].data;
                            return {
                                ...game,
                                name: gameDetails.name,
                                image: gameDetails.header_image,
                                screenshots: gameDetails.screenshots || []
                            };
                        })
                    );

                    const gamesWithAchievements = await fetchAchievementsForGames(
                        gamesWithDetails, 
                        'cachedOverviewAchievements', 
                        steamId, 
                        isAuthenticated
                    );

                    let mostRecentGameData = null;

                    if (gamesWithDetails.length > 0) {
                        const randomIndex = Math.floor(Math.random() * gamesWithDetails.length);
                        mostRecentGameData = gamesWithDetails[randomIndex];
                        const randomScreenshot = mostRecentGameData.screenshots?.length 
                            ? mostRecentGameData.screenshots[
                                Math.floor(Math.random() * mostRecentGameData.screenshots.length)
                              ].path_full
                            : null;

                        mostRecentGameData = {
                            ...mostRecentGameData,
                            image: randomScreenshot || mostRecentGameData.image
                        };

                        setMostRecentGame(mostRecentGameData);
                    }

                    setOverviewGames(gamesWithAchievements);
                    setOverviewAchievements(
                        gamesWithAchievements.reduce((acc, game) => {
                            if (game.achievements) {
                                acc[game.appid] = game.achievements;
                            }
                            return acc;
                        }, {})
                    );

                    localStorage.setItem('cachedOverviewGames', JSON.stringify({
                        games: gamesWithAchievements,
                        mostRecentGame: mostRecentGameData
                    }));
                    localStorage.setItem('cacheTimestampOverviewGames', now.toString());

                } catch (error) {
                    console.error('Error fetching overview games data:', error);
                    setOverviewGames([]);
                    setMostRecentGame(null);
                }
            };
            fetchOverviewGames();
        }
    }, [isAuthenticated, steamId]);

    //fetches all the owned games from the steam user as well as some additional data (playtime, ect)
    useEffect(() => {
        if (isAuthenticated && steamId) {
            const fetchGames = async () => {
                const cachedGames = localStorage.getItem('cachedGames');
                const cacheTimestamp = localStorage.getItem('cacheTimestampGames');
                const cachedGamePictures = localStorage.getItem('cachedGamePictures');
                const now = new Date().getTime();

                let allGamesList = [];
                let gamePicturesObj = {};

                if (cachedGames && cacheTimestamp && 
                    now - parseInt(cacheTimestamp) < 12 * 60 * 60 * 1000) {
                    allGamesList = JSON.parse(cachedGames);
                    setGames(allGamesList);

                    if (cachedGamePictures) {
                        gamePicturesObj = JSON.parse(cachedGamePictures);
                        setGamePictures(gamePicturesObj);
                    }
                } else {
                    setIsLoading(true);
                    const res = await delayedFetch(`/.netlify/functions/getOwnedGames/?steamid=${steamId}`);
                    const data = await res.json();
                    allGamesList = data.response.games || [];
                    setGames(allGamesList);
                    setAllGamesList(allGamesList);

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

                // Load cached achievements from IndexedDB
                const cachedAchievements = await getAllData('achievements');
                let achievementsObj = {};
                if (cachedAchievements.length > 0) {
                    achievementsObj = cachedAchievements.reduce((acc, item) => {
                        acc[item.appid] = item.achievements;
                        return acc;
                    }, {});
                    setAllAchievements(achievementsObj);
                }

                // Update gamesToDisplay with cached achievements from IndexedDB
                let gamesWithCachedAchievements = gamesWithDetails.map(game => ({
                    ...game,
                    achievements: achievementsObj[game.appid] || []
                }));

                setGamesToDisplay(gamesWithCachedAchievements);

                // Check localStorage for more recent cached achievements
                const cachedAchievementsString = localStorage.getItem('cachedGamesAchievements');
                const cacheTimestampAchievements = localStorage.getItem('cacheTimestampGamesAchievements');

                if (cachedAchievementsString && cacheTimestampAchievements && 
                    now - parseInt(cacheTimestampAchievements) < 12 * 60 * 60 * 1000) {
                    const localStorageAchievements = JSON.parse(cachedAchievementsString);

                    // Merge localStorage achievements with IndexedDB achievements
                    achievementsObj = { ...achievementsObj, ...localStorageAchievements };
                    setAllAchievements(achievementsObj);

                    // Update gamesToDisplay with merged achievements
                    gamesWithCachedAchievements = gamesWithDetails.map(game => ({
                        ...game,
                        achievements: achievementsObj[game.appid] || []
                    }));

                    setGamesToDisplay(gamesWithCachedAchievements);
                } else {
                    // Fetch new achievements if localStorage cache is outdated or doesn't exist
                    const gamesWithAchievements = await fetchAchievementsForGames(
                        gamesWithDetails, 
                        'cachedGamesAchievements', 
                        steamId, 
                        isAuthenticated
                    );
                    
                    achievementsObj = gamesWithAchievements.reduce((acc, game) => {
                        if (game.achievements) {
                            acc[game.appid] = game.achievements;
                        }
                        return acc;
                    }, {});

                    setAllAchievements(achievementsObj);

                    const updatedGamesWithAchievements = gamesWithDetails.map(game => ({
                        ...game,
                        achievements: achievementsObj[game.appid] || []
                    }));

                    setGamesToDisplay(updatedGamesWithAchievements);

                    localStorage.setItem('cachedGamesAchievements', JSON.stringify(achievementsObj));
                    localStorage.setItem('cacheTimestampGamesAchievements', now.toString());

                    window.location.reload();
                }
                setIsLoading(false);
            };

            fetchGames();
        }
    }, [isAuthenticated, steamId]);

    const getGamesWithDetails = async (games) => {
        const cachedDetails = JSON.parse(localStorage.getItem('cachedGameDetails') || '{}');
        const now = new Date().getTime();

        const gamesNeedingDetails = games.filter(game =>
            !cachedDetails[game.appid] || now - cachedDetails[game.appid].timestamp >= 12 * 60 * 60 * 1000
        );

        if (gamesNeedingDetails.length === 0) {
            return games.map(game => ({
                ...game,
                ...(cachedDetails[game.appid] ? cachedDetails[game.appid].data : {})
            }));
        }

        const newDetails = [];

        if (isAuthenticated && steamId) {
            for (const game of gamesNeedingDetails) {
                try {
                    const detailsRes = await delayedFetch(`/.netlify/functions/getAppDetails/?appid=${game.appid}`);
                    const detailsData = await detailsRes.json();

                    if (detailsData[game.appid].success) {
                        const gameDetails = detailsData[game.appid].data;
                        newDetails.push({
                            appid: game.appid,
                            data: {
                                name: gameDetails.name,
                                image: gameDetails.header_image,
                                genres: gameDetails.genres,
                                developers: gameDetails.developers,
                                metacritic: gameDetails.metacritic,
                                type: gameDetails.type
                            },
                            timestamp: now
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching details for game ${game.appid}:`, error);
                }
            }
        }

        // Update cache and return updated games
        const updatedCache = { ...cachedDetails };
        newDetails.forEach(detail => {
            if (detail) {
                updatedCache[detail.appid] = {
                    data: detail.data,
                    timestamp: detail.timestamp
                };
            }
        });
        localStorage.setItem('cachedGameDetails', JSON.stringify(updatedCache));

        return games.map(game => ({
            ...game,
            ...(updatedCache[game.appid] ? updatedCache[game.appid].data : {})
        }));
    };

    useEffect(() => {
        if (isAuthenticated && steamId) {
            const updateMostPlayedGame = async () => {
                if (games.length > 0) {
                    const highestPlayedGame = games.reduce((max, game) =>
                        game.playtime_forever > max.playtime_forever ? game : max, games[0]);

                    // Fetch details for the most played game if not already available
                    if (!highestPlayedGame.name || !highestPlayedGame.image) {
                        const gamesWithDetails = await getGamesWithDetails([highestPlayedGame]);
                        if (gamesWithDetails.length > 0) {
                            setMostPlayedGame(gamesWithDetails[0]);
                        }
                    } else {
                        setMostPlayedGame(highestPlayedGame);
                    }
                }
            };

            updateMostPlayedGame();
        }
    }, [isAuthenticated, steamId, games]);

    const handleLoadMore = useCallback(async () => {
        if (isAuthenticated && steamId) {
            setIsLoading(true);
            try {
                const currentLength = gamesToDisplay.length;
                const newGames = games.slice(currentLength, currentLength + 20);

                const gamesWithDetails = await getGamesWithDetails(newGames);

                // Check if we have cached achievements
                const cachedGamesAchievements = localStorage.getItem('cachedGamesAchievements');
                let cachedAchievementsObj = {};
                if (cachedGamesAchievements) {
                    cachedAchievementsObj = JSON.parse(cachedGamesAchievements);
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
                    const newAchievements = await fetchAchievementsForGames(
                        gamesNeedingAchievements, 
                        'cachedGamesAchievements', 
                        steamId, 
                        isAuthenticated
                    );
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
                        if (game.image) {
                            updatedPictures[game.appid] = game.image;
                        }
                    });
                    return updatedPictures;
                });
            } catch (error) {
                console.error('Error loading more games:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isAuthenticated, steamId, games, gamesToDisplay, getGamesWithDetails]);


    // Update achievements for recent games
    useEffect(() => {
        if (isAuthenticated && steamId) {
            const updateRecentGamesAchievements = async () => {
                if (recentGames.length > 0) {
                    const recentGamesWithDetails = await getGamesWithDetails(recentGames);
                    await fetchAchievementsForGames(recentGamesWithDetails, 'cachedGamesAchievements', steamId, isAuthenticated);
                    setRecentGames([...recentGamesWithDetails]);
                }
            };
            updateRecentGamesAchievements();
        }
    }, [isAuthenticated, steamId, recentGames, getGamesWithDetails, fetchAchievementsForGames]);

    const syncAllData = useCallback(async () => {
        if (isAuthenticated && steamId) {
            setIsSyncing(true);
            setIsFullySynced(false);
            setIsLoading(true);

            try {
                const res = await delayedFetch(`/.netlify/functions/getOwnedGames/?steamid=${steamId}`);
                const data = await res.json();
                const allGames = data.response.games || [];

                const gamesWithDetails = await getGamesWithDetails(allGames);
                const gamesWithAchievements = await fetchAchievementsForGames(
                    gamesWithDetails, 
                    'cachedGamesAchievements', 
                    steamId, 
                    isAuthenticated
                );

                setGames(gamesWithAchievements);
                setGamesToDisplay(gamesWithAchievements.slice(0, 20));

                const newGamePictures = gamesWithAchievements.reduce((acc, game) => {
                    if (game.image) {
                        acc[game.appid] = game.image;
                    }
                    return acc;
                }, {});
                setGamePictures(newGamePictures);

                await Promise.all(gamesWithAchievements.map(game => storeData('games', game)));

                const allAchievementsData = await getAllData('achievements');
                const updatedAchievements = allAchievementsData.reduce((acc, item) => {
                    acc[item.appid] = item.achievements;
                    return acc;
                }, {});

                setAllAchievements(updatedAchievements);

                const updatedGamesToDisplay = gamesToDisplay.map(game => ({
                    ...game,
                    achievements: updatedAchievements[game.appid] || []
                }));
                setGamesToDisplay(updatedGamesToDisplay);

                setIsSyncing(false);
                setIsFullySynced(true);
                setIsLoading(false);
                window.location.reload();
            } catch (error) {
                console.error('Failed to sync all data:', error);
                setIsSyncing(false);
                setIsLoading(false);
            }
        }
    }, [isAuthenticated, steamId, getGamesWithDetails, gamesToDisplay]);

    const getRecentAchievements = useCallback(() => {
        if (isAuthenticated && steamId) {
            const allAchievementsList = [];
            Object.entries(allAchievements).forEach(([appId, achievements]) => {
                if (Array.isArray(achievements)) {
                    achievements.forEach(achievement => {
                        if (achievement.achieved) {
                            allAchievementsList.push({
                                ...achievement,
                                appId,
                                gameName: games.find(game => game.appid.toString() === appId)?.name || 'Unknown Game'
                            });
                        }
                    });
                }
            });
            const sortedAchievements = allAchievementsList.sort((a, b) => b.unlockTime - a.unlockTime);
            return sortedAchievements.slice(0, 10);
        }
    }, [isAuthenticated, steamId, allAchievements, games]);

    // recentAchievements when allAchievements changes
    useEffect(() => {
        const achievements = getRecentAchievements();
        if (achievements) {
            setRecentAchievements(achievements);
        }
    }, [allAchievements, getRecentAchievements]);

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
        handleLoadMore,
        mostRecentGame,
        isSyncing,
        isFullySynced,
        syncAllData,
        recentAchievements,
        mostPlayedGame,
        isAuthenticated,
        steamId,
        isLoading,
        setIsLoading
    };
}
