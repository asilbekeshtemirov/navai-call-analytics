-- Disable auto-sync on startup for all organizations
UPDATE settings SET "autoSyncOnStartup" = false WHERE "autoSyncOnStartup" = true;

-- Verify the change
SELECT o.name, s."autoSyncOnStartup"
FROM settings s
JOIN organizations o ON s."organizationId" = o.id;
