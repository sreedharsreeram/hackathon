ALTER TABLE "nodes" ADD COLUMN "followup_questions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "concepts" jsonb DEFAULT '[]'::jsonb NOT NULL;