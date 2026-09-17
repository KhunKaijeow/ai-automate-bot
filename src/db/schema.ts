import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

// 1. ตารางผู้ใช้ (Users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // 'telegram' | 'line' | 'discord' | 'web'
  platformUserId: text("platform_user_id").notNull(),
  username: text("username"),
  displayName: text("display_name"),
  selectedTrack: text("selected_track").default("fortune"),
  streakDays: integer("streak_days").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. ตารางประวัติแชท (Messages)
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  platform: text("platform").notNull(),
  platformUserId: text("platform_user_id").notNull(),
  track: text("track").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  analysisType: text("analysis_type"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. ตารางสรุปรายวันสำหรับส่ง Email (Daily Logs)
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  track: text("track").notNull(),
  date: text("date").notNull(),
  summaryText: text("summary_text").notNull(),
  metrics: jsonb("metrics"),
  emailSent: integer("email_sent").default(0),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});