DROP INDEX "embeddingIndex";--> statement-breakpoint
DROP INDEX "sourceEmbeddingIndex";--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "results" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
CREATE INDEX "nodeEmbeddingIndex" ON "nodes" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "description";