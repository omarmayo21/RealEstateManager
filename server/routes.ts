import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UnitFilters } from "../shared/schema.js";
import { insertProjectSchema, updateProjectSchema, insertUnitSchema, updateUnitSchema, insertLeadSchema } from "../shared/schema.js";
import { upload } from "./middleware/upload";





if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET not set, using default (not secure for production)");
}

const JWT_SECRET = process.env.JWT_SECRET || "mars-realestates-secret-key-2024";

interface AuthRequest extends Request {
  userId?: number;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "غير مصرح" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "رمز غير صالح" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      const admin = await storage.getAdminByUsername(username);
      
      if (!admin) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const token = jwt.sign({ userId: admin.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, username: admin.username });
    } catch (error: any) {
      console.error("LOGIN ERROR 👉", error);
      res.status(500).json({
        error: "حدث خطأ في الخادم",
        message: error?.message,
      });
}

  });


  

  app.get("/api/projects",  async (_req: Request, res: Response) =>{
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error: any) {
  console.error("LOGIN ERROR 👉", error);
  res.status(500).json({
    error: "حدث خطأ في الخادم",
    message: error?.message,
  });
}

  });

  app.post("/api/projects",  async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "بيانات غير صالحة", details: error.errors });
      }
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.put("/api/projects/:id",  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateProjectSchema.parse(req.body);
      const project = await storage.updateProject(id, validatedData as any);
      
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      res.json(project);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "بيانات غير صالحة", details: error.errors });
      }
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.delete("/api/projects/:id",  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });
  app.post("/api/test-upload", upload.single("file"), (req, res) => {
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      url: file.path,
    });
  });


  app.post(
    "/api/uploads/unit-assets",
    authMiddleware,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "paymentPlanPdf", maxCount: 1 },
    ]),
    async (req, res) => {

      console.log("CONTENT-TYPE:", req.headers["content-type"]);
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const files = req.files as {
        images?: Express.Multer.File[];
        paymentPlanPdf?: Express.Multer.File[];
      };

      const images =
        files?.images?.map((file) => file.path) || [];

      const paymentPlanPdf =
        files?.paymentPlanPdf?.[0]?.path || null;

      res.json({
        images,
        paymentPlanPdf,
      });
    }
  );

  app.get("/api/units",  async (req: Request, res: Response) =>{
    try {
      const filters: UnitFilters = {
        projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined,
        minArea: req.query.minArea ? parseInt(req.query.minArea as string) : undefined,
        maxArea: req.query.maxArea ? parseInt(req.query.maxArea as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      };

      const units = await storage.getUnits(filters);
      const projects = await storage.getProjects();
      const projectsMap = new Map(projects.map(p => [p.id, p]));

      const unitsWithProjects = await Promise.all(
        units.map(async (unit) => {
          const images = await storage.getUnitImages(unit.id);
          return {
            ...unit,
            project: projectsMap.get(unit.projectId),
            images,
          };
        })
      );

      res.json(unitsWithProjects);
    } catch (error) {
  console.error("❌ GET /api/units ERROR:", error);
  res.status(500).json({ error: "حدث خطأ في الخادم" });
  }

  });

  app.get("/api/units/:id",  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const unit = await storage.getUnitById(id);
      
      if (!unit) {
        return res.status(404).json({ error: "الوحدة غير موجودة" });
      }

      const project = await storage.getProjectById(unit.projectId);
      const images = await storage.getUnitImages(unit.id);

      res.json({ ...unit, project, images });
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.post(
    "/api/units",
    authMiddleware,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "paymentPlanPdf", maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        // 1️⃣ البيانات النصية
      const validatedData = insertUnitSchema.parse({
        ...req.body,

        projectId: Number(req.body.projectId),
        price: Number(req.body.price),
        area: Number(req.body.area),
        bedrooms: Number(req.body.bedrooms),
        bathrooms: Number(req.body.bathrooms),

        overPrice: req.body.overPrice ? Number(req.body.overPrice) : null,
        installmentValue: req.body.installmentValue ? Number(req.body.installmentValue) : null,
        maintenanceDeposit: req.body.maintenanceDeposit ? Number(req.body.maintenanceDeposit) : null,
        totalPaid: req.body.totalPaid ? Number(req.body.totalPaid) : null,
        repaymentYears: req.body.repaymentYears ? Number(req.body.repaymentYears) : null,

        isFeaturedOnHomepage:
          req.body.isFeaturedOnHomepage === "true" ||
          req.body.isFeaturedOnHomepage === true,
      });



        // 2️⃣ الصور
        const files = req.files as {
          images?: Express.Multer.File[];
          paymentPlanPdf?: Express.Multer.File[];
        };

        const imageUrls =
          files?.images?.map((file) => file.path) ?? [];

        // 3️⃣ PDF
        const paymentPlanPdfUrl =
          files?.paymentPlanPdf?.[0]?.path ?? null;

        // 4️⃣ إنشاء الوحدة + الأصول
        const unit = await storage.createUnitWithAssets(
          validatedData,
          imageUrls,
          paymentPlanPdfUrl
        );

        res.json(unit);
      } catch (error: any) {
        console.error("CREATE UNIT ERROR 👉", error);

        if (error.name === "ZodError") {
          return res.status(400).json({
            error: "بيانات غير صالحة",
            details: error.errors,
          });
        }

        res.status(500).json({
          error: "حدث خطأ في الخادم",
          message: error?.message,
        });
      }
    }
  );

  app.put("/api/units/:id",  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateUnitSchema.parse(req.body);
      const unit = await storage.updateUnit(id, validatedData as any);
      
      if (!unit) {
        return res.status(404).json({ error: "الوحدة غير موجودة" });
      }

      res.json(unit);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "بيانات غير صالحة", details: error.errors });
      }
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.delete("/api/units/:id",  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUnit(id);
      
      if (!success) {
        return res.status(404).json({ error: "الوحدة غير موجودة" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/leads",  async (_req: Request, res: Response) => {
    try {
      const leads = await storage.getLeads();
      const projects = await storage.getProjects();
      const units = await storage.getUnits();
      
      const projectsMap = new Map(projects.map(p => [p.id, p]));
      const unitsMap = new Map(units.map(u => [u.id, u]));

      const leadsWithRelations = leads.map(lead => ({
        ...lead,
        project: lead.projectId ? projectsMap.get(lead.projectId) : undefined,
        unit: lead.unitId ? unitsMap.get(lead.unitId) : undefined,
      }));

      res.json(leadsWithRelations);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.json(lead);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "بيانات غير صالحة", details: error.errors });
      }
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.delete("/api/leads/:id",  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      
      if (!success) {
        return res.status(404).json({ error: "الاستفسار غير موجود" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/settings",authMiddleware, async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  app.put("/api/settings",  async (req: Request, res: Response) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
