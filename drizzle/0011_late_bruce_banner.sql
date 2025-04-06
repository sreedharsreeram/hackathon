CREATE TABLE "node_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_node_id" serial NOT NULL,
	"child_node_id" serial NOT NULL,
	"order" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nodes" DROP CONSTRAINT "nodes_parent_id_nodes_id_fk";
--> statement-breakpoint
ALTER TABLE "node_relations" ADD CONSTRAINT "node_relations_parent_node_id_nodes_id_fk" FOREIGN KEY ("parent_node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_relations" ADD CONSTRAINT "node_relations_child_node_id_nodes_id_fk" FOREIGN KEY ("child_node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "node_relation_parent_idx" ON "node_relations" USING btree ("parent_node_id");--> statement-breakpoint
CREATE INDEX "node_relation_child_idx" ON "node_relations" USING btree ("child_node_id");--> statement-breakpoint
ALTER TABLE "nodes" DROP COLUMN "parent_id";