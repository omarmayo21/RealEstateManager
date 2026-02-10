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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";
import type { Unit, Project, InsertUnit } from "@shared/schema";
import { NumberInput } from "@/components/ui/NumberInput";
import type { UnitWithImages } from "../../../shared/schema";
import { apiRequest } from "@/lib/api";


const parseOptionalNumber = (value: string | undefined) => {
  if (value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const optionalNumberField = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

const unitSchema = z.object({
  projectId: z.string().min(1, "المشروع مطلوب"),

  title: z.string().min(2, "العنوان مطلوب"),
  unitCode: z.string().optional(), // كود الوحدة

  type: z.enum(["resale", "primary"]),
  propertyType: z.string().optional(), // نوع العقار (شقة / فيلا)

  price: z.string().min(1, "السعر مطلوب"),
  overPrice: optionalNumberField, // الأوفر برايس
  installmentValue: optionalNumberField, // قيمة القسط
  maintenanceDeposit: optionalNumberField, // وديعة الصيانة
  totalPaid: optionalNumberField, // إجمالي المدفوع
 // إجمالي المدفوع // إجمالي + الأوفر
  repaymentYears: optionalNumberField, // سنوات السداد

  area: z.string().min(1, "المساحة مطلوبة"),
  bedrooms: z.string().min(1, "عدد الغرف مطلوب"),
  bathrooms: z.string().min(1, "عدد دورات المياه مطلوب"),

  location: z.string().min(2, "الموقع مطلوب"),
  status: z.enum(["available", "sold"]),

  mainImageUrl: z.string().optional(),
  description: z.string().optional(),
  paymentPlanPdf: z.any().optional().nullable(), // ✅ ده المهم
  images: z.array(z.instanceof(File)).optional(),


  isFeaturedOnHomepage: z.boolean(),
});

type UnitFormData = z.infer<typeof unitSchema>;

export default function AdminUnits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["api", "projects"]

  });

    const { data: units = [] } = useQuery<UnitWithImages[]>({
      queryKey: ["/api/units"],
    });
    const form = useForm<UnitFormData>({
      resolver: zodResolver(unitSchema),
      defaultValues: {
        projectId: "",
        title: "",
        unitCode: "",
        propertyType: "",
        repaymentYears: "",

        type: "primary",
        price: "",
        overPrice: "",
        installmentValue: "",
        maintenanceDeposit: "",
        totalPaid: "",

        area: "",
        bedrooms: "",
        bathrooms: "",

        location: "",
        status: "available",

        mainImageUrl: "",
        description: "",
        isFeaturedOnHomepage: false,

        images: [],                // ✅
        paymentPlanPdf: null,      // ✅ ده المهم
      },
    });

    
const createMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    return apiRequest("POST", "/api/units", formData);
  },
  onSuccess: () => {
    toast({ title: "تم إضافة الوحدة بنجاح" });
    queryClient.invalidateQueries({ queryKey: ["/api/units"] });
    setDialogOpen(false);
    form.reset();
  },
});





const updateMutation = useMutation({
  mutationFn: async ({ id, data }: { id: number; data: any }) => {
    return apiRequest("PUT", `/api/units/${id}`, data);
  },
  onSuccess: () => {
    toast({ title: "تم تحديث الوحدة بنجاح" });
    queryClient.invalidateQueries({ queryKey: ["/api/units"] });
    setDialogOpen(false);
    setEditingUnit(null);
    form.reset();
  },
});



  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/units/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "تم حذف الوحدة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
    },
  });
  const toFormString = (value?: number | null) =>
    value != null ? String(value) : "";

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    form.reset({
      projectId: unit.projectId.toString(),
      title: unit.title,
      unitCode: unit.unitCode || "",
      propertyType: unit.propertyType || "",

      price: unit.price.toString(),
      overPrice: unit.overPrice?.toString() || "",
      installmentValue: unit.installmentValue?.toString() || "",
      maintenanceDeposit: unit.maintenanceDeposit?.toString() || "",
      totalPaid: toFormString(unit.totalPaid),
      repaymentYears: toFormString(unit.repaymentYears),

      type: unit.type as "resale" | "primary",
      area: unit.area.toString(),
      bedrooms: unit.bedrooms.toString(),
      bathrooms: unit.bathrooms.toString(),
      location: unit.location,
      status: unit.status as "available" | "sold",
      mainImageUrl: unit.mainImageUrl || "",
      description: unit.description || "",
      isFeaturedOnHomepage: unit.isFeaturedOnHomepage,
    });

    setDialogOpen(true);
  };

  type UploadResponse = {
    images?: string[];
    paymentPlanPdf?: string | null;
  };

