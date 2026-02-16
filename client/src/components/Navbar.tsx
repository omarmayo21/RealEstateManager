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
  const MegaMenu = ({
    title,
    parentItems,
    rawList,
  }: {
    title: string;
    parentItems: Project[];
    rawList: Project[];
  }) => {
    const [open, setOpen] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* زر القائمة */}
        <button
          className={`${textColor} hover:text-primary transition-colors flex items-center gap-1 px-3 py-2 text-base font-medium`}
        >
          {title}
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Mega Menu Panel */}
        <AnimatePresence>
          {open && parentItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-3 w-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50"
            >
              <div className="grid grid-cols-2 gap-8">
                {parentItems.map((parent) => {
                  const children = rawList.filter(
                    (p) => p.parentProjectId === parent.id
                  );

                  return (
                    <div key={parent.id} className="space-y-3">
                      {/* المشروع الرئيسي */}
                      <Link href={`/projects/${parent.slug}`}>
                        <div className="text-lg font-bold text-gray-900 hover:text-primary transition cursor-pointer">
                          {parent.name}
                        </div>
                      </Link>

                      {/* المشاريع الفرعية */}
                      {children.length > 0 && (
                        <div className="space-y-2 border-r pr-4">
                          {children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/projects/${child.slug}`}
                            >
                              <div className="text-sm text-gray-500 hover:text-primary transition cursor-pointer">
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
            <MegaMenu
              title="ريسيل مشروعات"
              parentItems={resaleProjects}
              rawList={resaleProjectsRaw}
            />

            <MegaMenu
              title="مشروعات"
              parentItems={newProjects}
              rawList={newProjectsRaw}
            />

            <MegaMenu
              title="مشروعات الإسكندرية"
              parentItems={alexandriaProjects}
              rawList={alexandriaProjectsRaw}
            />

            <MegaMenu
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-4">

              {/* ريسيل مشروعات */}
              <div>
                <p className="text-white font-semibold mb-2">ريسيل مشروعات</p>
                {resaleProjects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.slug}`}>
                    <div className="text-gray-300 py-2 border-b border-white/10">
                      {p.name}
                    </div>
                  </Link>
                ))}
              </div>

              {/* مشروعات */}
              <div>
                <p className="text-white font-semibold mb-2">مشروعات</p>
                {newProjects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.slug}`}>
                    <div className="text-gray-300 py-2 border-b border-white/10">
                      {p.name}
                    </div>
                  </Link>
                ))}
              </div>

              {/* مشروعات اسكندرية */}
              <div>
                <p className="text-white font-semibold mb-2">مشروعات الإسكندرية</p>
                {alexandriaProjects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.slug}`}>
                    <div className="text-gray-300 py-2 border-b border-white/10">
                      {p.name}
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
