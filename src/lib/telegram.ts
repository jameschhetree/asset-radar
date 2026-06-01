const JEREMY_DB = "/Users/james/.claude/telegram-bot-v3/jeremy.db";
const CHAT_ID = "-5035886410";

export function sendTelegramMessage(message: string): boolean {
  // Only works when running locally on Mac Mini
  // On Vercel, this is a no-op (the message is returned in the API response for Jeremy to pick up)
  try {
    // Dynamic import to avoid build errors on Vercel
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require("child_process");
    const escapedMessage = message.replace(/'/g, "''");
    execSync(
      `sqlite3 "${JEREMY_DB}" "INSERT INTO outbox (chat_id, response_text) VALUES ('${CHAT_ID}', '${escapedMessage}');"`,
      { timeout: 5000 }
    );
    return true;
  } catch (err) {
    console.error("Telegram send failed (expected on Vercel):", err);
    return false;
  }
}
