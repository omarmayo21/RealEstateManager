import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize, Bed, Bath } from "lucide-react";
import type { Unit, Project } from "@shared/schema";

interface UnitCardProps {
  unit: Unit & { project?: Project };
  index?: number;
}

export default function UnitCard({ unit, index = 0 }: UnitCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full" data-testid={`card-unit-${unit.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={unit.mainImageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600"}
            alt={unit.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            data-testid={`img-unit-${unit.id}`}
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {unit.status === 'available' ? (
              <Badge className="bg-green-500 text-white" data-testid={`badge-status-${unit.id}`}>
                متاح
              </Badge>
            ) : (
              <Badge variant="secondary" data-testid={`badge-status-${unit.id}`}>
                مباع
              </Badge>
            )}
            {unit.type === 'primary' && (
              <Badge className="bg-primary text-white" data-testid={`badge-type-${unit.id}`}>
                جديد
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-card-foreground" data-testid={`text-title-${unit.id}`}>
              {unit.title}
            </h3>
            {unit.project && (
              <p className="text-sm text-muted-foreground" data-testid={`text-project-${unit.id}`}>
                {unit.project.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-primary">
            <MapPin className="w-4 h-4" />
            <span className="text-sm" data-testid={`text-location-${unit.id}`}>{unit.location}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span data-testid={`text-area-${unit.id}`}>{unit.area} م²</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span data-testid={`text-bedrooms-${unit.id}`}>{unit.bedrooms} غرف</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span data-testid={`text-bathrooms-${unit.id}`}>{unit.bathrooms}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">السعر</p>
                <p className="text-2xl font-bold text-primary" data-testid={`text-price-${unit.id}`}>
                  {formatPrice(unit.price)}
                </p>
              </div>
              <Link href={`/units/${unit.id}`}>
                <Button className="bg-primary hover:bg-primary/90" data-testid={`button-details-${unit.id}`}>
                  تفاصيل أكثر
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
