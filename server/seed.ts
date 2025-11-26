import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle({ client: pool, schema });

async function seed() {
  console.log("🌱 Seeding database...");

  const adminPasswordHash = await bcrypt.hash('mars@3011#', 10);
  await db.insert(schema.adminUsers).values({
    username: 'mars',
    passwordHash: adminPasswordHash,
  }).onConflictDoNothing();
  console.log("✅ Admin user created");

  await db.insert(schema.settings).values({}).onConflictDoNothing();
  console.log("✅ Settings initialized");

  const projectsData = [
    {
      name: 'The One',
      slug: 'the-one',
      city: 'الإسكندرية',
      appearsInResaleProjects: false,
      appearsInProjects: true,
      appearsInAlexandriaProjects: true,
      appearsInAlexandriaResale: false,
      logoUrl: null,
      shortDescription: 'مشروع سكني فاخر على ساحل البحر المتوسط',
      amenities: 'حمامات سباحة\nصالة رياضية\nأمن وحراسة 24/7\nمناطق خضراء واسعة\nمول تجاري',
    },
    {
      name: 'سان ستيفانو جراند بلازا',
      slug: 'san-stefano-grand-plaza',
      city: 'الإسكندرية',
      appearsInResaleProjects: true,
      appearsInProjects: false,
      appearsInAlexandriaProjects: true,
      appearsInAlexandriaResale: true,
      logoUrl: null,
      shortDescription: 'برج سكني فاخر بإطلالة بحرية خلابة',
      amenities: 'إطلالة بحرية مباشرة\nمطاعم وكافيهات\nخدمات فندقية\nموقف سيارات',
    },
    {
      name: 'جراند هايتس أكتوبر',
      slug: 'grand-heights-october',
      city: 'القاهرة',
      appearsInResaleProjects: false,
      appearsInProjects: true,
      appearsInAlexandriaProjects: false,
      appearsInAlexandriaResale: false,
      logoUrl: null,
      shortDescription: 'كمبوند سكني متكامل في أكتوبر',
      amenities: 'نادي اجتماعي\nحدائق ومناطق لعب أطفال\nمدارس قريبة\nمواصلات سهلة',
    },
    {
      name: 'كمبوند ذا بروك القاهرة الجديدة',
      slug: 'the-brook-new-cairo',
      city: 'القاهرة',
      appearsInResaleProjects: true,
      appearsInProjects: false,
      appearsInAlexandriaProjects: false,
      appearsInAlexandriaResale: false,
      logoUrl: null,
      shortDescription: 'مجتمع سكني راقي في قلب القاهرة الجديدة',
      amenities: 'بحيرات صناعية\nمسارات للمشي والجري\nنادي رياضي\nمنطقة تجارية',
    },
  ];

  const insertedProjects = [];
  for (const project of projectsData) {
    const result = await db.insert(schema.projects).values(project).onConflictDoNothing().returning();
    if (result.length > 0) {
      insertedProjects.push(result[0]);
    }
  }
  console.log(`✅ ${insertedProjects.length} projects created`);

  if (insertedProjects.length > 0) {
    const unitsData = [
      {
        projectId: insertedProjects[0].id,
        title: 'شقة 3 غرف نوم بإطلالة بحرية',
        type: 'primary',
        price: 4500000,
        area: 180,
        bedrooms: 3,
        bathrooms: 2,
        location: 'الإسكندرية - سيدي جابر',
        status: 'available',
        mainImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        description: 'شقة فاخرة بإطلالة مباشرة على البحر المتوسط، تشطيب سوبر لوكس مع تراسات واسعة.',
        isFeaturedOnHomepage: true,
        additionalImages: [
          'https://images.unsplash.com/photo-1560448204-e1a3fae0be0e?w=800',
          'https://images.unsplash.com/photo-1567684014761-b65e2e59b5c0?w=800',
        ],
      },
      {
        projectId: insertedProjects[0].id,
        title: 'شقة 2 غرفة نوم - طابق علوي',
        type: 'primary',
        price: 3200000,
        area: 120,
        bedrooms: 2,
        bathrooms: 2,
        location: 'الإسكندرية - سيدي جابر',
        status: 'available',
        mainImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        description: 'شقة مميزة في طابق علوي مع تشطيبات عصرية وإطلالة رائعة.',
        isFeaturedOnHomepage: true,
        additionalImages: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
      },
      {
        projectId: insertedProjects[1]?.id || insertedProjects[0].id,
        title: 'شقة فاخرة 4 غرف - سان ستيفانو',
        type: 'resale',
        price: 6500000,
        area: 250,
        bedrooms: 4,
        bathrooms: 3,
        location: 'الإسكندرية - سان ستيفانو',
        status: 'available',
        mainImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        description: 'شقة فاخرة للبيع في برج سان ستيفانو الشهير، إطلالة بحرية خلابة على 360 درجة.',
        isFeaturedOnHomepage: true,
      },
      {
        projectId: insertedProjects[2]?.id || insertedProjects[0].id,
        title: 'فيلا مستقلة 5 غرف - جراند هايتس',
        type: 'primary',
        price: 8900000,
        area: 350,
        bedrooms: 5,
        bathrooms: 4,
        location: 'القاهرة - أكتوبر',
        status: 'available',
        mainImageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
        description: 'فيلا مستقلة واسعة مع حديقة خاصة وحمام سباحة، في أرقى مناطق أكتوبر.',
        isFeaturedOnHomepage: true,
      },
      {
        projectId: insertedProjects[2]?.id || insertedProjects[0].id,
        title: 'شقة 3 غرف في كمبوند مغلق',
        type: 'primary',
        price: 3800000,
        area: 165,
        bedrooms: 3,
        bathrooms: 2,
        location: 'القاهرة - أكتوبر',
        status: 'available',
        mainImageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
        description: 'شقة عصرية في كمبوند آمن ومغلق مع جميع الخدمات.',
        isFeaturedOnHomepage: false,
      },
      {
        projectId: insertedProjects[3]?.id || insertedProjects[0].id,
        title: 'شقة دوبلكس 4 غرف - ذا بروك',
        type: 'resale',
        price: 5200000,
        area: 220,
        bedrooms: 4,
        bathrooms: 3,
        location: 'القاهرة - القاهرة الجديدة',
        status: 'available',
        mainImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        description: 'دوبلكس واسع في موقع مميز بالقاهرة الجديدة، تشطيب راقي جداً.',
        isFeaturedOnHomepage: true,
      },
    ];

    const insertedUnits = [];
    for (const unit of unitsData) {
      const { additionalImages, ...unitData } = unit as any;
      const result = await db.insert(schema.units).values(unitData).onConflictDoNothing().returning();
      if (result.length > 0) {
        insertedUnits.push({ unit: result[0], additionalImages: additionalImages || [] });
      }
    }
    console.log(`✅ ${insertedUnits.length} units created`);

    let imageCount = 0;
    for (const { unit, additionalImages } of insertedUnits) {
      for (const imageUrl of additionalImages) {
        await db.insert(schema.unitImages).values({ unitId: unit.id, imageUrl }).onConflictDoNothing();
        imageCount++;
      }
    }
    console.log(`✅ ${imageCount} unit images created`);
  }

  console.log("✨ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
