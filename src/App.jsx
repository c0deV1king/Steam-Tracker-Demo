import './styles.css'
import { useState, useEffect } from 'react';


const API_KEY = import.meta.env.VITE_STEAM_API_KEY;
// Template Literal, a nicer way to write strings and concatenation
const URL = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=230410&key=${API_KEY}&steamid=76561198119786249`

console.log('testing')


export default function App() {
  function GrabPlayerAchievements() {
    // having [] inside of useState, will allow it to render as an array. Initially empty.
    const [achievements, setAchievements] = useState([])
    // getting a response and data from the API && converting it into
    // a json
    useEffect(() => {
      const fetchWarframe = async () => {
        const res = await fetch(URL);
        const data = await res.json()
        console.log(data)
        const achArray = Object.values(data.playerstats.achievements) // converting the objects in the array to be an array themselves
        setAchievements(achArray) // updating the data

        console.log(achievements)

        // grabbing the playerstats object from the data and accessing
        // its array (which is the achievements)
        // const playerStats = data.playerstats;
        // const achievements = playerStats.achievements;

        //const achievementNames = achievements.slice(0, 2) // trying to filter out all the object data except the name

        //console.log(achievementNames)

        // Using the "filter()" method to filter out a specific 
        // value from the array and logging the objects that fit
        // that criteria
        // const achievedAchievements = achievements.filter(
        //  achievement => achievement.achieved === 1
        //);
        // console.log('Earned Achievements: ', achievedAchievements);
      }
      fetchWarframe();
    }, []);
    console.log(typeof achievements);
    console.log(Array.isArray(achievements))


    // Explanation for the shortform if else.
    // it takes in a condition followed by a question mark (?)
    // and then the first expression is what fires if its true
    // second is if its false. These are separated by a colon (:)
    // SYNTAX:
    // condition ? true expression : false expression
    return (
      <>
        <button className="btn btn-outline btn-accent">Accent</button>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Achievement</th>
                <th>Achieved?</th>
                <th>Date Unlocked</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((achievement) => (
                <tr key={achievement.apiname}>
                  <td>{achievement.apiname}</td>
                  <td>{achievement.achieved ? 'Yes' : 'No'}</td>
                  <td>{achievement.unlocktime !== 0
                    ? new Date(achievement.unlocktime * 1000).toLocaleString()
                    : ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </>
    )
  }
  return (
  <GrabPlayerAchievements />
)
}

