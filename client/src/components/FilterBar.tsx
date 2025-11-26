import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { Project, UnitFilters } from "@shared/schema";

interface FilterBarProps {
  projects?: Project[];
  onFilter: (filters: UnitFilters) => void;
  onReset: () => void;
  initialProjectId?: number;
  resultsCount?: number;
}

export default function FilterBar({
  projects = [],
  onFilter,
  onReset,
  initialProjectId,
  resultsCount,
}: FilterBarProps) {
  const [filters, setFilters] = useState<UnitFilters>({
    projectId: initialProjectId,
    minArea: undefined,
    maxArea: undefined,
    bedrooms: undefined,
  });

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      projectId: initialProjectId,
      minArea: undefined,
      maxArea: undefined,
      bedrooms: undefined,
    });
    onReset();
  };

  return (
    <Card className="p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-select">المشروع</Label>
          <Select
            value={filters.projectId?.toString() || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, projectId: value === "all" ? undefined : parseInt(value) })
            }
            disabled={!!initialProjectId}
          >
            <SelectTrigger id="project-select" data-testid="select-project">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min-area">أقل مساحة (م²)</Label>
          <Input
            id="min-area"
            type="number"
            placeholder="مثال: 100"
            value={filters.minArea || ""}
            onChange={(e) =>
              setFilters({ ...filters, minArea: e.target.value ? parseInt(e.target.value) : undefined })
            }
            data-testid="input-min-area"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-area">أكبر مساحة (م²)</Label>
          <Input
            id="max-area"
            type="number"
            placeholder="مثال: 200"
            value={filters.maxArea || ""}
            onChange={(e) =>
              setFilters({ ...filters, maxArea: e.target.value ? parseInt(e.target.value) : undefined })
            }
            data-testid="input-max-area"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms-select">عدد الغرف</Label>
          <Select
            value={filters.bedrooms?.toString() || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, bedrooms: value === "all" ? undefined : parseInt(value) })
            }
          >
            <SelectTrigger id="bedrooms-select" data-testid="select-bedrooms">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="1">غرفة واحدة</SelectItem>
              <SelectItem value="2">غرفتين</SelectItem>
              <SelectItem value="3">3 غرف</SelectItem>
              <SelectItem value="4">4 غرف أو أكثر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 justify-end">
          <Button
            onClick={handleApplyFilters}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-apply-filter"
          >
            تطبيق الفلتر
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            data-testid="button-reset-filter"
          >
            مسح الفلتر
          </Button>
        </div>
      </div>

      {resultsCount !== undefined && (
        <div className="mt-4 text-sm text-muted-foreground">
          <span className="text-primary font-semibold" data-testid="text-results-count">
            عدد النتائج: {resultsCount}
          </span>
        </div>
      )}
    </Card>
  );
}
