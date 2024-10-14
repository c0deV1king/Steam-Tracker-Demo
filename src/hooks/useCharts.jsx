import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getAllData } from '../utils/indexedDB';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const useCharts = () => {
  const [chartData, setChartData] = React.useState({
    genreDistribution: [],
    playtimeByMonth: [],
    achievementCompletion: [],
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const games = await getAllData('games');
        const achievements = await getAllData('achievements');

        setChartData({
          genreDistribution: processGenreDistribution(games),
          playtimeByMonth: processPlaytimeByMonth(games),
          achievementCompletion: processAchievementCompletion(games, achievements),
        });
      } catch (error) {
        console.error('Error fetching data for charts:', error);
      }
    };

    fetchData();
  }, []);

  const processGenreDistribution = (games) => {
    // Example processing - replace with actual logic based on your data structure
    return [
      { name: 'Action', value: 400 },
      { name: 'RPG', value: 300 },
      { name: 'Strategy', value: 300 },
      { name: 'Simulation', value: 200 },
    ];
  };

  const processPlaytimeByMonth = (games) => {
    // Process and return data for playtime by month chart
    // Example: return an array of { month: 'Jan', playtime: 50 } objects
  };

  const processAchievementCompletion = (games, achievements) => {
    // Process and return data for achievement completion chart
    // Example: return an array of { game: 'Game1', completed: 15, total: 20 } objects
  };

  const renderGenreDistributionChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData.genreDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.genreDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );

  // Add more render functions for other chart types

  return {
    chartData,
    renderGenreDistributionChart,
    // Add more render functions here as you create them
  };
};
