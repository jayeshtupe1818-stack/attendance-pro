import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, BookOpen, ClipboardCheck, BarChart3, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Classes", url: "/admin/classes", icon: BookOpen },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
];

const teacherNav = [
  { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
  { title: "Mark Attendance", url: "/teacher/attendance", icon: ClipboardCheck },
  { title: "Reports", url: "/teacher/reports", icon: BarChart3 },
];

const studentNav = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
];

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { role, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = role === "admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="flex items-center gap-2 px-4 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AttendancePro</span>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <div className="mb-2 text-sm">
              <p className="font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-muted-foreground text-xs capitalize">{role}</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1">
          <header className="flex h-14 items-center gap-4 border-b px-6">
            <SidebarTrigger />
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
