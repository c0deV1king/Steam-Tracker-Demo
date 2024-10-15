import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
    >
      {`${payload.genre} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export const useCharts = () => {
  const [chartData, setChartData] = React.useState({
    genreChart: [],
  });

  // fetching data for the charts
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const moreGameDetails = JSON.parse(localStorage.getItem('cachedGameDetails') || '{}');

        const newChartData = {
          genreChart: processGenreChart(moreGameDetails),
          // example for new chart data: playtimeByMonth: processPlaytimeByMonth(games),
        };

        console.log("New chart data:", newChartData);
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

    console.log("genres before processing:", genres);

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

    console.log("Processed genre distribution:", result);
    return result;
  };

  // Other possible chart data
  const processPlaytimeByMonth = (games) => {

  };

  const renderGenreChart = () => {
    console.log("Rendering chart with data:", chartData.genreChart);

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
        <h1 className="text-center">You mostly play <span className="text-success">{chartData.genreChart[0].genre.toLowerCase()}</span> games</h1>
      </ResponsiveContainer>
    );
  };

  // Add more render functions for other chart types

  return {
    chartData,
    renderGenreChart,
  };
};
