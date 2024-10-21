import { delayedFetch } from './rateLimitingAPI';
import { storeData, getData } from './indexedDB';


export const fetchAchievementsForGames = async (games, cacheKey = 'cachedGamesAchievements', apiKey, steamId, isAuthenticated) => {
    if (isAuthenticated && apiKey && steamId) {
        try {
            // console.log(`Fetching achievements for games (${cacheKey}):`, games);

            const gamesWithAchievements = await Promise.all(games.map(async (game) => {
                try {
                    // Check if we have cached achievements for this game
                    const cachedAchievements = await getData('achievements', game.appid);

                    const [earnedRes, infoRes] = await Promise.all([
                        delayedFetch(`/.netlify/functions/getPlayerAchievements/?appid=${game.appid}&key=${apiKey}&steamid=${steamId}`),
                        delayedFetch(`/.netlify/functions/getSchemaForGame/?appid=${game.appid}&key=${apiKey}`)
                    ]);

                    const earnedData = await earnedRes.json();
                    const infoData = await infoRes.json();

                    if (earnedData.playerstats && earnedData.playerstats.achievements && infoData.game && infoData.game.availableGameStats && infoData.game.availableGameStats.achievements) {
                        const newAchievements = earnedData.playerstats.achievements.map(achievement => {
                            const achievementInfo = infoData.game.availableGameStats.achievements.find(
                                a => achievement.apiname === a.name
                            );

                            return {
                                apiname: achievement.apiname,
                                name: achievementInfo ? achievementInfo.name : achievement.apiname,
                                displayName: achievementInfo ? achievementInfo.displayName : '',
                                description: achievementInfo ? achievementInfo.description : '',
                                icon: achievementInfo ? achievementInfo.icon : '',
                                achieved: achievement.achieved,
                                unlockTime: achievement.unlocktime
                            };
                        });

                        // Merge new achievements with cached achievements
                        let combinedAchievements = newAchievements;
                        if (cachedAchievements && cachedAchievements.achievements) {
                            combinedAchievements = newAchievements.map(newAchievement => {
                                const cachedAchievement = cachedAchievements.achievements.find(a => a.apiname === newAchievement.apiname);
                                return cachedAchievement ? { ...cachedAchievement, ...newAchievement } : newAchievement;
                            });
                        }

                        // Store updated achievements in IndexedDB
                        await storeData('achievements', { appid: game.appid, achievements: combinedAchievements });

                        // console.log(`Updated achievements for game ${game.appid}:`, combinedAchievements);
                        return { ...game, achievements: combinedAchievements };
                    } else {
                        //  console.log(`No achievements data available for game ${game.appid}`);
                        await storeData('achievements', { appid: game.appid, achievements: [] });
                        return { ...game, achievements: [] };
                    }
                } catch (error) {
                    console.error(`Error fetching achievements for game ${game.appid}:`, error);
                    return { ...game, achievements: [] };
                }
            }));

            // console.log(`Fetched achievements for all games`);
            return gamesWithAchievements;
        } catch (error) {
            console.error('Error in fetchAchievementsForGames:', error);
            return [];
        }
    }
    return [];
};
