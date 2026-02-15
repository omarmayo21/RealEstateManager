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
import { apiRequest } from "@/lib/api";
import { useEffect } from "react";





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


const { unitCode } = useParams<{ unitCode: string }>();

const { data, isLoading } = useQuery<any>({
  queryKey: ["api", "units", unitCode],
  queryFn: async () => {
    if (!unitCode) return null;
    return await apiRequest("GET", `/api/units/code/${unitCode}`);
  },
  enabled: !!unitCode,
});

const { data: allUnits = [] } = useQuery<
  (Unit & {
    project?: Project;
    images?: UnitImage[];
  })[]
>({
  queryKey: ["/api/units"],
});


// 👈 خليه متغير واحد فقط
const unit = Array.isArray(data) ? data[0] : data;

const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [currentIndex, setCurrentIndex] = useState(0);
const [isFullscreen, setIsFullscreen] = useState(false);
const [touchStartX, setTouchStartX] = useState<number | null>(null);
const [touchEndX, setTouchEndX] = useState<number | null>(null);

// استخراج الصور بشكل آمن
// صور الوحدة أو صور المشروع كـ fallback
const images =
  unit?.images && unit.images.length > 0
    ? unit.images
    : (unit?.projectImages || []);

// جاليري الصور النهائي (المهم 🔥)
const galleryImages: string[] = [
  ...(unit?.mainImageUrl ? [unit.mainImageUrl] : []),
  ...images.map((img: any) => img.imageUrl),
];

// الصورة المعروضة الكبيرة
const [isHovered, setIsHovered] = useState(false);

useEffect(() => {
  if (!galleryImages.length || isHovered) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) =>
      prev >= galleryImages.length - 1 ? 0 : prev + 1
    );
  }, 4000);

  return () => clearInterval(interval);
}, [galleryImages, isHovered]);


// الصورة الحالية
const displayImage =
  selectedImage ||
  galleryImages[currentIndex] ||
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800";





  const similarUnits = allUnits
    .filter((u) => u.id !== unit?.id && u.projectId === unit?.projectId)

    .slice(0, 3);


  // اسم الملف اللي هينزل
  const paymentPlanFileName = unit
    ? `payment-plan-${unitCode}.pdf`
    : "payment-plan.pdf";

  const pdfDownloadUrl =
    unit?.paymentPlanPdf
      ? `${unit.paymentPlanPdf}?download=${encodeURIComponent(paymentPlanFileName)}`
      : null;

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
              <div
                className="relative mb-6 group select-none"
                onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  setTouchEndX(e.changedTouches[0].clientX);

                  if (!touchStartX) return;
                  const distance = touchStartX - e.changedTouches[0].clientX;

                  // Swipe Left
                  if (distance > 50) {
                    setCurrentIndex((prev) =>
                      prev >= galleryImages.length - 1 ? 0 : prev + 1
                    );
                    setSelectedImage(null);
                  }

                  // Swipe Right
                  if (distance < -50) {
                    setCurrentIndex((prev) =>
                      prev <= 0 ? galleryImages.length - 1 : prev - 1
                    );
                    setSelectedImage(null);
                  }
                }}
              >
                {/* الصورة الرئيسية */}
                <motion.img
                  key={displayImage}
                  src={displayImage}
                  alt={unit.title}
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-h-[75vh] object-cover rounded-2xl shadow-2xl bg-black/5"
                />

                {/* Overlay Gradient احترافي */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Counter */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur">
                    {currentIndex + 1} / {galleryImages.length}
                  </div>
                )}

                {/* زر السابق */}
                {galleryImages.length > 1 && (
                  <button
                    onClick={() => {
                      setCurrentIndex((prev) =>
                        prev <= 0 ? galleryImages.length - 1 : prev - 1
                      );
                      setSelectedImage(null);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg backdrop-blur rounded-full p-3 opacity-0 group-hover:opacity-100 transition"
                  >
                    ›
                  </button>
                )}

                {/* زر التالي */}
                {galleryImages.length > 1 && (
                  <button
                    onClick={() => {
                      setCurrentIndex((prev) =>
                        prev >= galleryImages.length - 1 ? 0 : prev + 1
                      );
                      setSelectedImage(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg backdrop-blur rounded-full p-3 opacity-0 group-hover:opacity-100 transition"
                  >
                    ‹
                  </button>
                )}

                {/* Dots Indicator */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setSelectedImage(null);
                        }}
                        className={`h-2.5 rounded-full transition-all ${
                          index === currentIndex
                            ? "w-6 bg-white"
                            : "w-2.5 bg-white/60 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                )}
                  </div>


                {/* {galleryImages.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {galleryImages.map((img, index) => {
                      // 👇 نتحكم بعدد الصور حسب حجم الشاشة
                      // موبايل: أول 3 صور فقط
                      if (typeof window !== "undefined") {
                        const isMobile = window.innerWidth < 640;
                        if (isMobile && index >= 3) return null;
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImage(img);
                            setCurrentIndex(index); // يخلي السلايدر متزامن
                          }}
                          className={`flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${
                            displayImage === img
                              ? "ring-2 ring-primary scale-105"
                              : "hover:opacity-80"
                          }`}
                        >

                        </button>
                      );
                    })}
                  </div>
                )} */}


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
                    <span className="font-semibold">
                      {formatMoney(unit.totalPaid)}
                    </span>
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

          {unit.paymentPlanPdf && pdfDownloadUrl && (
            <div className="mt-6 rounded-xl border border-orange-400 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                📄
                <span className="font-medium">
                  {paymentPlanFileName}
                </span>
              </div>

              <a
                href={pdfDownloadUrl}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                تحميل
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
              <LeadForm unitId={unit.unitCode} projectId={unit.projectId} title="استفسر عن هذه الوحدة" />
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
                 <UnitCard key={similarUnit.unitCode} unit={similarUnit} index={index} />
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
