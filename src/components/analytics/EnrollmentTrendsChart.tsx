import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  data: any[];
}

export const EnrollmentTrendsChart = ({ data }: Props) => {
  const chartData = data.reduce((acc: any[], enrollment: any) => {
    const date = format(parseISO(enrollment.created_at), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.enrollments += 1;
    } else {
      acc.push({ date, enrollments: 1 });
    }
    
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
