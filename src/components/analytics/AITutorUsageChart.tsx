import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  data: any[];
}

export const AITutorUsageChart = ({ data }: Props) => {
  const chartData = data.reduce((acc: any[], session: any) => {
    const date = format(parseISO(session.created_at), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.sessions += 1;
      existing.messages += session.total_messages || 0;
    } else {
      acc.push({ 
        date, 
        sessions: 1,
        messages: session.total_messages || 0,
      });
    }
    
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="sessions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" />
        <Area type="monotone" dataKey="messages" stackId="2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
