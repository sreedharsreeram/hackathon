DROP TABLE "chats" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "chat_history" jsonb DEFAULT '[]'::jsonb NOT NULL;