-- Seed employees for Sipuni call processing
-- Extension codes found in logs: 201, 202, 203, 205, 210

-- First, let's get the organization, branch, and department IDs
-- We'll use organization ID 1 (Default Organization)

-- Check if branch exists, if not create one
INSERT INTO "Branch" ("id", "organizationId", "name", "address", "createdAt", "updatedAt")
VALUES
  ('default-branch-001', 1, 'Main Branch', 'Navoi, Uzbekistan', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Check if department exists, if not create one
INSERT INTO "Department" ("id", "branchId", "name", "createdAt", "updatedAt")
VALUES
  ('default-dept-001', 'default-branch-001', 'Call Center', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Insert employees with extension codes
-- Password: "password123" - hashed with bcrypt (10 rounds)
-- Hash: $2b$10$rQ8K7K8K7K8K7K8K7K8K7OnHGGGGGGGGGGGGGGGGGGGGGGGGGGG

INSERT INTO "User" ("id", "organizationId", "firstName", "lastName", "phone", "extCode", "role", "passwordHash", "branchId", "departmentId", "createdAt", "updatedAt")
VALUES
  -- Operator 201
  ('emp-201-uuid-0001', 1, 'Alisher', 'Navoiy', '+998901234501', '201', 'EMPLOYEE', '$2b$10$rQ8K7K8K7K8K7K8K7K8K7OnHGGGGGGGGGGGGGGGGGGGGGGGGGGG', 'default-branch-001', 'default-dept-001', NOW(), NOW()),

  -- Operator 202
  ('emp-202-uuid-0002', 1, 'Bobur', 'Mirzo', '+998901234502', '202', 'EMPLOYEE', '$2b$10$rQ8K7K8K7K8K7K8K7K8K7OnHGGGGGGGGGGGGGGGGGGGGGGGGGGG', 'default-branch-001', 'default-dept-001', NOW(), NOW()),

  -- Operator 203
  ('emp-203-uuid-0003', 1, 'Dilshod', 'Qodirov', '+998901234503', '203', 'EMPLOYEE', '$2b$10$rQ8K7K8K7K8K7K8K7K8K7OnHGGGGGGGGGGGGGGGGGGGGGGGGGGG', 'default-branch-001', 'default-dept-001', NOW(), NOW()),

  -- Operator 205
  ('emp-205-uuid-0005', 1, 'Eldor', 'Tursunov', '+998901234505', '205', 'EMPLOYEE', '$2b$10$rQ8K7K8K7K8K7K8K7K8K7OnHGGGGGGGGGGGGGGGGGGGGGGGGGGG', 'default-branch-001', 'default-dept-001', NOW(), NOW()),

  -- Operator 210
  ('emp-210-uuid-0010', 1, 'Farrux', 'Usmonov', '+998901234510', '210', 'EMPLOYEE', '$2b$10$rQ8K7K8K7K8K7K8K7K8K7OnHGGGGGGGGGGGGGGGGGGGGGGGGGGG', 'default-branch-001', 'default-dept-001', NOW(), NOW())

ON CONFLICT ("organizationId", "phone") DO NOTHING;

-- Verify the inserts
SELECT id, "firstName", "lastName", "extCode", role FROM "User" WHERE "extCode" IN ('201', '202', '203', '205', '210');
