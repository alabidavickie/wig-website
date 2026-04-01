export const disposableDomains = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "dropmail.me",
  "temp-mail.org",
  "yopmail.com",
  "fakeinbox.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com"
]);

export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  return disposableDomains.has(domain);
}
