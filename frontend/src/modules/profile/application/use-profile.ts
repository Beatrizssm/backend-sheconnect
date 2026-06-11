import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../shared/infrastructure/api/client';
import type { ProfileFormValues } from '../domain/profile.schema';
import type { UpdateProfilePayload, UserProfile, VerificationStatus } from '../domain/profile.types';
import { profileService } from '../infrastructure/api/profile.api';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null | undefined>(undefined);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await profileService.getMe();
      setProfile(data);
      setPendingImage(undefined);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const saveProfile = async (values: ProfileFormValues) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    const payload: UpdateProfilePayload = {
      fullName: values.fullName,
      professionalName: values.professionalName || undefined,
      bio: values.bio || undefined,
      area: values.area || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      linkedin: values.linkedin || undefined,
      instagram: values.instagram || undefined,
      website: values.website || undefined,
    };

    if (pendingImage !== undefined) {
      payload.profileImage = pendingImage;
    }

    try {
      const updated = await profileService.updateMe(payload);
      setProfile(updated);
      setPendingImage(undefined);
      setSuccess('Perfil atualizado com sucesso.');
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const requestVerification = async (input: {
    linkedin?: string;
    professionalInstagram?: string;
    companyWebsite?: string;
    notes?: string;
  }) => {
    setIsRequestingVerification(true);
    setError('');
    setSuccess('');

    try {
      const result = await profileService.requestVerification(input);
      await loadProfile();
      setSuccess(result.message);
    } catch (verificationError) {
      setError(getApiErrorMessage(verificationError));
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const displayImage =
    pendingImage !== undefined ? pendingImage : profile?.profileImage ?? null;

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const result = await profileService.changePassword({ currentPassword, newPassword });
      setSuccess(result.message);
    } catch (changeError) {
      setError(getApiErrorMessage(changeError));
      throw changeError;
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    isRequestingVerification,
    isChangingPassword,
    error,
    success,
    setError,
    setSuccess,
    loadProfile,
    saveProfile,
    requestVerification,
    changePassword,
    pendingImage,
    setPendingImage,
    displayImage,
    verificationStatus: (profile?.verificationStatus ?? 'NOT_VERIFIED') as VerificationStatus,
  };
}
