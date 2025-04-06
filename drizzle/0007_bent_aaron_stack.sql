ALTER TABLE "nodes" ALTER COLUMN "parent_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "parent_id" SET NOT NULL;