import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location === "/";

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["api", "projects"]

  });

  const { data: settings } = useQuery<{ companyPhone: string }>({
    queryKey: ["/api/settings"],
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

  const resaleProjects = projects.filter((p) => p.appearsInResaleProjects);
  const newProjects = projects.filter((p) => p.appearsInProjects);
  const alexandriaProjects = projects.filter((p) => p.appearsInAlexandriaProjects);
  const alexandriaResale = projects.filter((p) => p.appearsInAlexandriaResale);

  const NavDropdown = ({ title, items }: { title: string; items: Project[] }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${textColor} hover:text-primary transition-colors flex items-center gap-1 px-3 py-2 text-base font-medium hover-elevate rounded-md`}
          data-testid={`dropdown-${title}`}
        >
          {title}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {items.length === 0 ? (
          <DropdownMenuItem disabled>لا توجد مشروعات</DropdownMenuItem>
        ) : (
          items.map((project) => (
            <DropdownMenuItem key={project.id} asChild>
              <Link href={`/projects/${project.slug}`} data-testid={`link-project-${project.slug}`}>
                <span className="w-full">{project.name}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

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

          <div className="hidden md:flex items-center gap-1">
            <NavDropdown title="ريسيل مشروعات" items={resaleProjects} />
            <NavDropdown title="مشروعات" items={newProjects} />
            <NavDropdown title="مشروعات الإسكندرية" items={alexandriaProjects} />
            <NavDropdown title="ريسيل الإسكندرية" items={alexandriaResale} />
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings?.companyPhone || '+20 1234567890'}`}
              className={`${textColor} hover:text-primary transition-colors hidden sm:block text-sm font-medium`}
              data-testid="text-phone"
            >
              {settings?.companyPhone || '+20 1234567890'}
            </a>
            <Link href="/admin/login">
              <Button
                size="icon"
                variant="ghost"
                className={`${textColor} hover:text-primary hover:bg-white/10`}
                data-testid="button-admin"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
