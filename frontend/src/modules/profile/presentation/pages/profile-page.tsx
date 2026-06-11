import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BadgeCheck, KeyRound, Mail, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { SimpleModal } from '../../../../shared/components/simple-modal';
import { cn } from '../../../../shared/lib/cn';
import { AUTH_TOKEN_STORAGE_KEY } from '../../../../shared/infrastructure/api/client';
import { useProfile } from '../../application/use-profile';
import {
  changePasswordSchema,
  profileFormSchema,
  verificationFormSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
  type VerificationFormValues,
} from '../../domain/profile.schema';
import { ProfileAvatarSection } from '../components/profile-avatar-section';
import { ProfileFormField, profileInputClass } from '../components/profile-form-field';
import { ProfileSkeleton } from '../components/profile-skeleton';
import { VerificationBadge } from '../components/verification-badge';

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    profile,
    isLoading,
    isSaving,
    isRequestingVerification,
    isChangingPassword,
    error,
    success,
    setError,
    setSuccess,
    saveProfile,
    requestVerification,
    changePassword,
    displayImage,
    setPendingImage,
    verificationStatus,
  } = useProfile();

  const [verificationOpen, setVerificationOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      professionalName: '',
      bio: '',
      area: '',
      city: '',
      state: '',
      linkedin: '',
      instagram: '',
      website: '',
    },
  });

  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: { linkedin: '', professionalInstagram: '', companyWebsite: '', notes: '' },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const bioValue = watch('bio') ?? '';

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      fullName: profile.fullName,
      professionalName: profile.professionalName ?? '',
      bio: profile.bio ?? '',
      area: profile.area ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      linkedin: profile.linkedin ?? '',
      instagram: profile.instagram ?? '',
      website: profile.website ?? '',
    });

    verificationForm.reset({
      linkedin: profile.linkedin ?? '',
      professionalInstagram: profile.instagram ?? '',
      companyWebsite: profile.website ?? '',
      notes: profile.verificationNotes ?? '',
    });
  }, [profile, reset, verificationForm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface font-sans">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6ff] to-surface font-sans">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </Link>
          <img src="/logo-sheconnect.png" alt="SheConnect" className="h-10 w-auto rounded-lg" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-16 space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Minha conta</p>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight flex items-center gap-3 flex-wrap">
            Perfil da usuária
            {verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest">
                <BadgeCheck className="w-4 h-4" />
                Verificado
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-on-surface-variant/70 mt-2">
            Gerencie sua presença profissional na comunidade SheConnect.
          </p>
        </div>

        {(error || success) && (
          <div
            className={cn(
              'rounded-2xl px-5 py-4 text-sm font-bold border',
              error ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
            )}
          >
            {error || success}
          </div>
        )}

        <ProfileAvatarSection
          fullName={profile?.fullName ?? 'Usuária'}
          displayImage={displayImage}
          onPreview={setPendingImage}
        />

        <form onSubmit={handleSubmit((values) => void saveProfile(values))} className="space-y-6">
          <section className="rounded-[32px] bg-white border border-outline-variant/20 shadow-sm p-8 space-y-6">
            <h2 className="text-lg font-black text-on-surface">Dados pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileFormField label="Nome completo *" error={errors.fullName?.message}>
                <input className={profileInputClass} {...register('fullName')} />
              </ProfileFormField>
              <ProfileFormField label="Nome profissional" error={errors.professionalName?.message}>
                <input className={profileInputClass} placeholder="Como deseja ser apresentada" {...register('professionalName')} />
              </ProfileFormField>
              <ProfileFormField label="Área de atuação" error={errors.area?.message} className="md:col-span-2">
                <input className={profileInputClass} placeholder="Ex.: Finanças, Tecnologia, Moda" {...register('area')} />
              </ProfileFormField>
              <ProfileFormField label="Cidade" error={errors.city?.message}>
                <input className={profileInputClass} {...register('city')} />
              </ProfileFormField>
              <ProfileFormField label="Estado" error={errors.state?.message}>
                <input className={profileInputClass} {...register('state')} />
              </ProfileFormField>
              <ProfileFormField
                label="Bio / descrição"
                error={errors.bio?.message}
                hint={`${bioValue.length}/300 caracteres`}
                className="md:col-span-2"
              >
                <textarea
                  rows={4}
                  maxLength={300}
                  className={cn(profileInputClass, 'resize-y min-h-[120px]')}
                  placeholder="Conte sua trajetória e o que busca na rede..."
                  {...register('bio')}
                />
              </ProfileFormField>
              <ProfileFormField label="LinkedIn" error={errors.linkedin?.message}>
                <input className={profileInputClass} placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
              </ProfileFormField>
              <ProfileFormField label="Instagram profissional" error={errors.instagram?.message}>
                <input className={profileInputClass} placeholder="@suaempresa" {...register('instagram')} />
              </ProfileFormField>
              <ProfileFormField label="Website" error={errors.website?.message} className="md:col-span-2">
                <input className={profileInputClass} placeholder="https://..." {...register('website')} />
              </ProfileFormField>
            </div>
          </section>

          <section className="rounded-[32px] bg-white border border-outline-variant/20 shadow-sm p-8 space-y-4">
            <h2 className="text-lg font-black text-on-surface flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Status de verificação
            </h2>
            <VerificationBadge
              status={verificationStatus}
              reason={profile?.verificationReason}
            />
            {(verificationStatus === 'NOT_VERIFIED' || verificationStatus === 'REJECTED') && (
              <button
                type="button"
                onClick={() => setVerificationOpen(true)}
                className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Solicitar verificação
              </button>
            )}
          </section>

          <section className="rounded-[32px] bg-white border border-outline-variant/20 shadow-sm p-8">
            <h2 className="text-lg font-black text-on-surface mb-4">Segurança</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-low"
              >
                <KeyRound className="w-4 h-4 text-primary" />
                Alterar senha
              </button>
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-low"
              >
                <Mail className="w-4 h-4 text-primary" />
                Alterar email
              </button>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </main>

      <SimpleModal
        open={verificationOpen}
        title="Solicitar verificação"
        description="Envie seus canais profissionais para análise da equipe SheConnect."
        onClose={() => setVerificationOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={verificationForm.handleSubmit(async (values) => {
            await requestVerification({
              linkedin: values.linkedin || undefined,
              professionalInstagram: values.professionalInstagram || undefined,
              companyWebsite: values.companyWebsite || undefined,
              notes: values.notes || undefined,
            });
            setVerificationOpen(false);
          })}
        >
          <ProfileFormField label="LinkedIn" error={verificationForm.formState.errors.linkedin?.message}>
            <input className={profileInputClass} {...verificationForm.register('linkedin')} />
          </ProfileFormField>
          <ProfileFormField
            label="Instagram profissional"
            error={verificationForm.formState.errors.professionalInstagram?.message}
          >
            <input className={profileInputClass} {...verificationForm.register('professionalInstagram')} />
          </ProfileFormField>
          <ProfileFormField label="Website" error={verificationForm.formState.errors.companyWebsite?.message}>
            <input className={profileInputClass} {...verificationForm.register('companyWebsite')} />
          </ProfileFormField>
          <ProfileFormField label="Observações" error={verificationForm.formState.errors.notes?.message}>
            <textarea
              rows={3}
              className={cn(profileInputClass, 'resize-y')}
              placeholder="Conte brevemente sua atuação na comunidade..."
              {...verificationForm.register('notes')}
            />
          </ProfileFormField>
          {verificationForm.formState.errors.root && (
            <p className="text-xs font-bold text-red-500">{verificationForm.formState.errors.root.message}</p>
          )}
          <button
            type="submit"
            disabled={isRequestingVerification}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60"
          >
            {isRequestingVerification ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </form>
      </SimpleModal>

      <SimpleModal
        open={passwordModalOpen}
        title="Alterar senha"
        description="Informe a senha atual e escolha uma nova senha segura."
        onClose={() => {
          setPasswordModalOpen(false);
          passwordForm.reset();
        }}
      >
        <form
          className="space-y-4"
          onSubmit={passwordForm.handleSubmit(async (values) => {
            try {
              await changePassword(values.currentPassword, values.newPassword);
              passwordForm.reset();
              setPasswordModalOpen(false);
            } catch {
              // erro exibido no banner da página
            }
          })}
        >
          <ProfileFormField
            label="Senha atual"
            error={passwordForm.formState.errors.currentPassword?.message}
          >
            <input
              type="password"
              autoComplete="current-password"
              className={profileInputClass}
              {...passwordForm.register('currentPassword')}
            />
          </ProfileFormField>
          <ProfileFormField
            label="Nova senha"
            error={passwordForm.formState.errors.newPassword?.message}
          >
            <input
              type="password"
              autoComplete="new-password"
              className={profileInputClass}
              {...passwordForm.register('newPassword')}
            />
          </ProfileFormField>
          <ProfileFormField
            label="Confirmar nova senha"
            error={passwordForm.formState.errors.confirmPassword?.message}
          >
            <input
              type="password"
              autoComplete="new-password"
              className={profileInputClass}
              {...passwordForm.register('confirmPassword')}
            />
          </ProfileFormField>
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60"
          >
            {isChangingPassword ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </SimpleModal>

      <SimpleModal
        open={emailModalOpen}
        title="Alterar email"
        description="Em breve você poderá atualizar seu email por aqui."
        onClose={() => setEmailModalOpen(false)}
      >
        <p className="text-sm font-medium text-on-surface-variant/70">
          Placeholder: confirmação em duas etapas será necessária para alterar o email da conta.
        </p>
        {profile?.email && (
          <p className="mt-3 text-sm font-bold text-on-surface">
            Email atual: <span className="text-primary">{profile.email}</span>
          </p>
        )}
      </SimpleModal>
    </div>
  );
}
