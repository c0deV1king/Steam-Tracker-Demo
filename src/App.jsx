import './styles.css'
import { useSteamData } from './useSteamData';

export default function App() {
  const { profileData, gamesToDisplay, allAchievements, playtime, gamesPlayed, gamePictures, handleLoadMore } = useSteamData();
  // need to link up my loading spinner to when the user is loading api data
  return (
    <>
      <div className=''>
        <div className='container mx-auto bg-transparent h-15 flex justify-center items-center'>
          <h1 className="container mx-auto text-center text-4xl"><b>STEAM</b>TRACKER</h1>
        </div>

        <div className='container mx-auto bg-black lg:w-[50%] sm:w-[90%] h-[300px]'>
          {/* banner */}
        </div>
        {playtime && gamesPlayed && (
          <div className='flex flex-col container mx-auto justify-center items-center m-5'>
            <div className="stats stats-vertical lg:stats-horizontal bg-transparent">
              <div className="stat">
                <div className="stat-title text-center">Games played:</div>
                <div className="stat-value text-center text-info">{typeof gamesPlayed === 'number' ? gamesPlayed : 'N/A'}</div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Hours played:</div>
                <div className="stat-value text-center text-info">{typeof playtime === 'number' ? playtime : 'N/A'}</div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Perfects:</div>
                <div className="stat-value text-center text-info">N/A</div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Achievements earned:</div>
                <div className="stat-value text-center text-info">N/A</div>
              </div>
            </div>
          </div>
        )}
        <div className='contaier mx-auto bg-base-200 sm:w-[75%] lg:w-[50%] border-2 border-base-100'>
          {profileData && (
            <div className='flex flex-col container mx-auto justify-center items-center'>
              <img className="m-2" src={profileData.avatarfull} width="256" height="256" alt='profile image' />
              <h2 className='text-4xl'>{profileData.personaname}</h2>
              <a href={profileData.profileurl} target="_blank" rel="noopener noreferrer"><button className="btn btn-accent h-5 min-h-0 m-2 mb-3">Steam</button></a>
            </div>
          )}
          <div className="divider divider-base-100"></div>

          <div className="overflow-x-auto flex justify-center items-center">
            <table className="table table-sm w-[95%]">
              <thead>
                <tr>
                  <th>.</th>
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
                    <tr key={game.appid} >
                      <td className="avatar">
                        <div className="mask rounded-md h-[107.5px] w-[230px]">
                          <img
                            src={gamePictures[game.appid]}
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

        </div>
      </div >
    </>
  )
};
