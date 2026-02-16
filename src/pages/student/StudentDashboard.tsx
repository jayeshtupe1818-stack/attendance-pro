import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["hsl(142, 76%, 36%)", "hsl(0, 84%, 60%)", "hsl(38, 92%, 50%)"];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [classStats, setClassStats] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: cs } = await supabase.from("class_students").select("class_id").eq("student_id", user.id);
      if (!cs || cs.length === 0) return;
      const classIds = cs.map((c) => c.class_id);

      const [classRes, attendanceRes] = await Promise.all([
        supabase.from("classes").select("id, name").in("id", classIds),
        supabase.from("attendance_records").select("*").eq("student_id", user.id).order("date", { ascending: false }),
      ]);

      const classMap = new Map(classRes.data?.map((c) => [c.id, c.name]) || []);
      
      // Compute per-class stats
      const statsMap = new Map<string, { present: number; absent: number; late: number }>();
      attendanceRes.data?.forEach((r) => {
        const s = statsMap.get(r.class_id) || { present: 0, absent: 0, late: 0 };
        s[r.status as "present" | "absent" | "late"]++;
        statsMap.set(r.class_id, s);
      });

      setClassStats(
        Array.from(statsMap.entries()).map(([classId, s]) => ({
          classId,
          className: classMap.get(classId) || "—",
          ...s,
          total: s.present + s.absent + s.late,
          rate: Math.round(((s.present + s.late) / (s.present + s.absent + s.late)) * 100),
        }))
      );

      setRecentRecords(
        (attendanceRes.data || []).slice(0, 10).map((r) => ({
          ...r,
          className: classMap.get(r.class_id) || "—",
        }))
      );
    };
    fetchData();
  }, [user]);

  const overallPresent = classStats.reduce((a, c) => a + c.present + c.late, 0);
  const overallTotal = classStats.reduce((a, c) => a + c.total, 0);
  const overallRate = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;
  const pieData = [
    { name: "Present", value: classStats.reduce((a, c) => a + c.present, 0) },
    { name: "Absent", value: classStats.reduce((a, c) => a + c.absent, 0) },
    { name: "Late", value: classStats.reduce((a, c) => a + c.late, 0) },
  ];

  const statusColor = (s: string) => s === "present" ? "default" : s === "late" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Attendance</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Overall Attendance</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{overallRate}%</div>
              <p className="text-sm text-muted-foreground">{overallPresent}/{overallTotal} days</p>
            </div>
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Per Class</CardTitle></CardHeader>
          <CardContent>
            {classStats.length === 0 ? (
              <p className="text-muted-foreground">No attendance data yet.</p>
            ) : (
              <div className="space-y-3">
                {classStats.map((c) => (
                  <div key={c.classId} className="flex items-center justify-between">
                    <span className="font-medium">{c.className}</span>
                    <Badge variant={c.rate >= 75 ? "default" : "destructive"}>{c.rate}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecords.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No records yet</TableCell></TableRow>
              ) : (
                recentRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.className}</TableCell>
                    <TableCell><Badge variant={statusColor(r.status)} className="capitalize">{r.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
