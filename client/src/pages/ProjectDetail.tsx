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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
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

        {/* 🔥 Professional Project Images Slider (Mobile Swipe + Responsive) */}
        {galleryImages.length > 0 && (
          <div className="w-full max-w-6xl mx-auto mb-10">
            <div
              className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl w-full select-none bg-black"
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return;

                const distance = touchStartX - e.changedTouches[0].clientX;

                // Swipe Left (الصورة اللي بعدها)
                if (distance > 50) {
                  setCurrentSlide((prev) =>
                    galleryImages.length === 0
                      ? 0
                      : (prev + 1) % galleryImages.length
                  );
                }

                // Swipe Right (الصورة اللي قبلها)
                if (distance < -50) {
                  setCurrentSlide((prev) =>
                    prev === 0
                      ? galleryImages.length - 1
                      : prev - 1
                  );
                }
              }}
            >
              {/* Slides Container */}
                <div
                  className="flex transition-transform duration-700 ease-in-out will-change-transform"
                  style={{
                    width: `${galleryImages.length * 100}%`,
                    transform: `translateX(-${100 / galleryImages.length * currentSlide}%)`,
                  }}
                >
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    className="min-w-full flex-shrink-0 overflow-hidden"
                  >
                  <div className="w-full aspect-[16/9] bg-black">
                    <img
                      src={img}
                      alt={`project-image-${index}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                  </div>
                ))}
              </div>

              {/* Gradient Overlay (زي سلايدر الوحدات) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

              {/* Counter */}
              {galleryImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur">
                  {currentSlide + 1} / {galleryImages.length}
                </div>
              )}

            {/* Prev Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={() =>
                  setCurrentSlide((prev) =>
                    prev === 0 ? galleryImages.length - 1 : prev - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg backdrop-blur rounded-full p-3 opacity-0 md:opacity-100 md:hover:scale-105 transition"
              >
                ‹
              </button>
            )}

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={() =>
                  setCurrentSlide((prev) =>
                    (prev + 1) % galleryImages.length
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg backdrop-blur rounded-full p-3 opacity-0 md:opacity-100 md:hover:scale-105 transition"
              >
                ›
              </button>
            )}

            {/* Dots Indicators */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === index
                        ? "w-6 bg-white"
                        : "w-2.5 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
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
