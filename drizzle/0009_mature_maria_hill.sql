DROP INDEX "nodeEmbeddingIndex";--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "project_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "node_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "nodes" DROP COLUMN "embedding";--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "parent_id" SET DATA TYPE integer USING parent_id::integer;