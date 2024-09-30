import { delayedFetch } from './rateLimitingAPI';

const API_KEY = import.meta.env.VITE_STEAM_API_KEY;
export const fetchAchievementsForGames = async (games, cacheKey = 'cachedGamesAchievements') => {
    console.log(`Fetching achievements for games (${cacheKey}):`, games);

    const cachedAchievements = localStorage.getItem(cacheKey);
    const cacheTimestampAchievements = localStorage.getItem(`${cacheKey}Timestamp`);
    const now = new Date().getTime();

    let achievementsObj = {};

    if (cachedAchievements && cacheTimestampAchievements && now - parseInt(cacheTimestampAchievements) < 24 * 60 * 60 * 1000) {
      achievementsObj = JSON.parse(cachedAchievements);
      console.log(`Loaded achievements from cache (${cacheKey}):`, achievementsObj);
    }

    const gamesWithAchievements = await Promise.all(games.map(async (game) => {
      if (achievementsObj[game.appid]) {
        console.log(`Using cached achievements for game ${game.appid}`);
        return { ...game, achievements: achievementsObj[game.appid] };
      }

      try {
        const res = await delayedFetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${API_KEY}&steamid=76561198119786249`);
        const data = await res.json();

        if (data.playerstats && data.playerstats.achievements) {
          achievementsObj[game.appid] = data.playerstats.achievements;
          console.log(`Fetched achievements for game ${game.appid}:`, data.playerstats.achievements);
          return { ...game, achievements: data.playerstats.achievements };
        } else {
          console.log(`No achievements found for game ${game.appid}`);
          return { ...game, achievements: [] };
        }
      } catch (error) {
        console.error(`Error fetching achievements for game ${game.appid}:`, error);
        return { ...game, achievements: [] };
      }
    }));

    // Update the cache with fetched achievements
    localStorage.setItem(cacheKey, JSON.stringify(achievementsObj));
    localStorage.setItem(`${cacheKey}Timestamp`, now.toString());

    console.log(`Updated cached achievements (${cacheKey}):`, achievementsObj);
    return gamesWithAchievements;
  };