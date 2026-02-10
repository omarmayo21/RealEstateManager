import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Maximize, Bed, Bath, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnitCard from "@/components/UnitCard";
import LeadForm from "@/components/LeadForm";
import { useQuery } from "@tanstack/react-query";
import type { Unit, Project, UnitImage } from "@shared/schema";
import {
  Hash,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wrench,
  Calculator,
  Wallet,
  Calendar,
} from "lucide-react";



const parseNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatMoney = (value: unknown) => {
  const num = parseNumber(value);
  if (num === null) return "—";
  return `${num.toLocaleString()} ج.م`;
};



export default function UnitDetail() {
  const { id } = useParams<{ id: string }>();
  const unitId = parseInt(id || "0");
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: allUnits = [] } = useQuery<
    (Unit & {
      project?: Project;
      images?: UnitImage[];
      paymentPlanPdf?: string | null;
    })[]
  >({
    queryKey: ["/api/units"],
  });


  const unit = allUnits.find((u) => u.id === unitId);
  const paymentPlanFileName = (() => {
    if (typeof unit?.paymentPlanPdf !== "string") return "خطة السداد";

    const raw = unit.paymentPlanPdf.split("/").pop();
    if (!raw) return "خطة السداد";

    const decoded = decodeURIComponent(raw);
    return decoded.replace(/\.pdf$/i, "");
  })();


  const images = unit?.images || [];
  const displayImage = selectedImage || unit?.mainImageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800";

  const similarUnits = allUnits
    .filter((u) => u.id !== unitId && u.projectId === unit?.projectId)
    .slice(0, 3);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!unit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-muted-foreground">الوحدة غير موجودة</h1>
        </div>
        <Footer />
      </div>
    );
  }


  const totalPaidValue = parseNumber(unit.totalPaid);
  const overPriceValue = parseNumber(unit.overPrice);
  const totalWithOver = (totalPaidValue ?? 0) + (overPriceValue ?? 0);
  const hasTotalWithOver = totalPaidValue !== null || overPriceValue !== null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/">
              <span className="hover:text-primary cursor-pointer" data-testid="link-home-breadcrumb">الرئيسية</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            {unit.project && (
              <>
                <Link href={`/projects/${unit.project.slug}`}>
                  <span className="hover:text-primary cursor-pointer" data-testid="link-project-breadcrumb">
                    {unit.project.name}
                  </span>
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-foreground" data-testid="text-unit-breadcrumb">{unit.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <img
                    src={displayImage}
                    alt={unit.title}
                    className="w-full h-[500px] object-cover rounded-2xl shadow-xl"
                    data-testid="img-main-unit"
                  />
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {[unit.mainImageUrl, ...images.map((img) => img.imageUrl)]
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img!)}
                          className={`rounded-lg overflow-hidden hover:opacity-80 transition-opacity ${
                            displayImage === img ? "ring-2 ring-primary" : ""
                          }`}
                          data-testid={`button-thumbnail-${index}`}
                        >
                          <img
                            src={img!}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        </button>
                      ))}
                  </div>
                )}

              </motion.div>
            </div>


                  



            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="sticky top-24 space-y-6"
              >
                <div>
                  <h1 className="text-4xl font-bold mb-2" data-testid="text-unit-title">
                    {unit.title}
                  </h1>
                  {unit.project && (
                    <Link href={`/projects/${unit.project.slug}`}>
                      <p className="text-lg text-muted-foreground hover:text-primary cursor-pointer" data-testid="text-project-link">
                        {unit.project.name}
                      </p>
                    </Link>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {unit.status === 'available' ? (
                    <Badge className="bg-green-500 text-white" data-testid="badge-available">
                      متاح
                    </Badge>
                  ) : (
                    <Badge variant="secondary" data-testid="badge-sold">
                      مباع
                    </Badge>
                  )}
                  {unit.type === 'primary' && (
                    <Badge className="bg-primary text-white" data-testid="badge-primary">
                      جديد
                    </Badge>
                  )}
                  {unit.type === 'resale' && (
                    <Badge variant="outline" data-testid="badge-resale">
                      إعادة بيع
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">السعر</p>
                  <p className="text-4xl font-bold text-primary" data-testid="text-price">
                    {formatPrice(unit.price)}
                  </p>
                </div>

                <Card>
                <CardContent className="p-6 space-y-4">

                  {/* كود الوحدة */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">كود الوحدة</span>
                    </div>
                    <span className="font-semibold">{unit.unitCode || "-"}</span>
                  </div>

                  {/* نوع العقار */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">نوع العقار</span>
                    </div>
                    <span className="font-semibold">{unit.propertyType || "غير محدد"}</span>
                  </div>

                  {/* السعر */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">السعر</span>
                    </div>
                    <span className="font-semibold">
                      {unit.price?.toLocaleString()} ج.م
                    </span>
                  </div>

                  {/* الأوفر برايس */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">الأوفر برايس</span>
                    </div>
                    <span className="font-semibold">
                      {formatMoney(unit.overPrice)}</span>
                  </div>
                  {/* إجمالي المدفوع من الوحدة */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">إجمالي المدفوع من الوحدة</span>
                    </div>
                      {formatMoney(unit.totalPaid)}
                  </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">سنوات السداد</span>
                  </div>
                  <span className="font-semibold">
                    {unit.repaymentYears ? `${unit.repaymentYears} سنوات` : "-"}
                  </span>
                </div>

                  {/* قيمة القسط */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">قيمة القسط</span>
                    </div>

                    <span className="font-semibold">
                      {typeof unit.installmentValue === "number"
                        ? unit.installmentValue.toLocaleString() + " ج.م"
                        : "—"}
                    </span>
                  </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">المساحة</span>
                  </div>
                  <span className="font-semibold">
                    {unit.area ? `${unit.area} م²` : "-"}
                  </span>
                </div>



                  {/* وديعة الصيانة */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">وديعة الصيانة</span>
                    </div>
                    <span className="font-semibold">
                      {typeof unit.maintenanceDeposit === "number"
                        ? unit.maintenanceDeposit.toLocaleString() + " ج.م"
                        : "—"}
                    </span>
                  </div>




                  {/* إجمالي السعر + الأوفر */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">الإجمالي</span>
                    </div>
                    <span className="font-bold text-primary">
                      {hasTotalWithOver ? `${totalWithOver.toLocaleString()} ج.م` : "—"}
                    </span>

                  </div>

                </CardContent>

                </Card>
              </motion.div>
            </div>
          </div>

          {unit.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4 text-primary">الوصف</h2>
                  <p className="text-card-foreground leading-relaxed whitespace-pre-line" data-testid="text-description">
                    {unit.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

                    
          {unit.paymentPlanPdf && (
            <div className="mb-12 rounded-xl border-2 border-primary/60 p-4 flex items-center justify-between gap-4">
              
              {/* اسم الملف */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">📄</span>
                <span className="truncate text-sm font-medium text-foreground">
                  {paymentPlanFileName || "Payment Plan"}
                </span>
              </div>

              {/* زر التحميل */}
              <a
                href={unit.paymentPlanPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                ⬇ تحميل
              </a>

            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="max-w-2xl mx-auto">
              <LeadForm unitId={unit.id} projectId={unit.projectId} title="استفسر عن هذه الوحدة" />
            </div>
          </motion.div>

          {similarUnits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-primary">وحدات مشابهة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarUnits.map((similarUnit, index) => (
                  <UnitCard key={similarUnit.id} unit={similarUnit} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
