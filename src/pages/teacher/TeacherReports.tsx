import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TeacherReports = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      const { data: ct } = await supabase.from("class_teachers").select("class_id").eq("teacher_id", user.id);
      if (!ct) return;
      const ids = ct.map((c) => c.class_id);
      const [classRes, profRes] = await Promise.all([
        supabase.from("classes").select("id, name").in("id", ids),
        supabase.from("profiles").select("user_id, full_name"),
      ]);
      setClasses(classRes.data || []);
      setProfiles(new Map(profRes.data?.map((p) => [p.user_id, p.full_name]) || []));
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (!user || classes.length === 0) return;
    const fetchRecords = async () => {
      const classIds = selectedClass === "all" ? classes.map((c) => c.id) : [selectedClass];
      let query = supabase.from("attendance_records").select("*").in("class_id", classIds).order("date", { ascending: false });
      if (dateFrom) query = query.gte("date", dateFrom);
      if (dateTo) query = query.lte("date", dateTo);
      const { data } = await query.limit(200);
      setRecords(data || []);
    };
    fetchRecords();
  }, [selectedClass, dateFrom, dateTo, classes, user]);

  const classMap = new Map(classes.map((c) => [c.id, c.name]));
  const statusColor = (s: string) => s === "present" ? "default" : s === "late" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Reports</h1>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>From</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label>To</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No records found</TableCell></TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{profiles.get(r.student_id) || "—"}</TableCell>
                    <TableCell>{classMap.get(r.class_id) || "—"}</TableCell>
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

export default TeacherReports;
