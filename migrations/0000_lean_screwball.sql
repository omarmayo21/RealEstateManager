CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"unit_id" integer,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"city" text NOT NULL,
	"appears_in_resale_projects" boolean DEFAULT false NOT NULL,
	"appears_in_projects" boolean DEFAULT false NOT NULL,
	"appears_in_alexandria_projects" boolean DEFAULT false NOT NULL,
	"appears_in_alexandria_resale" boolean DEFAULT false NOT NULL,
	"logo_url" text,
	"short_description" text,
	"amenities" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_phone" text DEFAULT '+20 1234567890' NOT NULL,
	"whatsapp_number" text DEFAULT '+20 1234567890' NOT NULL,
	"hero_title" text DEFAULT 'اكتشف منزل أحلامك مع Mars Realestates' NOT NULL,
	"hero_subtitle" text DEFAULT 'نقدم لك أفضل العقارات والمشروعات السكنية في مصر' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"unit_code" text,
	"property_type" text,
	"type" text NOT NULL,
	"price" integer NOT NULL,
	"over_price" integer,
	"installment_value" integer,
	"maintenance_deposit" integer,
	"total_paid" integer,
	"total_paid_with_over" integer,
	"area" integer NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"location" text NOT NULL,
	"status" text NOT NULL,
	"main_image_url" text,
	"description" text,
	"is_featured_on_homepage" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_images" ADD CONSTRAINT "unit_images_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;