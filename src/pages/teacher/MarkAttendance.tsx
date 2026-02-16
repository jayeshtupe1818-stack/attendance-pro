import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

interface StudentAttendance {
  student_id: string;
  full_name: string;
  status: AttendanceStatus;
}

const MarkAttendance = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState(searchParams.get("classId") || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      const { data: ct } = await supabase.from("class_teachers").select("class_id").eq("teacher_id", user.id);
      if (!ct) return;
      const { data } = await supabase.from("classes").select("id, name").in("id", ct.map((c) => c.class_id));
      setClasses(data || []);
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      const { data: cs } = await supabase.from("class_students").select("student_id").eq("class_id", selectedClass);
      if (!cs || cs.length === 0) { setStudents([]); return; }
      const sIds = cs.map((s) => s.student_id);
      const [profilesRes, existingRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", sIds),
        supabase.from("attendance_records").select("student_id, status").eq("class_id", selectedClass).eq("date", date),
      ]);
      const existingMap = new Map(existingRes.data?.map((r) => [r.student_id, r.status as AttendanceStatus]) || []);
      setStudents(
        profilesRes.data?.map((p) => ({
          student_id: p.user_id,
          full_name: p.full_name,
          status: existingMap.get(p.user_id) || "present",
        })) || []
      );
    };
    fetchStudents();
  }, [selectedClass, date]);

  const toggleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId
          ? { ...s, status: s.status === "present" ? "absent" : s.status === "absent" ? "late" : "present" }
          : s
      )
    );
  };

  const markAllPresent = () => setStudents((prev) => prev.map((s) => ({ ...s, status: "present" as AttendanceStatus })));

  const handleSubmit = async () => {
    if (!user || !selectedClass) return;
    setSaving(true);
    const records = students.map((s) => ({
      class_id: selectedClass,
      student_id: s.student_id,
      date,
      status: s.status,
      marked_by: user.id,
    }));

    const { error } = await supabase.from("attendance_records").upsert(records, { onConflict: "class_id,student_id,date" });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Attendance saved!" });
    setSaving(false);
  };

  const statusColor = (s: string) => (s === "present" ? "default" : s === "late" ? "secondary" : "destructive");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mark Attendance</h1>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
      </div>
      {selectedClass && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
              <Button size="sm" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Save Attendance"}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No students enrolled</TableCell></TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.student_id}>
                      <TableCell className="font-medium">{s.full_name || "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(s.student_id)}>
                          <Badge variant={statusColor(s.status)} className="capitalize cursor-pointer">{s.status}</Badge>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendance;
