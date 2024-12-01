import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${payload.genre} ${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const renderDemoPieChart = (data) => (
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
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    </ResponsiveContainer>
);

const renderDemoBarChart = (data) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="achievements" fill="#8884d8" />
        </BarChart>
    </ResponsiveContainer>
);

const renderSecondBarChart = (data) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="achievements" fill="#82ca9d" />
        </BarChart>
    </ResponsiveContainer>
);

class DemoCharts extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pieChart: null,
            barChart: null,
            secondBarChart: null
        };
    }

    componentDidMount() {
        const pieData = [
            { name: 'Action', value: 40, genre: 'Action' },
            { name: 'RPG', value: 30, genre: 'RPG' },
            { name: 'Strategy', value: 20, genre: 'Strategy' },
            { name: 'Others', value: 10, genre: 'Others' },
        ];

        const barData = [
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

        const secondBarData = [
            { name: 'Sunday', achievements: 126 },
            { name: 'Monday', achievements: 72 },
            { name: 'Tuesday', achievements: 35 },
            { name: 'Wednesday', achievements: 20 },
            { name: 'Thursday', achievements: 49 },
            { name: 'Friday', achievements: 99 },
            { name: 'Saturday', achievements: 185 },
        ];

        this.setState({
            pieChart: renderDemoPieChart(pieData),
            barChart: renderDemoBarChart(barData),
            secondBarChart: renderSecondBarChart(secondBarData)
        });
    }

    render() {
        const { pieChart, barChart, secondBarChart } = this.state;
        return (
            <div>
                <div className="chart-container h-[250px] w-[100%]">
                    {pieChart}
                    <h2 className="text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl mb-[10%]">You mainly play <span className='text-success font-bold'>Shooter</span> games</h2>
                </div>

                <div className="chart-container h-[800px] w-[100%] mt-[10%]">
                    {barChart}
                    <h2 className="text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl mb-[10%]">You prefer to play games at <span className='text-success font-bold'>night</span></h2>
                    {secondBarChart}
                    <h2 className="text-xl text-center pt-2 pb-2 bg-base-100 mr-5 ml-5 rounded-xl mb-[10%]">You prefer to play games on <span className='text-success font-bold'>Saturday</span></h2>
                </div>
            </div>
        );
    }
}

export default DemoCharts;
