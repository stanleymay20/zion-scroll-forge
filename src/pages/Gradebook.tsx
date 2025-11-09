import { useParams } from 'react-router-dom';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGradebook } from '@/hooks/useFaculty';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export default function Gradebook() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: gradebook } = useGradebook(courseId!);

  console.info('✝️ ScrollUniversity: Gradebook loaded — Christ is Lord over every grade');

  const exportToCSV = () => {
    if (!gradebook || gradebook.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Student ID', 'Assignment', 'Score', 'Total Points', 'Percentage', 'Graded At'];
    const rows = gradebook.map((row: any) => [
      row.student_user_id?.slice(0, 8) || 'N/A',
      row.assignment_title,
      row.score || 0,
      row.total_points || 0,
      row.score && row.total_points ? `${((row.score / row.total_points) * 100).toFixed(1)}%` : 'N/A',
      row.graded_at ? new Date(row.graded_at).toLocaleDateString() : 'Not graded'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradebook-${courseId}.csv`;
    a.click();
    
    toast.success('Gradebook exported successfully');
  };

  return (
    <PageTemplate
      title="Course Gradebook"
      description="View and manage student grades"
      actions={
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          {gradebook && gradebook.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Student</th>
                    <th className="text-left p-3">Assignment</th>
                    <th className="text-center p-3">Score</th>
                    <th className="text-center p-3">Total</th>
                    <th className="text-center p-3">Percentage</th>
                    <th className="text-left p-3">Graded</th>
                  </tr>
                </thead>
                <tbody>
                  {gradebook.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">
                        {row.student_user_id?.slice(0, 8) || 'N/A'}
                      </td>
                      <td className="p-3">{row.assignment_title}</td>
                      <td className="p-3 text-center font-semibold">
                        {row.score ?? '-'}
                      </td>
                      <td className="p-3 text-center">
                        {row.total_points || '-'}
                      </td>
                      <td className="p-3 text-center">
                        {row.score && row.total_points ? (
                          <span className={
                            (row.score / row.total_points) >= 0.7 
                              ? 'text-green-600 font-semibold' 
                              : 'text-amber-600'
                          }>
                            {((row.score / row.total_points) * 100).toFixed(1)}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {row.graded_at 
                          ? new Date(row.graded_at).toLocaleDateString() 
                          : 'Not graded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No grades recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
