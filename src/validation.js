const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const URL_RE = /^https?:\/\/.+/;

export const validators = {
  username(value) {
    if (!value) return "Username is required";
    if (value.length < 3)
      return "Username must be at least 3 characters";
    if (value.length > 20)
      return "Username must be no more than 20 characters";
    if (!USERNAME_RE.test(value))
      return "Username can only contain letters, numbers, and underscores";
    return null;
  },

  email(value) {
    if (!value) return "Email is required";
    if (!EMAIL_RE.test(value)) return "Please enter a valid email address";
    return null;
  },

  displayName(value) {
    if (value && value.length > 50)
      return "Display name must be no more than 50 characters";
    return null;
  },

  bio(value) {
    if (value && value.length > 200)
      return "Bio must be no more than 200 characters";
    return null;
  },

  avatar(value) {
    if (value && !URL_RE.test(value))
      return "Please enter a valid URL starting with http:// or https://";
    return null;
  },

  currentPassword(value) {
    if (!value) return "Current password is required";
    return null;
  },

  newPassword(value) {
    if (!value) return null;
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!PASSWORD_RE.test(value))
      return "Password must contain uppercase, lowercase, and number";
    return null;
  },

  confirmPassword(value, formData = {}) {
    if (!value) return null;
    if (value !== formData.newPassword) return "Passwords do not match";
    return null;
  },
};