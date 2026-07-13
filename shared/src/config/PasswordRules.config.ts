export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "minLength",
    label: "Al menos 8 caracteres",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "Al menos una letra mayúscula",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "Al menos una letra minúscula",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "Al menos un número",
    test: (password) => /[0-9]/.test(password),
  },
];

export const getFailingRules = (password: string): PasswordRule[] =>
  PASSWORD_RULES.filter((rule) => !rule.test(password));

export const isPasswordValid = (password: string): boolean =>
  getFailingRules(password).length === 0;