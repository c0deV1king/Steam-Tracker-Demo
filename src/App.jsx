import './styles.css'
import { useState, useEffect } from 'react';
import { useSteamData } from './useSteamData';

export default function App() {
  const { games, allAchievements, handleLoadMore } = useSteamData();
  // need to link up my loading spinner to when the user is loading api data
  return (
    <>
      <div className="container mx-auto text-center text-2xl"><b>STEAM</b>TRACKER</div>
      <div className='flex flex-col container mx-auto justify-center items-center'>
        <button className="btn btn-accent h-5 min-h-0 m-4">Sync Profile</button>
        <div className="stats stats-vertical shadow-lg shadow-slate-800 bg-transparent flex flex-col">
          <div className="stat">
            <div className="stat-title">Games played:</div>
            <div className="stat-value">366</div>
          </div>

          <div className="stat">
            <div className="stat-title">Hours played:</div>
            <div className="stat-value">4,200</div>
          </div>

          <div className="stat">
            <div className="stat-title">Perfects:</div>
            <div className="stat-value">13</div>
          </div>

          <div className="stat">
            <div className="stat-title">Achievements earned:</div>
            <div className="stat-value">6666</div>
          </div>
        </div>
      </div>
      <span className="loading loading-spinner text-info"></span>
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
            {games
              .filter(game => game.playtime_forever > 0)
              .map(game => {
                const achievements = allAchievements[game.appid] || [];
                const earnedAchievements = achievements.filter(achievement => achievement.achieved).length;
                const totalAchievements = achievements.length;
                return {
                  ...game,
                  earnedAchievements,
                  totalAchievements
                };
              })
              .sort((a, b) => b.earnedAchievements - a.earnedAchievements)
              .map((game, index) => (
                <tr key={game.appid}>
                  <th>{index + 1}</th>
                  <td>{game.name}</td>
                  <td>{game.totalAchievements > 0 ? `${game.earnedAchievements} / ${game.totalAchievements}` : 'No achievements'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-info" onClick={handleLoadMore}>Info</button>
    </>
  )
};
