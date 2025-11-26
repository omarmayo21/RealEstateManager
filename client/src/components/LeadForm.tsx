import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertLead } from "@shared/schema";

const leadSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  projectId?: number;
  unitId?: number;
  title?: string;
}

export default function LeadForm({ projectId, unitId, title }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const leadData: InsertLead = {
        ...data,
        projectId: projectId || null,
        unitId: unitId || null,
        email: data.email || null,
        message: data.message || null,
      };
      return await apiRequest("POST", "/api/leads", leadData);
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال طلبك بنجاح",
        description: "سنتواصل معك قريباً",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إرسال طلبك. حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    createLeadMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-primary">
          {title || "اطلب عرض الآن"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسمك الكامل" {...field} data-testid="input-fullname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 01234567890" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      {...field}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رسالة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[100px]"
                      {...field}
                      data-testid="input-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={createLeadMutation.isPending}
              data-testid="button-submit-lead"
            >
              {createLeadMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
