// Drizzle ORM Schema: MAYAVUE End-to-End VR Certification Platform
// Dialect: PostgreSQL

import { pgTable, uuid, varchar, text, jsonb, doublePrecision, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  verificationId: varchar('verification_id', { length: 20 }).notNull().unique(), // e.g., MVSTU001
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).default('LEARNER').notNull(), // LEARNER, INSTRUCTOR, ADMIN
  practiceHours: doublePrecision('practice_hours').default(0.0).notNull(),
  solvedFaults: integer('solved_faults').default(0).notNull(),
  safetyRating: doublePrecision('safety_rating').default(5.0).notNull(), // 0.0 - 5.0 Stars
  profileTag: varchar('profile_tag', { length: 100 }).default('Certified PV Installer - Level 1').notNull(),
  avatarUrl: text('avatar_url'),
  skillMatrix: jsonb('skill_matrix').default({
    electrical_safety: 95,
    mechanical_mounting: 90,
    dc_wiring: 92,
    inverter_commissioning: 88,
    fault_isolation: 96
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const simulationSessions = pgTable('simulation_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'restrict' }).notNull(),
  moduleCode: varchar('module_code', { length: 100 }).notNull(), // e.g., "SOLAR-BOX-01", "3PHASE-SUB-02"
  durationMinutes: doublePrecision('duration_minutes').notNull(),
  troubleshootPct: doublePrecision('troubleshoot_pct').notNull(),
  safetyPct: doublePrecision('safety_pct').notNull(),
  toolUsePct: doublePrecision('tool_use_pct').notNull(),
  safetyAlerts: integer('safety_alerts').default(0).notNull(),
  aiFeedback: jsonb('ai_feedback').notNull(), // { strengths: [], improvements: [], recommendations: [] }
  qrPayload: text('qr_payload').notNull(), // Encrypted verification URI / payload
  tamperHash: varchar('tamper_hash', { length: 64 }).notNull().unique(), // SHA-256 audit signature
  previousRecordHash: varchar('previous_record_hash', { length: 64 }),
  telemetryLog: jsonb('telemetry_log'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => {
  return {
    userIdIdx: index('session_user_id_idx').on(table.userId),
    moduleCodeIdx: index('session_module_code_idx').on(table.moduleCode),
    tamperHashIdx: index('session_tamper_hash_idx').on(table.tamperHash)
  };
});

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  sessions: many(simulationSessions)
}));

export const simulationSessionsRelations = relations(simulationSessions, ({ one }) => ({
  user: one(userProfiles, {
    fields: [simulationSessions.userId],
    references: [userProfiles.id]
  })
}));
