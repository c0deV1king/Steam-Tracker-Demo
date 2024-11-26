import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const RADIAN = Math.PI / 180;

interface PieDataItem {
  name: string;
  value: number;
  genre: string;
}

interface BarDataItem {
  name: string;
  achievements: number;
}

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  payload: PieDataItem;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: CustomizedLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${payload.genre} ${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// Function to render a Pie Chart
const renderDemoPieChart = (data: PieDataItem[]) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
        </PieChart>
    </ResponsiveContainer>
);

const renderDemoBarChart = (data: BarDataItem[]) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="achievements" fill="#8884d8" />
        </BarChart>
    </ResponsiveContainer>
);

const renderSecondBarChart = (data: BarDataItem[]) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="achievements" fill="#82ca9d" />
        </BarChart>
    </ResponsiveContainer>
);

interface DemoChartsState {
    pieChart: React.ReactNode;
    barChart: React.ReactNode;
    secondBarChart: React.ReactNode;
}

class DemoCharts extends PureComponent<{}, DemoChartsState> {
    render() {
        const pieData: PieDataItem[] = [
            { name: 'Group A', value: 400, genre: 'Shooter' },
            { name: 'Group B', value: 300, genre: 'Strategy' },
            { name: 'Group C', value: 300, genre: 'RPG' },
            { name: 'Group D', value: 700, genre: 'Other' },
        ];

        const barData: BarDataItem[] = [
            { name: '0:00', achievements: 53 },
            { name: '1:00', achievements: 30 },
            { name: '2:00', achievements: 55 },
            { name: '3:00', achievements: 27 },
            { name: '4:00', achievements: 30 },
            { name: '5:00', achievements: 40 },
            { name: '6:00', achievements: 40 },
            { name: '7:00', achievements: 33 },
            { name: '8:00', achievements: 50 },
            { name: '9:00', achievements: 21 },
            { name: '10:00', achievements: 30 },
            { name: '11:00', achievements: 40 },
            { name: '12:00', achievements: 30 },
            { name: '13:00', achievements: 52 },
            { name: '14:00', achievements: 20 },
            { name: '15:00', achievements: 30 },
            { name: '16:00', achievements: 40 },
            { name: '17:00', achievements: 46 },
            { name: '18:00', achievements: 30 },
            { name: '19:00', achievements: 50 },
            { name: '20:00', achievements: 20 },
            { name: '21:00', achievements: 30 },
            { name: '22:00', achievements: 40 },
            { name: '23:00', achievements: 44 },
        ];

        const secondBarData: BarDataItem[] = [
            { name: 'Sunday', achievements: 126 },
            { name: 'Monday', achievements: 72 },
            { name: 'Tuesday', achievements: 35 },
            { name: 'Wednesday', achievements: 20 },
            { name: 'Thursday', achievements: 49 },
            { name: 'Friday', achievements: 99 },
            { name: 'Saturday', achievements: 185 },
        ];

        return {
            pieChart: renderDemoPieChart(pieData),
            barChart: renderDemoBarChart(barData),
            secondBarChart: renderSecondBarChart(secondBarData),
        };
    }
}

export default DemoCharts;
