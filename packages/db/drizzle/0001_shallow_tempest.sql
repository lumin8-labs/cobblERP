CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"quantity_on_hand" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"unit_of_measure" varchar(30) NOT NULL,
	"reorder_point" numeric(12, 2) DEFAULT '50.00',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"style_code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"construction" varchar(100) NOT NULL,
	"upper_material" varchar(150) NOT NULL,
	"sole_type" varchar(100) NOT NULL,
	"standard_cost" numeric(10, 2) DEFAULT '0.00',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_style_code_unique" UNIQUE("style_code")
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"product_id" integer,
	"pairs_requested" integer NOT NULL,
	"stage" varchar(50) DEFAULT 'Cutting' NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"target_completion_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;