import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

const settingsSchema = z.object({
  companyPhone: z.string().min(10, "رقم الهاتف غير صحيح"),
  whatsappNumber: z.string().min(10, "رقم الواتساب غير صحيح"),
  heroTitle: z.string().min(5, "العنوان مطلوب"),
  heroSubtitle: z.string().min(5, "النص الفرعي مطلوب"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyPhone: settings?.companyPhone || "+20 1234567890",
      whatsappNumber: settings?.whatsappNumber || "+20 1234567890",
      heroTitle: settings?.heroTitle || "اكتشف منزل أحلامك مع Mars Realestates",
      heroSubtitle: settings?.heroSubtitle || "نقدم لك أفضل العقارات والمشروعات السكنية في مصر",
    },
    values: settings ? {
      companyPhone: settings.companyPhone,
      whatsappNumber: settings.whatsappNumber,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الإعدادات بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث الإعدادات",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-primary">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات الموقع</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات التواصل</CardTitle>
            <CardDescription>
              رقم الهاتف والواتساب المعروض في الموقع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+20 1234567890" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الواتساب</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+20 1234567890" data-testid="input-whatsapp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">محتوى الصفحة الرئيسية</h3>
                  
                  <FormField
                    control={form.control}
                    name="heroTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان الرئيسي</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-hero-title" />
                        </FormControl>
                        <FormDescription>
                          العنوان الظاهر في قسم البطل (Hero Section)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroSubtitle"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>النص الفرعي</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[80px]" data-testid="input-hero-subtitle" />
                        </FormControl>
                        <FormDescription>
                          النص الفرعي الظاهر أسفل العنوان
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
