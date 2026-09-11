-- Migration: 0001_init.sql
-- MAYAVUE End-to-End VR Certification Platform: UserProfiles & Tamper-Proof Simulation Sessions

-- Enable pgcrypto for UUID generation if on PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id VARCHAR(20) NOT NULL UNIQUE, -- e.g. MVSTU001
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'LEARNER', -- LEARNER, INSTRUCTOR, ADMIN
  practice_hours DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  solved_faults INTEGER NOT NULL DEFAULT 0,
  safety_rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  profile_tag VARCHAR(100) NOT NULL DEFAULT 'Certified PV Installer - Level 1',
  avatar_url TEXT,
  skill_matrix JSONB DEFAULT '{"electrical_safety": 95, "mechanical_mounting": 90, "dc_wiring": 92, "inverter_commissioning": 88, "fault_isolation": 96}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Create simulation_sessions table
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  module_code VARCHAR(100) NOT NULL, -- e.g. "SOLAR-BOX-01", "3PHASE-SUB-02"
  duration_minutes DOUBLE PRECISION NOT NULL,
  troubleshoot_pct DOUBLE PRECISION NOT NULL,
  safety_pct DOUBLE PRECISION NOT NULL,
  tool_use_pct DOUBLE PRECISION NOT NULL,
  safety_alerts INTEGER NOT NULL DEFAULT 0,
  ai_feedback JSONB NOT NULL, -- Strengths, Improvements, ReviewRecommendations
  qr_payload TEXT NOT NULL,
  tamper_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 audit signature
  previous_record_hash VARCHAR(64),
  telemetry_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON simulation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_module_code ON simulation_sessions(module_code);
CREATE INDEX IF NOT EXISTS idx_sessions_tamper_hash ON simulation_sessions(tamper_hash);

-- 3. STRICT ROW IMMUTABILITY TRIGGER (No UPDATE or DELETE allowed on simulation_sessions)
CREATE OR REPLACE FUNCTION enforce_simulation_session_immutability()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY VIOLATION: simulation_sessions table is strictly append-only. UPDATE and DELETE operations are prohibited by cryptographic ledger integrity policy.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_simulation_sessions_immutable ON simulation_sessions;
CREATE TRIGGER trg_simulation_sessions_immutable
BEFORE UPDATE OR DELETE ON simulation_sessions
FOR EACH ROW EXECUTE FUNCTION enforce_simulation_session_immutability();
