import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { getAllData } from '../utils/indexedDB';

// colour palette for the charts
const COLORS = ['#E187F7', '#E2C64B', '#A7E198', '#88C9DD'];

// math for the pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{
        fontSize: '18px',
        fontWeight: 'bold',
        stroke: '#000000',
        strokeWidth: '1px',
        paintOrder: 'stroke',
      }}
    >
      {`${payload.genre} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export const useCharts = () => {
  const [chartData, setChartData] = React.useState({
    genreChart: [],
    playtimeChart: { hourData: [], dayData: [] },
  });

  // fetching data for the charts
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const moreGameDetails = JSON.parse(localStorage.getItem('cachedGameDetails') || '{}');
        const achievementData = await getAllData('achievements');


        const newChartData = {
          genreChart: processGenreChart(moreGameDetails),
          playtimeChart: processPlaytimeData(achievementData),
        };

        setChartData(newChartData);

      } catch (error) {
        console.error('Error fetching data for charts:', error);
      }
    };

    fetchData();
  }, []);

  // Processing data for the top genre chart
  const processGenreChart = (games) => {
    // Flatten the games array and filter out any undefined values
    const genres = Object.values(games)
      .flatMap(game => game.data?.genres || [])
      .filter(Boolean);


    // Count the number of games for each genre
    const genreCounts = genres.reduce((acc, genre) => {
      acc[genre.description] = (acc[genre.description] || 0) + 1;
      return acc;
    }, {});

    // Sort genres by count in descending order
    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre, amount]) => ({ genre, amount }));

    // Take top 3 genres
    const topThree = sortedGenres
      .slice(0, 3);

    // Calculate "Others" category
    const othersAmount = sortedGenres
      .slice(3)
      .reduce((sum, item) => sum + item.amount, 0);

    const result = topThree;
    if (othersAmount > 0) {
      result.push({ genre: 'Others', amount: othersAmount });
    }

    return result;
  };

  // Playtime data includes data for two different charts, grabbiong just the achieved and the unlocked time so I can see what day and hour 
  // I unlocked the achievements, as well as a count for each day and hour
  const processPlaytimeData = (achievementData) => {

    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);

    let totalAchievements = 0;

    if (typeof achievementData !== 'object' || achievementData === null) {
      console.error("Achievement data is not an object:", achievementData);
      return { hourData: [], dayData: [] };
    }

    Object.entries(achievementData).forEach(([appId, gameData], index) => {

      if (!Array.isArray(gameData.achievements)) {
        return;
      }

      gameData.achievements.forEach((achievement, achievementIndex) => {

        if (typeof achievement !== 'object' || achievement === null) {
          return;
        }

        if (achievement.achieved === 1 || achievement.achieved === true) {
          if (achievement.unlockTime) {
            // Check if unlockTime is in the future (indicating an unachieved achievement)
            const currentTime = Math.floor(Date.now() / 1000);
            if (achievement.unlockTime > currentTime) {
              return;
            }

            const unlockTime = new Date(achievement.unlockTime * 1000);
            const hour = unlockTime.getHours();
            const day = unlockTime.getDay();

            hourCounts[hour]++;
            dayCounts[day]++;
            totalAchievements++;
          }
        }
      });
    });

    const hourData = hourCounts.map((count, index) => ({
      name: `${index}:00`,
      achievements: count,
    }));

    const dayData = dayCounts.map((count, index) => ({
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      achievements: count,
    }));

    return { hourData, dayData };
  };

  const renderGenreChart = () => {

    if (!chartData.genreChart || chartData.genreChart.length === 0) {
      return <div>No data available for genre distribution chart.</div>;
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData.genreChart}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
            nameKey="genre"
          >
            {chartData.genreChart.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
        <h1 className="text-center text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl">You mostly play <span className="text-success">{chartData.genreChart[0].genre.toLowerCase()}</span> games</h1>
      </ResponsiveContainer>
    );
  };

  const renderPlaytimeChart = () => {
    const { hourData, dayData } = chartData.playtimeChart;

    const fontColour = {
      fill: 'white',
    };

    // Determine the preferred time for unlocking achievements
    const preferredTime = hourData.reduce(
      (max, current) => (current.achievements > max.achievements ? current : max),
      hourData[0]
    );

    const getTimeOfDay = (hour) => {
      if (hour >= 5 && hour < 12) return "in the morning";
      if (hour >= 12 && hour < 17) return "in the afternoon";
      if (hour >= 17 && hour < 21) return "in the evening";
      return "at night";
    };

    const preferredDay = dayData.reduce(
      (max, current) => (current.achievements > max.achievements ? current : max),
      dayData[0]
    );

    const getDayOfWeekTranslated = (day) => {
      switch (day) {
        case 'Sun':
          return 'Sunday';
        case 'Mon':
          return 'Monday';
        case 'Tue':
          return 'Tuesday';
        case 'Wed':
          return 'Wednesday';
        case 'Thu':
          return 'Thursday';
        case 'Fri':
          return 'Friday';
        case 'Sat':
          return 'Saturday';
        default:
          return day;
      }
    };


    return (
      <>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" style={fontColour} />
              <Tooltip style={fontColour} />
              <Legend />
              <Bar dataKey="achievements" fill="#E187F7" />
            </BarChart>
            <p className="text-center text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl">You prefer to achievement hunt <span className="text-success">{getTimeOfDay(parseInt(preferredTime.name))}</span></p>
          </ResponsiveContainer>
        </div>

        <div className='mt-[100px]'>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" style={fontColour} />
              <Tooltip />
              <Legend />
              <Bar dataKey="achievements" fill="#E2C64B" />
            </BarChart>
            <p className="text-center text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl">You prefer to achievement hunt <span className="text-success">{getDayOfWeekTranslated(preferredDay.name)}</span></p>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  return {
    chartData,
    renderGenreChart,
    renderPlaytimeChart,
  };
};
