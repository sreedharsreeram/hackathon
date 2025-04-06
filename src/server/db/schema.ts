import { relations, sql } from "drizzle-orm";
import { 
  index, 
  pgTableCreator, 
  primaryKey, 
  serial, 
  text, 
  vector, 
  jsonb, 
  timestamp, 
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

// Projects table
export const projects = createTable(
  'projects',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    // Chat history as a JSONB array of question-answer pairs
    chatHistory: jsonb('chat_history').$type<{
      question: string;
      answer: string;
      timestamp: string;
      nodeId: number;
    }[]>().default([]).notNull(),
    createdAt: timestamp('created_at', { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
);

// Rename 'guides' to 'nodes' for clarity
export const nodes = createTable(
  'nodes',
  {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id'),
    projectId: serial('project_id')
      .notNull()
      .references(() => projects.id),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    answer: text('answer').notNull(),
    images: jsonb('images').$type<{url: string; description: string}[]>().notNull(),
    query: text('query').notNull(),
    followupQuestions: jsonb('followup_questions').$type<string[]>().default([]).notNull(),
    concepts: jsonb('concepts').$type<string[]>().default([]).notNull(),
    results: jsonb('results').$type<{title: string; url: string; content: string}[]>().default([]).notNull(),
    createdAt: timestamp('created_at', { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
      embedding: vector('embedding', { dimensions: 768 }),
  },
  (table) => [
    index('nodeEmbeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ]
);

// Sources/Resources table that belongs to nodes
export const sources = createTable(
  'sources',
  {
    id: serial('id').primaryKey(),
    nodeId: serial('node_id')
      .notNull()
      .references(() => nodes.id),
    url: text('url').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }),
    createdAt: timestamp('created_at', { mode: "date", withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

// Update relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  projects: many(projects),
  nodes: many(nodes),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  nodes: many(nodes),
}));

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  project: one(projects, { fields: [nodes.projectId], references: [projects.id] }),
  user: one(users, { fields: [nodes.userId], references: [users.id] }),
  sources: many(sources),
  parent: one(nodes, { 
    fields: [nodes.parentId], 
    references: [nodes.id],
    relationName: 'nodeHierarchy'
  }),
  children: many(nodes, {
    relationName: 'nodeHierarchy'
  })
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  node: one(nodes, { fields: [sources.nodeId], references: [nodes.id] }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);