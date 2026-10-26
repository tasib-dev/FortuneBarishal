// Password rules (keep in sync with src/pages/Register.jsx)
export function passwordError(pw, username = "") {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 72) return "Password must be at most 72 characters.";
  if (/\s/.test(pw)) return "Password cannot contain spaces.";
  if (!/[a-z]/.test(pw)) return "Password needs a lowercase letter.";
  if (!/[A-Z]/.test(pw)) return "Password needs an uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password needs a number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password needs a special character (e.g. @ # ! $).";
  if (username && pw.toLowerCase().includes(username.toLowerCase())) return "Password cannot contain your username.";
  return "";
}

export function validateRegister(b = {}) {
  const errors = {};
  const email = String(b.email || "").trim().toLowerCase();
  const username = String(b.username || "").trim();
  const password = String(b.password || "");
  const confirm = String(b.confirmPassword || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) errors.email = "Enter a valid email address.";
  if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(username)) errors.username = "3-20 characters: letters, numbers, underscore. Must start with a letter.";
  const pe = passwordError(password, username);
  if (pe) errors.password = pe;
  if (password !== confirm) errors.confirmPassword = "Passwords do not match.";
  return { errors, data: { email, username, password } };
}
