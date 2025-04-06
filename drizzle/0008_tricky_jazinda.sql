ALTER TABLE "nodes" ALTER COLUMN "parent_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "parent_id" DROP NOT NULL;