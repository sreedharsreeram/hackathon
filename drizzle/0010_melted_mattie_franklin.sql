ALTER TABLE "nodes" DROP CONSTRAINT "nodes_parent_id_nodes_id_fk";
--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "project_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "sources" ALTER COLUMN "node_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_parent_id_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nodeEmbeddingIndex" ON "nodes" USING hnsw ("embedding" vector_cosine_ops);