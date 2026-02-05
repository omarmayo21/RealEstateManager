import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, FileText, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import type { Project, Unit, Lead } from "@shared/schema";

export default function AdminDashboard() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const stats = [
    {
      title: "إجمالي المشروعات",
      value: projects.length,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "إجمالي الوحدات",
      value: units.length,
      icon: Home,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "إجمالي الاستفسارات",
      value: leads.length,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "الوحدات المتاحة",
      value: units.filter((u) => u.status === "available").length,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">نظرة عامة على النشاط</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} data-testid={`card-${stat.title}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`} data-testid={`value-${stat.title}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>آخر الاستفسارات</CardTitle>
            </CardHeader>
            <CardContent>
              {leads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  data-testid={`lead-${lead.id}`}
                >
                  <div>
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))}
              {leads.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد استفسارات</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>آخر المشروعات</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  data-testid={`project-${project.id}`}
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.city}</p>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-center text-muted-foreground py-8">لا توجد مشروعات</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
