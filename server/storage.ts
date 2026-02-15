import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { 
  Project, 
  Unit, 
  UnitImage, 
  Lead, 
  AdminUser, 
  Settings, 
  InsertProject, 
  InsertUnit, 
  InsertLead, 
  UnitFilters,
  ProjectImage
} from "../shared/schema.js";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle({ client: pool, schema });

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: InsertProject): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  getUnits(filters?: UnitFilters): Promise<Unit[]>;
  getUnitById(id: number): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: number, unit: InsertUnit): Promise<Unit | undefined>;
  deleteUnit(id: number): Promise<boolean>;

  getUnitImages(unitId: number): Promise<UnitImage[]>;
    // 🔥 Project Images (NEW)
  getProjectImages(projectId: number): Promise<ProjectImage[]>;
  createProjectImage(projectId: number, imageUrl: string): Promise<ProjectImage>;

  createUnitImage(unitId: number, imageUrl: string): Promise<UnitImage>;
  createUnitWithAssets(
    unit: InsertUnit,
    imageUrls: string[],
    paymentPlanPdf?: string | null
  ): Promise<Unit>;

  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  deleteLead(id: number): Promise<boolean>;

  getAdminByUsername(username: string): Promise<AdminUser | undefined>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Omit<Settings, 'id'>>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return await db.select().from(schema.projects);
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const results = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return results[0];
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    const results = await db.select().from(schema.projects).where(eq(schema.projects.slug, slug));
    return results[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const results = await db.insert(schema.projects).values(project).returning();
    return results[0];
  }

  async updateProject(id: number, project: InsertProject): Promise<Project | undefined> {
    const results = await db.update(schema.projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();
    return results[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    const results = await db.delete(schema.projects).where(eq(schema.projects.id, id)).returning();
    return results.length > 0;
  }

  async getUnits(filters?: UnitFilters): Promise<Unit[]> {
    const conditions = [];
    
    if (filters?.projectId) {
      conditions.push(eq(schema.units.projectId, filters.projectId));
    }
    if (filters?.minArea !== undefined) {
      conditions.push(gte(schema.units.area, filters.minArea));
    }
    if (filters?.maxArea !== undefined) {
      conditions.push(lte(schema.units.area, filters.maxArea));
    }
    if (filters?.bedrooms !== undefined) {
      conditions.push(gte(schema.units.bedrooms, filters.bedrooms));
    }

    if (conditions.length > 0) {
      return await db.select().from(schema.units).where(and(...conditions));
    }
    
    return await db.select().from(schema.units);
  }

  async getUnitById(id: number): Promise<Unit | undefined> {
    const results = await db.select().from(schema.units).where(eq(schema.units.id, id));
    return results[0];
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const results = await db.insert(schema.units).values(unit).returning();
    return results[0];

    
  }

  async updateUnit(id: number, unit: InsertUnit): Promise<Unit | undefined> {
    const results = await db.update(schema.units)
      .set({ ...unit, updatedAt: new Date() })
      .where(eq(schema.units.id, id))
      .returning();
    return results[0];
  }


  async getUnitByCode(code: string) {
  const result = await db
    .select()
    .from(schema.units)
    .where(eq(schema.units.unitCode, code));
  return result[0];
  
}


  async deleteUnit(id: number): Promise<boolean> {
    const results = await db.delete(schema.units).where(eq(schema.units.id, id)).returning();
    return results.length > 0;
  }

  async getUnitImages(unitId: number): Promise<UnitImage[]> {
    return await db.select().from(schema.unitImages).where(eq(schema.unitImages.unitId, unitId));
  }


  // 🖼️ جلب صور المشروع (للسلايدر التلقائي)
  async getProjectImages(projectId: number): Promise<ProjectImage[]> {
    return await db
      .select()
      .from(schema.projectImages)
      .where(eq(schema.projectImages.projectId, projectId));
  }

  // ➕ إضافة صورة جديدة لمشروع
  async createProjectImage(projectId: number, imageUrl: string): Promise<ProjectImage> {
    const results = await db
      .insert(schema.projectImages)
      .values({ projectId, imageUrl })
      .returning();

    return results[0];
  }

  async deleteProjectImage(imageId: number): Promise<void> {
  await db
    .delete(schema.projectImages)
    .where(eq(schema.projectImages.id, imageId));
  }
  
  async deleteAllProjectImages(projectId: number): Promise<void> {
    await db
      .delete(schema.projectImages)
      .where(eq(schema.projectImages.projectId, projectId));
  }
  async createUnitImage(unitId: number, imageUrl: string): Promise<UnitImage> {
    const results = await db.insert(schema.unitImages).values({ unitId, imageUrl }).returning();
    return results[0];
  }
  async createUnitWithAssets(
    unit: InsertUnit,
    imageUrls: string[],
    paymentPlanPdf?: string | null
  ): Promise<Unit> {

    // 1️⃣ إنشاء الوحدة
    const results = await db
      .insert(schema.units)
      .values({
        ...unit,
        paymentPlanPdf: paymentPlanPdf ?? null,
      })
      .returning();

    const newUnit = results[0];

    // 2️⃣ لو مفيش صور للوحدة → اسحب صور المشروع تلقائي
    let finalImages = imageUrls;

    if (finalImages.length === 0 && newUnit.projectId) {
      const projectImgs = await db
        .select()
        .from(schema.projectImages)
        .where(eq(schema.projectImages.projectId, newUnit.projectId));

      finalImages = projectImgs.map((img) => img.imageUrl);
    }

    // 3️⃣ إدخال الصور (سواء وحدة أو مشروع)
    if (finalImages.length > 0) {
      await db.insert(schema.unitImages).values(
        finalImages.map((url) => ({
          unitId: newUnit.id,
          imageUrl: url,
        }))
      );
    }

    return newUnit;
  }


  async getLeads(): Promise<Lead[]> {
    return await db.select().from(schema.leads);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const results = await db.insert(schema.leads).values(lead).returning();
    return results[0];
  }

  async deleteLead(id: number): Promise<boolean> {
    const results = await db.delete(schema.leads).where(eq(schema.leads.id, id)).returning();
    return results.length > 0;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const results = await db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username));
    return results[0];
  }

  async getSettings(): Promise<Settings> {
    const results = await db.select().from(schema.settings);
    if (results.length === 0) {
      const newSettings = await db.insert(schema.settings).values({}).returning();
      return newSettings[0];
    }
    return results[0];
  }

  async updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
    const existing = await this.getSettings();
    const results = await db.update(schema.settings)
      .set(updates)
      .where(eq(schema.settings.id, existing.id))
      .returning();
    return results[0];
  }



}

export const storage = new DatabaseStorage();
