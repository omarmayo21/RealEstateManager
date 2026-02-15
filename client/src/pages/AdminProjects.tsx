import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Project, InsertProject } from "@shared/schema";

const projectSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  slug: z.string().min(2, "الرابط مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  appearsInResaleProjects: z.boolean(),
  appearsInProjects: z.boolean(),
  appearsInAlexandriaProjects: z.boolean(),
  appearsInAlexandriaResale: z.boolean(),
  logoUrl: z.string().optional(),
  shortDescription: z.string().optional(),
  amenities: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function AdminProjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
   queryKey: ["api", "projects"]
  });


  const { data: projectImages = [], refetch: refetchProjectImages } =
    useQuery<{ id: number; imageUrl: string }[]>({
      queryKey: ["api", "project-images", selectedProject?.id ?? null],
      enabled: !!selectedProject,
      queryFn: async () => {
        if (!selectedProject) return [];

        const res = await apiRequest(
          "GET",
          `/api/projects/${selectedProject.id}/images`
        );

        const data = await res.json();
        return data as { id: number; imageUrl: string }[];
      },
    });





  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      slug: "",
      city: "",
      appearsInResaleProjects: false,
      appearsInProjects: false,
      appearsInAlexandriaProjects: false,
      appearsInAlexandriaResale: false,
      logoUrl: "",
      shortDescription: "",
      amenities: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const projectData: InsertProject = {
        ...data,
        logoUrl: data.logoUrl || null,
        shortDescription: data.shortDescription || null,
        amenities: data.amenities || null,
      };
      return await apiRequest("POST", "/api/projects", projectData);
    },
    onSuccess: () => {
      toast({ title: "تم إضافة المشروع بنجاح" });
      queryClient.invalidateQueries({queryKey: ["api", "projects"]
 });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProjectFormData }) => {
      const projectData: InsertProject = {
        ...data,
        logoUrl: data.logoUrl || null,
        shortDescription: data.shortDescription || null,
        amenities: data.amenities || null,
      };
      return await apiRequest("PUT", `/api/projects/${id}`, projectData);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث المشروع بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["api", "projects"] });
      setDialogOpen(false);
      setEditingProject(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/projects/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "تم حذف المشروع بنجاح" });
      queryClient.invalidateQueries({queryKey: ["api", "projects"]});
    },
  });

  const addProjectImageMutation = useMutation({
  mutationFn: async (imageUrl: string) => {
    if (!selectedProject) return;
    return await apiRequest(
      "POST",
      `/api/projects/${selectedProject.id}/images`,
      { imageUrl }
    );
  },
  onSuccess: () => {
    toast({ title: "تم إضافة صورة المشروع" });
    setNewImageUrl("");
    refetchProjectImages();
  },
});


  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      slug: project.slug,
      city: project.city,
      appearsInResaleProjects: project.appearsInResaleProjects,
      appearsInProjects: project.appearsInProjects,
      appearsInAlexandriaProjects: project.appearsInAlexandriaProjects,
      appearsInAlexandriaResale: project.appearsInAlexandriaResale,
      logoUrl: project.logoUrl || "",
      shortDescription: project.shortDescription || "",
      amenities: project.amenities || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: ProjectFormData) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">المشروعات</h1>
            <p className="text-muted-foreground">إدارة المشروعات العقارية</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary" onClick={() => { setEditingProject(null); form.reset(); }} data-testid="button-add-project">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مشروع
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? "تعديل مشروع" : "إضافة مشروع جديد"}</DialogTitle>
                <DialogDescription>
                  املأ البيانات التالية
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المشروع</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-project-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرابط (slug)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="the-one-alexandria" data-testid="input-project-slug" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-project-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط الشعار (اختياري)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-project-logo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف مختصر (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-project-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المرافق (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="كل مرفق في سطر" className="min-h-[100px]" data-testid="input-project-amenities" />
                        </FormControl>
                        <FormDescription>اكتب كل مرفق في سطر منفصل</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 p-4 bg-secondary rounded-md">
                    <p className="font-medium">ظهور المشروع في القوائم:</p>
                    <FormField
                      control={form.control}
                      name="appearsInResaleProjects"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>ريسيل مشروعات</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-resale-projects" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="appearsInProjects"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>مشروعات</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-projects" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="appearsInAlexandriaProjects"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>مشروعات الإسكندرية</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-alexandria-projects" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="appearsInAlexandriaResale"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>ريسيل الإسكندرية</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-alexandria-resale" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary" data-testid="button-save-project">
                    {editingProject ? "تحديث" : "إضافة"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>الفئات</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.city}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.appearsInResaleProjects && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">ريسيل</span>
                        )}
                        {project.appearsInProjects && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">مشروعات</span>
                        )}
                        {project.appearsInAlexandriaProjects && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">إسكندرية</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProject(project);
                            setImagesDialogOpen(true);
                          }}
                        >
                          صور المشروع
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(project)}
                          data-testid={`button-edit-${project.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(project.id)}
                          data-testid={`button-delete-${project.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {projects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا توجد مشروعات</p>
            )}
          </CardContent>
        </Card>
      </div>

        <Dialog open={imagesDialogOpen} onOpenChange={setImagesDialogOpen}>
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>
          صور المشروع: {selectedProject?.name}
        </DialogTitle>
        <DialogDescription>
          أضف صور المشروع مرة واحدة وسيتم استخدامها تلقائيًا لكل الوحدات
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !selectedProject) return;

            try {
              setUploading(true);

              // 1️⃣ رفع الصورة على Cloudinary
              const formData = new FormData();
              formData.append("file", file);
              formData.append("upload_preset", "projects");
              formData.append("folder", "projects");

              const cloudinaryResponse = await fetch(
                "https://api.cloudinary.com/v1_1/dqir7d4jn/image/upload",
                {
                  method: "POST",
                  body: formData,
                }
              );

              const cloudinaryData = await cloudinaryResponse.json();

              if (!cloudinaryData.secure_url) {
                throw new Error("فشل رفع الصورة");
              }

              // 2️⃣ حفظ رابط الصورة في الداتا بيز
              addProjectImageMutation.mutate(cloudinaryData.secure_url);
            } catch (error) {
              console.error("Upload Error:", error);
            } finally {
              setUploading(false);
            }
          }}
        />

        <p className="text-sm text-muted-foreground">
          {uploading
            ? "جاري رفع الصورة إلى Cloudinary..."
            : "اختر صورة من جهازك وسيتم رفعها تلقائيًا"}
        </p>
      </div>

    </DialogContent>
  </Dialog>

    </AdminLayout>
    
  );
}
