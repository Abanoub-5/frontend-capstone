(function() {
    'use strict';

    const profileForm = document.getElementById('profile-form');
    const accountForm = document.getElementById('account-form');
    const notificationsForm = document.getElementById('notifications-form');
    const resetBtn = document.getElementById('reset-btn');
    const toast = document.getElementById('toast');

    const profileFields = {
        username: {
            element: document.getElementById('username'),
            error: document.getElementById('username-error'),
            validate: (value) => {
                if (!value) return 'Username is required';
                if (value.length < 3) return 'Username must be at least 3 characters';
                if (value.length > 20) return 'Username must be no more than 20 characters';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
                return null;
            }
        },
        email: {
            element: document.getElementById('email'),
            error: document.getElementById('email-error'),
            validate: (value) => {
                if (!value) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return null;
            }
        },
        displayName: {
            element: document.getElementById('display-name'),
            error: document.getElementById('display-name-error'),
            validate: (value) => {
                if (value && value.length > 50) return 'Display name must be no more than 50 characters';
                return null;
            }
        },
        bio: {
            element: document.getElementById('bio'),
            error: document.getElementById('bio-error'),
            validate: (value) => {
                if (value && value.length > 200) return 'Bio must be no more than 200 characters';
                return null;
            }
        },
        avatar: {
            element: document.getElementById('avatar'),
            error: document.getElementById('avatar-error'),
            validate: (value) => {
                if (value && !/^https?:\/\/.+/.test(value)) return 'Please enter a valid URL starting with http:// or https://';
                return null;
            }
        }
    };

    const accountFields = {
        currentPassword: {
            element: document.getElementById('current-password'),
            error: document.getElementById('current-password-error'),
            validate: (value) => {
                if (!value) return 'Current password is required';
                return null;
            }
        },
        newPassword: {
            element: document.getElementById('new-password'),
            error: document.getElementById('new-password-error'),
            validate: (value) => {
                if (!value) return null;
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password must contain uppercase, lowercase, and number';
                return null;
            }
        },
        confirmPassword: {
            element: document.getElementById('confirm-password'),
            error: document.getElementById('confirm-password-error'),
            validate: (value, formData) => {
                if (!value) return null;
                if (value !== formData.newPassword) return 'Passwords do not match';
                return null;
            }
        }
    };

    const bioCount = document.getElementById('bio-count');

    function showError(field, message) {
        field.error.textContent = message;
        field.element.setAttribute('aria-invalid', 'true');
    }

    function clearError(field) {
        field.error.textContent = '';
        field.element.removeAttribute('aria-invalid');
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
        Object.keys(fields).forEach(key => {
            formData[key] = fields[key].element.value;
        });

        let isValid = true;
        Object.keys(fields).forEach(key => {
            if (!validateField(fields[key], formData)) {
                isValid = false;
            }
        });
        return isValid;
    }

    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
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
        const saved = localStorage.getItem('profileData');
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(profileFields).forEach(key => {
                if (profileFields[key].element && data[key] !== undefined) {
                    profileFields[key].element.value = data[key];
                }
            });
            updateBioCount();
        }

        const savedNotifications = localStorage.getItem('notificationPrefs');
        if (savedNotifications) {
            const data = JSON.parse(savedNotifications);
            document.getElementById('email-notifications').checked = data.emailNotifications ?? true;
            document.getElementById('push-notifications').checked = data.pushNotifications ?? true;
            document.getElementById('weekly-digest').checked = data.weeklyDigest ?? false;
        }
    }

    function saveProfileData(data) {
        localStorage.setItem('profileData', JSON.stringify(data));
    }

    function saveNotificationPrefs(data) {
        localStorage.setItem('notificationPrefs', JSON.stringify(data));
    }

    function updateBioCount() {
        const bio = profileFields.bio.element;
        const count = bio.value.length;
        bioCount.textContent = `${count}/200`;
        bioCount.classList.remove('warning', 'danger');
        if (count > 180) bioCount.classList.add('danger');
        else if (count > 150) bioCount.classList.add('warning');
    }

    profileFields.bio.element.addEventListener('input', updateBioCount);

    Object.keys(profileFields).forEach(key => {
        const field = profileFields[key];
        field.element.addEventListener('blur', () => validateField(field));
        field.element.addEventListener('input', () => {
            if (field.element.hasAttribute('aria-invalid')) {
                validateField(field);
            }
        });
    });

    Object.keys(accountFields).forEach(key => {
        const field = accountFields[key];
        field.element.addEventListener('blur', () => validateField(field));
        field.element.addEventListener('input', () => {
            if (field.element.hasAttribute('aria-invalid')) {
                validateField(field);
            }
        });
    });

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(profileFields)) {
            const data = getFormData(profileForm);
            saveProfileData(data);
            showToast('Profile updated successfully!');
        } else {
            showToast('Please fix the errors above', 'error');
        }
    });

    accountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(accountFields)) {
            accountForm.reset();
            Object.keys(accountFields).forEach(key => clearError(accountFields[key]));
            showToast('Password updated successfully!');
        } else {
            showToast('Please fix the errors above', 'error');
        }
    });

    notificationsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = getFormData(notificationsForm);
        saveNotificationPrefs(data);
        showToast('Notification preferences saved!');
    });

    resetBtn.addEventListener('click', () => {
        profileForm.reset();
        Object.keys(profileFields).forEach(key => clearError(profileFields[key]));
        updateBioCount();
        loadProfileData();
        showToast('Form reset to saved values');
    });

    loadProfileData();
})();