import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, attendanceRate: 0 });
  const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [studentsRes, teachersRes, classesRes, attendanceRes] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "student"),
        supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "teacher"),
        supabase.from("classes").select("id", { count: "exact" }),
        supabase.from("attendance_records").select("status, date"),
      ]);

      const total = attendanceRes.data?.length || 0;
      const present = attendanceRes.data?.filter((r) => r.status === "present" || r.status === "late").length || 0;

      setStats({
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        classes: classesRes.count || 0,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      });

      // Build chart data from last 7 days
      const days: { date: string; rate: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayRecords = attendanceRes.data?.filter((r) => r.date === dateStr) || [];
        const dayPresent = dayRecords.filter((r) => r.status === "present" || r.status === "late").length;
        days.push({ date: dateStr.slice(5), rate: dayRecords.length > 0 ? Math.round((dayPresent / dayRecords.length) * 100) : 0 });
      }
      setChartData(days);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Students", value: stats.students, icon: Users, color: "text-blue-600" },
    { title: "Total Teachers", value: stats.teachers, icon: Users, color: "text-green-600" },
    { title: "Total Classes", value: stats.classes, icon: BookOpen, color: "text-purple-600" },
    { title: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
