import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnitCard from "@/components/UnitCard";
import FilterBar from "@/components/FilterBar";
import LeadForm from "@/components/LeadForm";
import { useQuery } from "@tanstack/react-query";
import type { Project, Unit, UnitFilters } from "@shared/schema";





export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<UnitFilters>({});

  const { data: projects = [] } = useQuery<Project[]>({
   queryKey: ["api", "projects"]

  });

  const project = projects.find((p) => p.slug === slug);

  const { data: allUnits = [] } = useQuery<(Unit & { project?: Project })[]>({
    queryKey: ["/api/units"],
    enabled: !!project,
  });

  const projectUnits = allUnits.filter((unit) => unit.projectId === project?.id);


  // 🔥 Project Images (Centralized Gallery - حسب الدوكمنيشن)
  const { data: projectImages = [] } = useQuery<{ imageUrl: string }[]>({
    queryKey: ["api", "project-images", project?.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${project?.id}/images`);
      if (!res.ok) throw new Error("Failed to fetch project images");
      return res.json();
    },
    enabled: !!project?.id, // مهم عشان مايضربش قبل تحميل المشروع
  });

  // نحول الصور لمصفوفة روابط
  const galleryImages = projectImages.map((img) => img.imageUrl);


  // 🎬 Slider State (لازم قبل أي useEffect)
  const [currentSlide, setCurrentSlide] = useState(0);
  const imagesCount = galleryImages.length;

  // 🔥 حماية: لو السلايد خرج برا عدد الصور (زي -400%)
  useEffect(() => {
    if (currentSlide >= imagesCount && imagesCount > 0) {
      setCurrentSlide(0);
    }
  }, [currentSlide, imagesCount]);

  // 🔥 Auto Play مستقر ومتوافق مع React Query
  useEffect(() => {
    if (imagesCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % imagesCount);
    }, 4000);

    return () => clearInterval(interval);
  }, [imagesCount]);


  const filteredUnits = projectUnits.filter((unit) => {
    if (filters.minArea && unit.area < filters.minArea) return false;
    if (filters.maxArea && unit.area > filters.maxArea) return false;
    if (filters.bedrooms && unit.bedrooms < filters.bedrooms) return false;
    return true;
  });

  const amenitiesList = project?.amenities
    ? project.amenities.split("\n").filter((a) => a.trim())
    : [];

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-muted-foreground">المشروع غير موجود</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >

          {/* 🔥 Auto Play Project Images Slider (Centralized Gallery) */}
          {galleryImages.length > 0 && (
            <div className="w-full max-w-6xl mx-auto mb-10">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                
                {/* Slides Container */}
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                      transform: `translateX(-${currentSlide * (100 / (imagesCount || 1))}%)`,
                      width: `${imagesCount * 100}%`,
                    }}
                  >
                  {galleryImages.map((img, index) => (
                    <div
                      key={index}
                      className="w-full flex-shrink-0"
                      style={{ width: `${100 / (imagesCount || 1)}%` }}
                    >
                    <img
                      src={
                        img.includes("cloudinary")
                          ? img.replace(
                              "/upload/",
                              "/upload/f_auto,q_auto,w_1600/"
                            )
                          : img
                      }
                      alt={`project-image-${index}`}
                      className="w-full h-[420px] md:h-[520px] object-cover"
                      loading="lazy"
                      data-testid={`img-project-slider-${index}`}
                    />
                    </div>
                  ))}
                </div>

                {/* Dots Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        currentSlide === index
                          ? "bg-white scale-110"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Left Arrow */}
                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === 0 ? galleryImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
                >
                  ‹
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === galleryImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
                >
                  ›
                </button>
              </div>
            </div>
          )}


            
            <h1 className="text-5xl font-bold mb-4 text-primary" data-testid="text-project-name">
              {project.name}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground mb-6">
              <MapPin className="w-5 h-5" />
              <span data-testid="text-project-city">{project.city}</span>
            </div>
            {project.shortDescription && (
              <p className="text-lg text-card-foreground max-w-3xl mx-auto" data-testid="text-project-description">
                {project.shortDescription}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {amenitiesList.length > 0 && (
        <section className="py-12 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-primary">المرافق والخدمات</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenitiesList.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-background rounded-lg"
                    data-testid={`amenity-${index}`}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-card-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-primary">الوحدات المتاحة</h2>
                
                <FilterBar
                  projects={[project]}
                  onFilter={setFilters}
                  onReset={() => setFilters({})}
                  initialProjectId={project.id}
                  resultsCount={filteredUnits.length}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUnits.map((unit, index) => (
                    <UnitCard key={unit.unitCode} unit={unit} index={index} />
                  ))}
                </div>

                {filteredUnits.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">لا توجد وحدات متاحة</p>
                  </div>
                )}
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="sticky top-24"
              >
                <LeadForm projectId={project.id} title="استفسر عن المشروع" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
