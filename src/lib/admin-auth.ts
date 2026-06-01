// Simple admin authentication
// Uses a static credential check - same pattern as highlife-records
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER && password === ADMIN_PASS;
}
