import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: any[];
}

export const StudentPerformanceChart = ({ data }: Props) => {
  const scoreRanges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ];

  const chartData = scoreRanges.map(({ range, min, max }) => ({
    range,
    count: data.filter(s => s.score >= min && s.score <= max).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="hsl(var(--primary))" name="Submissions" />
      </BarChart>
    </ResponsiveContainer>
  );
};
