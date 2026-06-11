import { Camera, Trash2, Upload } from 'lucide-react';
import { cn } from '../../../../shared/lib/cn';
import { profileAvatar } from '../../../../shared/utils/auth.utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

type ProfileAvatarSectionProps = {
  fullName: string;
  displayImage: string | null;
  onPreview: (value: string | null) => void;
  disabled?: boolean;
};

export function ProfileAvatarSection({
  fullName,
  displayImage,
  onPreview,
  disabled,
}: ProfileAvatarSectionProps) {
  const avatarSrc = displayImage ?? profileAvatar(fullName);

  const handleFile = (file: File | undefined) => {
    if (!file || disabled) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Use JPG, PNG ou WEBP.');
      return;
    }

    if (file.size > MAX_BYTES) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="rounded-[32px] bg-gradient-to-br from-[#fdfbff] via-white to-[#f3f0ff] border border-outline-variant/20 shadow-sm p-8">
      <h2 className="text-lg font-black text-on-surface mb-6">Foto de perfil</h2>
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative">
          <img
            src={avatarSrc}
            alt={fullName}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-primary/10 shadow-xl"
          />
          <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
            <Camera className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-4">
          <p className="text-sm font-medium text-on-surface-variant/80">
            JPG, PNG ou WEBP · até 5MB. A pré-visualização aparece antes de salvar.
          </p>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <label
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors',
                disabled && 'opacity-50 pointer-events-none',
              )}
            >
              <Upload className="w-4 h-4" />
              Trocar foto
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={disabled}
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              disabled={disabled || !displayImage}
              onClick={() => onPreview(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
