export const REPORT_REASONS = [
  { value: 'FAKE_PROFILE', label: 'Perfil falso' },
  { value: 'HARASSMENT', label: 'Assédio' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Comportamento inadequado' },
  { value: 'OTHER', label: 'Outro' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['value'];
