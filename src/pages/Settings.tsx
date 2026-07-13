import { useState, useEffect } from 'react';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';

type Theme = 'light' | 'dark' | 'system';

interface FormData {
  name: string;
  email: string;
  theme: Theme;
}

interface Errors {
  name?: string;
  email?: string;
}

export function Settings() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    theme: 'system',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedName = localStorage.getItem('name');
    const savedEmail = localStorage.getItem('email');

    if (savedTheme) setFormData(prev => ({ ...prev, theme: savedTheme }));
    if (savedName) setFormData(prev => ({ ...prev, name: savedName }));
    if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));

    applyTheme(savedTheme || 'system');
  }, []);

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    return undefined;
  };

  const validateField = (name: keyof FormData, value: string) => {
    if (name === 'name') return validateName(value);
    if (name === 'email') return validateEmail(value);
    return undefined;
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name: keyof FormData) => {
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);

    setErrors({ name: nameError, email: emailError });

    if (nameError || emailError) {
      setIsSubmitting(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.setItem('name', formData.name);
    localStorage.setItem('email', formData.email);
    localStorage.setItem('theme', formData.theme);
    applyTheme(formData.theme);

    setIsSubmitted(true);
    setIsSubmitting(false);

    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleThemeChange = (theme: Theme) => {
    setFormData(prev => ({ ...prev, theme }));
    applyTheme(theme);
  };

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[var(--text-h)]">Settings</h1>
          <p className="mt-2 text-[var(--text)]">Manage your account preferences</p>
        </header>

        {isSubmitted && (
          <div
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 rounded-lg text-sm"
            role="alert"
            aria-live="polite"
          >
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name" required>
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Enter your full name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isSubmitting}
              className="w-full"
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" required>
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              className="w-full"
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400" role="alert" aria-live="polite">
                {errors.email}
              </p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[var(--text-h)]">Theme</legend>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Select theme">
              {themeOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.theme === value
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                      : 'border-[var(--border)] hover:border-[var(--accent-border)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={formData.theme === value}
                    onChange={() => handleThemeChange(value)}
                    className="sr-only"
                    aria-label={label}
                  />
                  <span className="w-4 h-4 border-2 border-[var(--border)] rounded-full flex items-center justify-center relative">
                    {formData.theme === value && (
                      <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                    )}
                  </span>
                  <span className="text-sm text-sm font-medium text-[var(--text-h)]">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}