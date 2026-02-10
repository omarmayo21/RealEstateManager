import { Phone, Mail } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiInstagram } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import type { Settings } from "@shared/schema";

export default function Footer() {
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    enabled: false, 
  });

  return (
    <footer className="bg-black/90 text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-primary">Mars</span> Realestates
            </h3>
            <p className="text-gray-400 text-sm">
              شريكك الموثوق في عالم العقارات. نقدم لك أفضل المشروعات السكنية والتجارية في مصر.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">تواصل معنا</h4>
            <div className="space-y-3">
              <a
                href={`tel:${settings?.companyPhone || '+20 1234567890'}`}
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{settings?.companyPhone || '+20 1234567890'}</span>
              </a>
              <a
                href={`https://wa.me/${settings?.whatsappNumber?.replace(/\D/g, '') || '201234567890'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4" />
                <span className="text-sm">واتساب</span>
              </a>
              <a
                href="mailto:info@marsrealestates.com"
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
                data-testid="link-email"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@marsrealestates.com</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">تابعنا</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors hover-elevate p-2 rounded-md"
                data-testid="link-facebook"
              >
                <SiFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition-colors hover-elevate p-2 rounded-md"
                data-testid="link-instagram"
              >
                <SiInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>© 2024 Mars Realestates. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
