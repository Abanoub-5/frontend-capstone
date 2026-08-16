import { validators } from "./src/validation.js";

const profileForm = document.getElementById("profile-form");
const accountForm = document.getElementById("account-form");
const notificationsForm = document.getElementById("notifications-form");
const resetBtn = document.getElementById("reset-btn");
const toast = document.getElementById("toast");

const profileFields = {
  username: {
    element: document.getElementById("username"),
    error: document.getElementById("username-error"),
    validate: validators.username,
  },
  email: {
    element: document.getElementById("email"),
    error: document.getElementById("email-error"),
    validate: validators.email,
  },
  displayName: {
    element: document.getElementById("display-name"),
    error: document.getElementById("display-name-error"),
    validate: validators.displayName,
  },
  bio: {
    element: document.getElementById("bio"),
    error: document.getElementById("bio-error"),
    validate: validators.bio,
  },
  avatar: {
    element: document.getElementById("avatar"),
    error: document.getElementById("avatar-error"),
    validate: validators.avatar,
  },
};

const accountFields = {
  currentPassword: {
    element: document.getElementById("current-password"),
    error: document.getElementById("current-password-error"),
    validate: validators.currentPassword,
  },
  newPassword: {
    element: document.getElementById("new-password"),
    error: document.getElementById("new-password-error"),
    validate: validators.newPassword,
  },
  confirmPassword: {
    element: document.getElementById("confirm-password"),
    error: document.getElementById("confirm-password-error"),
    validate: validators.confirmPassword,
  },
};

const bioCount = document.getElementById("bio-count");

function showError(field, message) {
  if (!field.error) return;
  field.error.textContent = message;
  field.element.setAttribute("aria-invalid", "true");
  field.element.setAttribute("aria-describedby", field.error.id);
}

function clearError(field) {
  if (!field.error) return;
  field.error.textContent = "";
  field.element.removeAttribute("aria-invalid");
}

function validateField(field, formData = {}) {
  const error = field.validate(field.element.value, formData);

  if (error) {
    showError(field, error);
    return false;
  }

  clearError(field);
  return true;
}

function validateForm(fields) {
  const formData = {};

  Object.keys(fields).forEach((key) => {
    formData[key] = fields[key].element.value;
  });

  let isValid = true;

  Object.keys(fields).forEach((key) => {
    if (!validateField(fields[key], formData)) {
      isValid = false;
    }
  });

  if (!isValid) {
    focusFirstInvalid(fields);
  }

  return isValid;
}

function focusFirstInvalid(fields) {
  const firstInvalid = Object.keys(fields).find((key) =>
    fields[key].element.hasAttribute("aria-invalid"),
  );

  if (firstInvalid) {
    fields[firstInvalid].element.focus();
  }
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function getFormData(form) {
  const data = {};

  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

function loadProfileData() {
  const saved = localStorage.getItem("profileData");

  if (saved) {
    try {
      const data = JSON.parse(saved);

      Object.keys(profileFields).forEach((key) => {
        if (profileFields[key].element && data[key] !== undefined) {
          profileFields[key].element.value = data[key];
        }
      });

      updateBioCount();
    } catch {
      localStorage.removeItem("profileData");
    }
  }

  const savedNotifications = localStorage.getItem("notificationPrefs");

  if (savedNotifications) {
    try {
      const data = JSON.parse(savedNotifications);

      document.getElementById("email-notifications").checked =
        data.emailNotifications ?? true;
      document.getElementById("push-notifications").checked =
        data.pushNotifications ?? true;
      document.getElementById("weekly-digest").checked =
        data.weeklyDigest ?? false;
    } catch {
      localStorage.removeItem("notificationPrefs");
    }
  }
}

function saveProfileData(data) {
  localStorage.setItem("profileData", JSON.stringify(data));
}

function saveNotificationPrefs(data) {
  localStorage.setItem("notificationPrefs", JSON.stringify(data));
}

function updateBioCount() {
  const bio = profileFields.bio.element;
  const count = bio.value.length;

  bioCount.textContent = `${count}/200`;
  bioCount.classList.remove("warning", "danger");

  if (count > 180) bioCount.classList.add("danger");
  else if (count > 150) bioCount.classList.add("warning");
}

profileFields.bio.element.addEventListener("input", updateBioCount);

Object.keys(profileFields).forEach((key) => {
  const field = profileFields[key];

  field.element.addEventListener("blur", () => validateField(field));
  field.element.addEventListener("input", () => {
    if (field.element.hasAttribute("aria-invalid")) {
      validateField(field);
    }
  });
});

Object.keys(accountFields).forEach((key) => {
  const field = accountFields[key];

  field.element.addEventListener("blur", () => validateField(field));
  field.element.addEventListener("input", () => {
    if (field.element.hasAttribute("aria-invalid")) {
      validateField(field);
    }
  });
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (validateForm(profileFields)) {
    const data = getFormData(profileForm);

    saveProfileData(data);
    showToast("Profile updated successfully!");
  } else {
    showToast("Please fix the errors above", "error");
  }
});

accountForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (validateForm(accountFields)) {
    accountForm.reset();

    Object.keys(accountFields).forEach((key) => clearError(accountFields[key]));
    showToast("Password updated successfully!");
  } else {
    showToast("Please fix the errors above", "error");
  }
});

notificationsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = getFormData(notificationsForm);

  saveNotificationPrefs(data);
  showToast("Notification preferences saved!");
});

resetBtn.addEventListener("click", () => {
  profileForm.reset();

  Object.keys(profileFields).forEach((key) => clearError(profileFields[key]));
  updateBioCount();
  loadProfileData();
  showToast("Form reset to saved values");
});

loadProfileData();