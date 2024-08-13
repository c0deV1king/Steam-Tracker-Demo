import './styles.css'
import { useState, useEffect } from 'react';

// Grabbing my stored api key from .env NOTE: vite requires "VITE_" in front of variables stored in .env
const API_KEY = import.meta.env.VITE_STEAM_API_KEY;

export default function App() {
  // use states to store and update data
  const [games, setGames] = useState([]);
  const [allAchievements, setAllAchievements] = useState({});

  // API call to fetch the games in my steam account
  // ** Learn more about the politics of useEffect, async, await. **
  useEffect(() => {
    const fetchGames = async () => {
      const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561198119786249&format=json`);
      const data = await res.json();
      // if no data, it returns an empty array "|| []"
      setGames(data.response.games || []);
    };

    fetchGames();
  }, []);
  // API call to grab all my achievements for all games
  useEffect(() => {
    const fetchAchievementsForAllGames = async () => {
      const achievements = {};
      // for of loop, this is going over the array of objects to check each games appid and calls another fetch request for each appid
      // it then returns the separate achievement api call
      for (const game of games) {
        const res = await fetch(`http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${API_KEY}&steamid=76561198119786249`);
        const data = await res.json();
        achievements[game.appid] = data.playerstats.achievements || [];
      }

      setAllAchievements(achievements);
    };

    if (games.length > 0) {
      fetchAchievementsForAllGames();
    }
  }, [games]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>#</th>
              <th>Game Name</th>
              <th>Achievements Earned</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(allAchievements).map(([appid, achievements], index) => { // Creates a new array with the required info for the page
              // Calculate the number of achievements earned
              const earnedAchievements = achievements.filter(achievement => achievement.achieved).length;
              // And the total amount of achievements in the game
              const totalAchievements = achievements.length;
  
              const gameName = `Game ID: ${appid}`;
              // Put it all together in a table
              return (
                <tr key={appid}>
                  <th>{index + 1}</th>
                  <td>{gameName}</td>
                  <td>{earnedAchievements} / {totalAchievements}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
