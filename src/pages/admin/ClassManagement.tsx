import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ClassWithCounts = Database["public"]["Tables"]["classes"]["Row"] & {
  class_students: { id: string }[];
  class_teachers: { id: string; teacher_id: string }[];
};

const ClassManagement = () => {
  const [classes, setClasses] = useState<ClassWithCounts[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("*, class_students(id), class_teachers(id, teacher_id)");
    setClasses(data || []);
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from("classes").insert({ name, description });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Class created" });
      setName(""); setDescription(""); setOpen(false);
      fetchClasses();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchClasses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Class Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics 101" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Class</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>All Classes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No classes yet</TableCell></TableRow>
              ) : (
                classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.description || "—"}</TableCell>
                    <TableCell>{c.class_students?.length || 0}</TableCell>
                    <TableCell>{c.class_teachers?.length || 0}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
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

export default ClassManagement;
