import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database Tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  city: text("city").notNull(),
  appearsInResaleProjects: boolean("appears_in_resale_projects").default(false).notNull(),
  appearsInProjects: boolean("appears_in_projects").default(false).notNull(),
  appearsInAlexandriaProjects: boolean("appears_in_alexandria_projects").default(false).notNull(),
  appearsInAlexandriaResale: boolean("appears_in_alexandria_resale").default(false).notNull(),
  logoUrl: text("logo_url"),
  shortDescription: text("short_description"),
  amenities: text("amenities"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  repaymentYears: integer("repayment_years"),

  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  unitCode: text("unit_code"),
  propertyType: text("property_type"),

  type: text("type").notNull(),

  price: integer("price").notNull(),
  overPrice: integer("over_price"), // ✅ بس دول
  totalPaid: integer("total_paid"),
  totalPaidWithOver: integer("total_paid_with_over"),

  area: integer("area").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),

  location: text("location").notNull(),
  status: text("status").notNull(),
  installmentValue: integer("installment_value"),
  maintenanceDeposit: integer("maintenance_deposit"),

  mainImageUrl: text("main_image_url"),
  description: text("description"),

  isFeaturedOnHomepage: boolean("is_featured_on_homepage")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



export const unitImages = pgTable("unit_images", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyPhone: text("company_phone").default("+20 1234567890").notNull(),
  whatsappNumber: text("whatsapp_number").default("+20 1234567890").notNull(),
  heroTitle: text("hero_title").default("اكتشف منزل أحلامك مع Mars Realestates").notNull(),
  heroSubtitle: text("hero_subtitle").default("نقدم لك أفضل العقارات والمشروعات السكنية في مصر").notNull(),
});

// Zod Schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const updateProjectSchema = insertProjectSchema.partial();

export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true, updatedAt: true });
export const updateUnitSchema = insertUnitSchema.partial();

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertUnitImageSchema = createInsertSchema(unitImages).omit({ id: true });

// TypeScript Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type UnitImage = typeof unitImages.$inferSelect;
export type InsertUnitImage = z.infer<typeof insertUnitImageSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;

export type Settings = typeof settings.$inferSelect;

// Extended types with relations
export type UnitWithImages = Unit & {
  images: UnitImage[];
  project?: Project;
};

export type ProjectWithUnits = Project & {
  units: Unit[];
};

// Filter types
export type UnitFilters = {
  projectId?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
};
