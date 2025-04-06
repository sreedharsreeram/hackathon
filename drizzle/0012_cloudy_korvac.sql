DROP TABLE "node_relations" CASCADE;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "parent_id" integer;