const onSubmit = async (data: UnitFormData) => {
  const formData = new FormData();

  // ======================
  // النصوص
  // ======================
  formData.append("projectId", String(data.projectId));
  formData.append("title", data.title);
  formData.append("type", data.type);

  if (data.unitCode) formData.append("unitCode", data.unitCode);
  if (data.propertyType) formData.append("propertyType", data.propertyType);
  if (data.description) formData.append("description", data.description);
  if (data.location) formData.append("location", data.location);
  if (data.status) formData.append("status", data.status);
  if (data.mainImageUrl) formData.append("mainImageUrl", data.mainImageUrl);

  formData.append("price", String(data.price));
  formData.append("area", String(data.area));
  formData.append("bedrooms", String(data.bedrooms));
  formData.append("bathrooms", String(data.bathrooms));
  formData.append("isFeaturedOnHomepage", String(data.isFeaturedOnHomepage));

  if (data.overPrice) formData.append("overPrice", String(data.overPrice));
  if (data.installmentValue) formData.append("installmentValue", String(data.installmentValue));
  if (data.maintenanceDeposit) formData.append("maintenanceDeposit", String(data.maintenanceDeposit));
  if (data.totalPaid) formData.append("totalPaid", String(data.totalPaid));
  if (data.repaymentYears) formData.append("repaymentYears", String(data.repaymentYears));

  // ======================
  // الصور
  // ======================
  data.images?.forEach((file) => {
    formData.append("images", file);
  });

  // ======================
  // 📄 PDF (النقطة الحاسمة)
  // ======================
  if (data.paymentPlanPdf instanceof File) {
    formData.append("paymentPlanPdf", data.paymentPlanPdf);
  }

  // ======================
  // إرسال
  // ======================
  if (editingUnit) {
    updateMutation.mutate({ id: editingUnit.id, data: formData });
  } else {
    createMutation.mutate(formData);
  }
};




  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">الوحدات</h1>
            <p className="text-muted-foreground">إدارة الوحدات العقارية</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary" onClick={() => { setEditingUnit(null); form.reset(); }} data-testid="button-add-unit">
                <Plus className="w-4 h-4 ml-2" />
                إضافة وحدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUnit ? "تعديل وحدة" : "إضافة وحدة جديدة"}</DialogTitle>
                <DialogDescription>
                  املأ البيانات التالية
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* المشروع */}
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المشروع</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المشروع" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* كود الوحدة */}
                  <FormField
                    control={form.control}
                    name="unitCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كود الوحدة</FormLabel>
                        <FormControl>
                          <Input placeholder="B07-1102" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* نوع العقار */}
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع العقار</FormLabel>
                        <FormControl>
                          <Input placeholder="شقة / فيلا" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* نوع الوحدة */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الوحدة</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">جديد</SelectItem>
                            <SelectItem value="resale">إعادة بيع</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* السعر */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر (جنيه)</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="1450000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* الأوفر برايس */}
                  <FormField
                    control={form.control}
                    name="overPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأوفر برايس (جنيه)</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="200000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                 {/* قيمة القسط */}
                  <FormField
                    control={form.control}
                    name="installmentValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قيمة القسط (جنيه)</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* وديعة الصيانة */}
                  <FormField
                    control={form.control}
                    name="maintenanceDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وديعة الصيانة (جنيه)</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* إجمالي المدفوع */}
                  <FormField
                    control={form.control}
                    name="totalPaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>إجمالي المدفوع (جنيه)</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="250000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* المساحة */}
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المساحة (م²)</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* عدد الغرف */}
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الغرف</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="repaymentYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سنوات السداد</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder="مثال: 10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* عدد دورات المياه */}
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد دورات المياه</FormLabel>
                        <FormControl>
                            <NumberInput placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* الموقع */}
                  {/* عنوان الوحدة */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الوحدة</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: شقة 120م في التجمع" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموقع</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: التجمع الخامس" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />        

                  {/* الحالة */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">متاحة</SelectItem>
                            <SelectItem value="sold">مباعة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* رابط الصورة */}
                  <FormField
                    control={form.control}
                    name="mainImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط الصورة الرئيسية (اختياري)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* الوصف */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="وصف الوحدة..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* 📄 Payment Plan PDF */}
                <FormField
                  control={form.control}
                  name="paymentPlanPdf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملف خطة السداد (PDF)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            field.onChange(file);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                  {/* مميز في الرئيسية */}
                  <FormField
                    control={form.control}
                    name="isFeaturedOnHomepage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 bg-secondary rounded-md">
                        <FormLabel>عرض في الصفحة الرئيسية</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* زر الحفظ */}
                  <Button type="submit" className="w-full bg-primary">
                    {editingUnit ? "تحديث" : "إضافة"}
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
                  <TableHead>العنوان</TableHead>
                  <TableHead>المشروع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المساحة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id} data-testid={`row-unit-${unit.id}`}>
                    <TableCell className="font-medium">
                      <div>
                        {unit.title}
                        {unit.isFeaturedOnHomepage && (
                          <Badge className="mr-2 bg-primary" variant="default">مميز</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{unit.project?.name || "-"}</TableCell>
                    <TableCell>{formatPrice(unit.price)}</TableCell>
                    <TableCell>{unit.area} م²</TableCell>
                    <TableCell>
                      {unit.status === "available" ? (
                        <Badge className="bg-green-500">متاح</Badge>
                      ) : (
                        <Badge variant="secondary">مباع</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(unit)}
                          data-testid={`button-edit-${unit.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(unit.id)}
                          data-testid={`button-delete-${unit.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {units.length === 0 && (
              <p className="text-center text-muted-foreground py-8">لا توجد وحدات</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
