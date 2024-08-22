import './styles.css'
import { useState, useEffect } from 'react';
import { useSteamData } from './useSteamData';

export default function App() {
  const { gamesToDisplay, allAchievements, handleLoadMore } = useSteamData();
  // need to link up my loading spinner to when the user is loading api data
  return (
    <>
      <h1 className="container mx-auto text-center text-4xl"><b>STEAM</b>TRACKER</h1>
      <div className='flex flex-col container mx-auto justify-center items-center'>
        <div className="stats stats-vertical bg-transparent">
          <div className="stat">
            <div className="stat-title text-center">Games played:</div>
            <div className="stat-value text-center text-info">366</div>
          </div>

          <div className="stat">
            <div className="stat-title text-center">Hours played:</div>
            <div className="stat-value text-center text-info">4,200</div>
          </div>

          <div className="stat">
            <div className="stat-title text-center">Perfects:</div>
            <div className="stat-value text-center text-info">13</div>
          </div>

          <div className="stat">
            <div className="stat-title text-center">Achievements earned:</div>
            <div className="stat-value text-center text-info">6666</div>
          </div>
        </div>
      </div>

      <div className='flex flex-col container mx-auto justify-center items-center'>
        <img className="m-2" src='https://cdn.akamai.steamstatic.com/steamcommunity/public/images/items/1716740/ef31b1cbdcf001305edbbab4d6fc42968825955a.gif' width="256" height="256" />
        <h2 className='text-4xl'>Brita water filter</h2>
        <button className="btn btn-accent h-5 min-h-0 m-2 mb-3">Sync Profile</button>
      </div>

      <div className="divider divider-primary"></div>

      <div className="overflow-x-auto flex justify-center items-center">
        <table className="table table-sm w-[50%]">
          <thead>
            <tr>
              <th> </th>
              <th>Game Name</th>
              <th>Achievements Earned</th>
            </tr>
          </thead>
          <tbody className="bg-primary bg-opacity-5">
            {gamesToDisplay
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
                  <td className="avatar">
                    <div className="mask mask-square rounded-md h-16 w-16">
                      <img
                        src="/src/img/wow.png"
                        alt="Avatar Tailwind CSS Component" />
                    </div>
                  </td>
                  <td>{game.name}</td>
                  <td>{game.totalAchievements > 0 ? `${game.earnedAchievements} / ${game.totalAchievements}` : 'No achievements'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center">
        <button className="btn btn-info min-h-0 h-8 m-5" onClick={handleLoadMore}>More games</button>
      </div>
    </>
  )
};
