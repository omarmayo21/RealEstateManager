import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Phone } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Lead, Project, Unit } from "@shared/schema";
import { useState } from "react";

export default function AdminLeads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterProjectId, setFilterProjectId] = useState<string>("all");

  const { data: leads = [] } = useQuery<(Lead & { project?: Project; unit?: Unit })[]>({
    queryKey: ["/api/leads"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["api", "projects"]

  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/leads/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "تم حذف الاستفسار بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });

  const filteredLeads = leads.filter((lead) => {
    if (filterProjectId === "all") return true;
    return lead.projectId?.toString() === filterProjectId;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">الاستفسارات</h1>
            <p className="text-muted-foreground">إدارة استفسارات العملاء</p>
          </div>
          <div className="w-64">
            <Select value={filterProjectId} onValueChange={setFilterProjectId}>
              <SelectTrigger data-testid="select-filter-project">
                <SelectValue placeholder="تصفية حسب المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المشروعات</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>المشروع</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                    <TableCell className="font-medium">{lead.fullName}</TableCell>
                    <TableCell>
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-primary">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-primary">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.project ? (
                        <Badge variant="outline">{lead.project.name}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.unit ? (
                        <Badge variant="outline">{lead.unit.title}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-left">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(lead.id)}
                        data-testid={`button-delete-${lead.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLeads.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا توجد استفسارات</p>
            )}
          </CardContent>
        </Card>

        {filteredLeads.length > 0 && (
          <div className="text-sm text-muted-foreground">
            عدد الاستفسارات: <span className="font-semibold text-primary">{filteredLeads.length}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
