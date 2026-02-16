import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Settings, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = location === "/";

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["api", "projects"]

  });

  const { data: settings } = useQuery<{ companyPhone: string }>({
    queryKey: ["/api/settings"],
    enabled: false, 
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarBg = isHomePage && !isScrolled
    ? "bg-transparent"
    : "bg-black/70 backdrop-blur-md border-b border-white/10";

  const textColor = isHomePage && !isScrolled
    ? "text-white"
    : "text-white";

  // 🧠 Helper: تقسيم Parent / Children
  const getParentProjects = (list: Project[]) =>
    list.filter((p) => !p.parentProjectId);

  const getChildProjects = (parentId: number, list: Project[]) =>
    list.filter((p) => p.parentProjectId === parentId);

  // القوائم الأصلية (كما هي حسب الفلاج)
  const resaleProjectsRaw = projects.filter((p) => p.appearsInResaleProjects);
  const newProjectsRaw = projects.filter((p) => p.appearsInProjects);
  const alexandriaProjectsRaw = projects.filter((p) => p.appearsInAlexandriaProjects);
  const alexandriaResaleRaw = projects.filter((p) => p.appearsInAlexandriaResale);

  // ✨ المشاريع الرئيسية فقط لكل قائمة
  const resaleProjects = getParentProjects(resaleProjectsRaw);
  const newProjects = getParentProjects(newProjectsRaw);
  const alexandriaProjects = getParentProjects(alexandriaProjectsRaw);
  const alexandriaResale = getParentProjects(alexandriaResaleRaw);


  // 🔥 Mega Menu احترافي (Parent + Children)
  // 🔥 Nested Dropdown احترافي (Vertical + Sub Projects)
    const NestedMenu = ({
      title,
      parentItems,
      rawList,
    }: {
      title: string;
      parentItems: Project[];
      rawList: Project[];
    }) => {
      const [open, setOpen] = useState(false);
      const [activeParent, setActiveParent] = useState<number | null>(null);

      return (
        <div className="relative">
          {/* زر القائمة */}
          <button
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={`${textColor} hover:text-primary transition-colors flex items-center gap-1 px-3 py-2 text-base font-medium`}
          >
            {title}
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* القائمة */}
          <AnimatePresence>
            {open && parentItems.length > 0 && (
              <motion.div
                  onMouseEnter={() => setOpen(true)}
                  onMouseLeave={() => {
                    setOpen(false);
                    setActiveParent(null);
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999]"
                >
                  <div className="py-2">
                  {parentItems.map((parent) => {
                    const children = rawList.filter(
                      (p) => p.parentProjectId === parent.id
                    );
                    const hasChildren = children.length > 0;

                    return (
                      <div key={parent.id} className="border-b bg-white hover:bg-gray-50 last:border-b-0">
                        {/* المشروع الرئيسي */}
                        <div
                          className="
                            flex items-center justify-between 
                            px-4 py-3 
                            hover:bg-gray-50 
                            cursor-pointer 
                            transition-all 
                            duration-200 
                            ease-out
                            active:scale-[0.98]
                          "
                          onClick={() => {
                            if (hasChildren) {
                              setActiveParent(
                                activeParent === parent.id ? null : parent.id
                              );
                            } else {
                              window.location.href = `/projects/${parent.slug}`;
                            }
                          }}
                        >
                          <span className="font-semibold text-gray-900 tracking-wide">
                            {parent.name}
                          </span>

                          {hasChildren && (
                          <ChevronDown
                            className={`w-4 h-4 text-primary transition-all duration-300 ease-out ${
                              activeParent === parent.id ? "rotate-180 scale-110" : "rotate-0"
                            }`}
                          />
                          )}
                        </div>

                        {/* المشاريع الفرعية - Smooth Accordion */}
                        <AnimatePresence initial={false}>
                          {hasChildren && activeParent === parent.id && (
                            <motion.div
                              key="submenu"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: { duration: 0.35, ease: "easeInOut" },
                                opacity: { duration: 0.25 }
                              }}
                              style={{ overflow: "hidden" }}
                              className="bg-gradient-to-b from-gray-50 to-white"
                            >
                              <div className="py-1">
                                {children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/projects/${child.slug}`}
                                  >
                                    <div className="
                                      px-6 py-2.5 
                                      text-sm 
                                      text-gray-600 
                                      hover:text-primary 
                                      hover:bg-primary/5 
                                      transition-all 
                                      duration-200 
                                      cursor-pointer
                                      border-r-2 
                                      border-transparent 
                                      hover:border-primary
                                    ">
                                      {child.name}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBg}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className={`text-2xl font-bold ${textColor}`}>
                <span className="text-primary">Mars</span> Realestates
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <NestedMenu
              title="ريسيل مشروعات"
              parentItems={resaleProjects}
              rawList={resaleProjectsRaw}
            />

            <NestedMenu
              title="مشروعات"
              parentItems={newProjects}
              rawList={newProjectsRaw}
            />

            <NestedMenu
              title="مشروعات الإسكندرية"
              parentItems={alexandriaProjects}
              rawList={alexandriaProjectsRaw}
            />

            <NestedMenu
              title="ريسيل الإسكندرية"
              parentItems={alexandriaResale}
              rawList={alexandriaResaleRaw}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* زر المينيو للموبايل */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* رقم الهاتف (يظهر فقط من sm وفوق) */}
            <a
              href={`tel:${settings?.companyPhone || '+20 1234567890'}`}
              className={`${textColor} hover:text-primary transition-colors hidden sm:block text-sm font-medium`}
            >
              {settings?.companyPhone || '+20 1234567890'}
            </a>

            {/* 🔥 إخفاء زر الأدمن في الموبايل */}
            <Link href="/admin/login">
              <Button
                size="icon"
                variant="ghost"
                className={`${textColor} hover:text-primary hover:bg-white/10 hidden md:flex`}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

            {/* 📱 Mobile Menu */}
          {/* 📱 Mobile Menu - Nested Professional */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-6 max-h-[80vh] overflow-y-auto">

              {/* 🔥 Helper Renderer */}
              {[
                {
                  title: "ريسيل مشروعات",
                  parents: resaleProjects,
                  raw: resaleProjectsRaw,
                },
                {
                  title: "مشروعات",
                  parents: newProjects,
                  raw: newProjectsRaw,
                },
                {
                  title: "مشروعات الإسكندرية",
                  parents: alexandriaProjects,
                  raw: alexandriaProjectsRaw,
                },
                {
                  title: "ريسيل الإسكندرية",
                  parents: alexandriaResale,
                  raw: alexandriaResaleRaw,
                },
              ].map((section) => (
                <div key={section.title}>
                  {/* عنوان القسم */}
                  <p className="text-white font-bold mb-3 text-base">
                    {section.title}
                  </p>

                  {section.parents.length === 0 && (
                    <div className="text-gray-400 text-sm py-2">
                      لا توجد مشروعات
                    </div>
                  )}

                  {section.parents.map((parent) => {
                    const children = section.raw.filter(
                      (c) => c.parentProjectId === parent.id
                    );
                    const hasChildren = children.length > 0;

                    return (
                      <div
                        key={parent.id}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        {/* المشروع الرئيسي */}
                        <div
                          className="flex items-center justify-between py-3 text-white font-semibold cursor-pointer"
                          onClick={() => {
                            if (!hasChildren) {
                              setMobileMenuOpen(false);
                              window.location.href = `/projects/${parent.slug}`;
                            } else {
                              const el = document.getElementById(
                                `mobile-${section.title}-${parent.id}`
                              );
                              if (el) {
                                el.classList.toggle("hidden");
                              }
                            }
                          }}
                        >
                          {parent.name}

                          {hasChildren && (
                            <span className="text-xs text-gray-400">
                              ▼
                            </span>
                          )}
                        </div>

                        {/* المشاريع الفرعية */}
                        {hasChildren && (
                          <div
                            id={`mobile-${section.title}-${parent.id}`}
                            className="hidden pb-3"
                          >
                            {children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/projects/${child.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div className="text-gray-300 py-2 text-sm pl-4 hover:text-primary transition">
                                  {child.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
