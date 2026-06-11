import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, BarChart3, Briefcase, Lock, Mail, Users } from 'lucide-react';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { Field, RoleCardAuth, SubmitButton } from '../components/auth-form-components';

export function AuthPages() {
  const {
    view,
    setView,
    role,
    setRole,
    isSubmitting,
    authError,
    handleSubmit,
    googleButtonRef,
  } = useAppControllerContext();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 h-16 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 z-50">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView('home')}
          aria-label="Voltar para a página principal"
        >
          <img src="/logo-sheconnect.png" alt="SheConnect Logo" className="h-12 md:h-16 w-auto object-contain" />
        </button>
        <button
          onClick={() => setView(view === 'login' ? 'signup' : 'login')}
          className="text-primary font-bold text-sm hover:opacity-80 transition-opacity"
        >
          {view === 'login' ? 'Criar Conta' : 'Fazer Login'}
        </button>
      </header>

      <main className="flex-grow flex pt-16 h-screen">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-form-width py-8 md:py-12">
            <AnimatePresence mode="wait">
              {view === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Crie sua conta</h1>
                  <p className="text-on-surface-variant mb-10 font-bold opacity-60">É rápido e gratuito</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field name="name" label="Nome Completo" placeholder="Seu nome completo" />
                    <Field name="email" label="Email" placeholder="nome@exemplo.com" type="email" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field name="password" label="Senha" placeholder="••••••••" type="password" />
                      <Field label="Confirmar Senha" placeholder="••••••••" type="password" />
                    </div>
                    <div className="pt-4">
                      <label className="text-sm font-semibold text-on-surface-variant block mb-3">Eu sou...</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <RoleCardAuth
                          isSelected={role === 'entrepreneur'}
                          onClick={() => setRole('entrepreneur')}
                          icon={<Briefcase className="w-6 h-6 mb-1" />}
                          label="Empreendedora"
                        />
                        <RoleCardAuth
                          isSelected={role === 'mentor'}
                          onClick={() => setRole('mentor')}
                          icon={<Users className="w-6 h-6 mb-1" />}
                          label="Mentora"
                        />
                        <RoleCardAuth
                          isSelected={role === 'investor'}
                          onClick={() => setRole('investor')}
                          icon={<BarChart3 className="w-6 h-6 mb-1" />}
                          label="Investidora"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                        required
                      />
                      <label htmlFor="terms" className="text-sm font-medium text-on-surface-variant cursor-pointer">
                        Eu aceito os{' '}
                        <a href="#" className="text-primary hover:underline font-bold">
                          Termos e Condições
                        </a>
                      </label>
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} label="Criar minha conta" />
                  </form>
                  <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
                    Já tem conta?{' '}
                    <button onClick={() => setView('login')} className="text-primary font-bold hover:underline">
                      Entrar
                    </button>
                  </p>
                </motion.div>
              )}

              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Bem-vinda de volta</h1>
                  <p className="text-on-surface-variant mb-10 font-bold opacity-60">Acesse sua conta para continuar</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field name="email" label="Email" placeholder="nome@exemplo.com" type="email" />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-on-surface-variant">Senha</label>
                        <button
                          type="button"
                          onClick={() => setView('forgot-password')}
                          className="text-xs text-primary font-black uppercase hover:underline"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-white focus:border-primary outline-none transition-all"
                        required
                      />
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} label="Entrar Agora" />
                  </form>
                  <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
                    Não tem conta?{' '}
                    <button onClick={() => setView('signup')} className="text-primary font-bold hover:underline">
                      Cadastre-se
                    </button>
                  </p>
                </motion.div>
              )}

              {view === 'forgot-password' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => setView('login')}
                    className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight flex items-center gap-3">
                    <Lock className="w-8 h-8 text-secondary" /> Recuperar senha
                  </h1>
                  <p className="text-on-surface-variant mb-8 font-medium">Informe seu email para receber as instruções.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field
                      name="email"
                      label="Email de Cadastro"
                      placeholder="nome@exemplo.com"
                      type="email"
                      icon={<Mail className="w-4 h-4" />}
                    />
                    <SubmitButton isSubmitting={isSubmitting} label="Enviar Instruções" />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {(view === 'login' || view === 'signup') && (
              <div className="mt-12 flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-surface px-2 text-on-surface-variant/50">Ou continue com</span>
                  </div>
                </div>
                {authError && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-bold text-red-600">{authError}</p>
                )}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div key={`google-btn-${view}`} ref={googleButtonRef} className="flex min-h-11 justify-center" />
                ) : (
                  <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-700">
                    Configure VITE_GOOGLE_CLIENT_ID para ativar o login com Google.
                  </p>
                )}
              </div>
            )}

            <footer className="mt-16 py-8 flex flex-col items-center gap-4 text-center">
              <div className="flex gap-6 whitespace-nowrap">
                <a href="#" className="text-[10px] font-black uppercase text-on-surface-variant/40 hover:text-primary transition-colors">
                  Privacidade
                </a>
                <a href="#" className="text-[10px] font-black uppercase text-on-surface-variant/40 hover:text-primary transition-colors">
                  Termos
                </a>
                <a href="#" className="text-[10px] font-black uppercase text-on-surface-variant/40 hover:text-primary transition-colors">
                  Ajuda
                </a>
              </div>
              <p className="text-[10px] text-on-surface-variant/30 font-bold">© 2024 SheConnect. Criando o futuro juntas.</p>
            </footer>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-[#181445] relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#181445] via-[#4648d4] to-[#8127cf] opacity-90" />
          <div className="relative z-10 w-full max-w-lg text-center text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_RA2YsNaof57lAW7m81AxXAtJZRs-qbB9UCOCJr4CZVp051r3AOSLBwJ9W-VO7BbGZuNoo_mnC8QXBfXCbcEOyWkB-nCZDyXqDzEeAraMJ0iogxOW9R3cFITPOmn9v-OQqewjR72-9BI16busH2Kmg8DwXw8iIqogklQ4yRMA-KYUzWzOsjF_u6t_ZIFLnAR3hKhxFMs5rvxf_H2OPY0DVx9oqluQduHolcH9XmTWYq1DyvyaVDNLuTC7w6vCCwM9_cW0tcJks9Tz"
                  alt="Hero"
                  className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto object-cover rounded-[32px] sm:rounded-[48px] border-4 sm:border-8 border-white/5 shadow-2xl"
                />
              </motion.div>
            </AnimatePresence>
            <h2 className="text-4xl font-black mb-6 italic tracking-tight underline decoration-secondary decoration-4 underline-offset-8">
              {view === 'login' ? 'Bem-vinda de volta à sua potência.' : 'Mulheres fortes conectam futuros.'}
            </h2>
            <p className="text-lg opacity-60 max-w-sm mx-auto font-bold">
              {view === 'login'
                ? 'Continue sua jornada, fortaleça sua rede e transforme seus próximos passos em conquista.'
                : 'Quando uma mulher cresce, ela abre caminho para muitas outras brilharem.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
