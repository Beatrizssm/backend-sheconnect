import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === '' ? undefined : value))
  .refine((value) => value === undefined || /^https?:\/\/.+/i.test(value), 'Informe uma URL válida (https://...)');

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome completo é obrigatório').max(120),
  professionalName: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(300, 'Máximo de 300 caracteres').optional(),
  area: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(80).optional(),
  linkedin: optionalUrl,
  instagram: z.string().trim().max(120).optional(),
  website: optionalUrl,
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const verificationFormSchema = z
  .object({
    linkedin: optionalUrl,
    professionalInstagram: z.string().trim().max(120).optional(),
    companyWebsite: optionalUrl,
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => Boolean(data.linkedin || data.professionalInstagram || data.companyWebsite),
    {
      message: 'Informe ao menos LinkedIn, Instagram profissional ou website.',
      path: ['linkedin'],
    },
  );

export type VerificationFormValues = z.infer<typeof verificationFormSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Informe a senha atual'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
