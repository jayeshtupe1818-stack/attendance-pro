import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      const { data: ct } = await supabase.from("class_teachers").select("class_id").eq("teacher_id", user.id);
      if (!ct || ct.length === 0) { setClasses([]); return; }
      const classIds = ct.map((c) => c.class_id);
      const { data: classData } = await supabase.from("classes").select("id, name").in("id", classIds);

      const today = new Date().toISOString().split("T")[0];
      const { data: todayRecords } = await supabase.from("attendance_records").select("class_id").eq("date", today).in("class_id", classIds);

      const markedSet = new Set(todayRecords?.map((r) => r.class_id) || []);
      setClasses(classData?.map((c) => ({ ...c, markedToday: markedSet.has(c.id) })) || []);
    };
    fetchClasses();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 ? (
          <Card><CardContent className="pt-6 text-muted-foreground">No classes assigned yet.</CardContent></Card>
        ) : (
          classes.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{c.name}</CardTitle>
                <Badge variant={c.markedToday ? "default" : "outline"}>
                  {c.markedToday ? "Marked" : "Pending"}
                </Badge>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate(`/teacher/attendance?classId=${c.id}`)}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Mark Attendance
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
