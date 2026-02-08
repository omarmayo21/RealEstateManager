import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Home as HomeIcon, MapPin, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnitCard from "@/components/UnitCard";
import FilterBar from "@/components/FilterBar";
import LeadForm from "@/components/LeadForm";
import { useQuery } from "@tanstack/react-query";
import type { Unit, Project, Settings, UnitFilters } from "@shared/schema";
import heroImage from "@assets/generated_images/luxury_real_estate_hero_background.png";
import teamImage from "@assets/generated_images/mars_realestates_team_photo.png";

export default function Home() {
  const [filters, setFilters] = useState<UnitFilters>({});

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
   queryKey: ["api", "projects"]

  });

  const { data: allUnits = [] } = useQuery<(Unit & { project?: Project })[]>({
    queryKey: ["/api/units"],
  });

  const featuredUnits = allUnits.filter((unit) => unit.isFeaturedOnHomepage);

  const filteredUnits = featuredUnits.filter((unit) => {
    if (filters.projectId && unit.projectId !== filters.projectId) return false;
    if (filters.minArea && unit.area < filters.minArea) return false;
    if (filters.maxArea && unit.area > filters.maxArea) return false;
    if (filters.bedrooms && unit.bedrooms < filters.bedrooms) return false;
    return true;
  });

  const handleFilter = (newFilters: UnitFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const categories = [
    {
      icon: TrendingUp,
      title: "ريسيل مشروعات",
      description: "مشروعات إعادة بيع بأفضل الأسعار",
      color: "text-primary",
    },
    {
      icon: Building2,
      title: "مشروعات جديدة",
      description: "أحدث المشروعات السكنية",
      color: "text-primary",
    },
    {
      icon: MapPin,
      title: "مشروعات الإسكندرية",
      description: "عقارات فاخرة في الإسكندرية",
      color: "text-primary",
    },
    {
      icon: HomeIcon,
      title: "ريسيل الإسكندرية",
      description: "فرص استثمارية مميزة",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" data-testid="text-hero-title">
              {settings?.heroTitle || "اكتشف منزل أحلامك مع Mars Realestates"}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8" data-testid="text-hero-subtitle">
              {settings?.heroSubtitle || "نقدم لك أفضل العقارات والمشروعات السكنية في مصر"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-request-offer"
              >
                اطلب عرض الآن
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                onClick={() => document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-browse-projects"
              >
                تصفح المشروعات
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="featured" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-primary" data-testid="text-featured-title">
              أبرز الشقق المتاحة
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              اختر من بين أفضل العقارات المتاحة في مواقع مميزة
            </p>

            <FilterBar
              projects={projects}
              onFilter={handleFilter}
              onReset={handleResetFilters}
              resultsCount={filteredUnits.length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUnits.map((unit, index) => (
                <UnitCard key={unit.id} unit={unit} index={index} />
              ))}
            </div>

            {filteredUnits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">لا توجد نتائج مطابقة للفلتر المحدد</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-primary">من نحن</h2>
              <p className="text-lg text-card-foreground mb-4 leading-relaxed">
                Mars Realestates هي شركة رائدة في مجال الوساطة العقارية في مصر. نقدم لعملائنا أفضل
                المشروعات السكنية والتجارية في القاهرة والإسكندرية.
              </p>
              <p className="text-lg text-card-foreground leading-relaxed">
                مع فريق من الخبراء المتخصصين، نساعدك في العثور على العقار المثالي الذي يناسب
                احتياجاتك وميزانيتك. نحن ملتزمون بتقديم خدمة متميزة ومصداقية عالية.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={teamImage}
                alt="Mars Realestates Team"
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-center mb-12 text-primary">
              اختر ما يناسبك
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <category.icon className={`w-8 h-8 ${category.color}`} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-center mb-4 text-primary">
              تواصل معنا
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              املأ النموذج وسنتواصل معك في أقرب وقت
            </p>
            <LeadForm title="اطلب عرض الآن" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
