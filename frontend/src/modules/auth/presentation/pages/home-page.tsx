import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Network, Users } from 'lucide-react';
import { AreaChart, Area } from 'recharts';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { CHART_DATA, HOME_FEATURES, HOME_STATS, INITIAL_CONNECTIONS } from '../../../../shared/constants/marketing.constants';
import { ChartFrame } from '../../../../shared/components/chart-frame';
import { MetricCard } from '../../../../shared/components/metric-card';

export function HomePage() {
  const { setView, enterDemoMode } = useAppControllerContext();

  return (
    <div className="min-h-screen bg-[#080625] text-white font-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,39,207,0.35),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(96,99,238,0.28),_transparent_30%)]" />
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <button className="rounded-3xl bg-white px-5 py-3 shadow-2xl shadow-black/10" onClick={() => setView('home')}>
          <img src="/logo-sheconnect.png" alt="SheConnect Logo" className="h-16 md:h-20 w-auto object-contain" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('login')}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm font-bold text-white/75 hover:text-white hover:bg-white/10 transition-all"
          >
            Entrar
          </button>
          <button
            onClick={() => setView('signup')}
            className="px-5 py-3 rounded-full bg-white text-[#181445] text-sm font-black shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all"
          >
            Criar conta
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-12 pb-16">
        <section className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center min-h-[calc(100vh-96px)] pt-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/70 backdrop-blur">
              <CheckCircle2 className="w-4 h-4 text-secondary-container" />
              Comunidade, negócios e crescimento
            </div>

            <div className="space-y-6">
              <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
                A rede que impulsiona mulheres empreendedoras.
              </h1>
              <p className="max-w-2xl text-lg md:text-xl text-white/62 font-semibold leading-relaxed">
                A SheConnect conecta fundadoras, mentoras e investidoras para transformar ideias em negócios mais fortes,
                colaborativos e escaláveis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setView('signup')}
                className="group px-7 py-4 bg-primary-container text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                Começar agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={enterDemoMode}
                className="px-7 py-4 bg-white/10 border border-white/15 rounded-2xl font-black text-white hover:bg-white/15 transition-all backdrop-blur"
              >
                Ver dashboard demo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl pt-4">
              {HOME_STATS.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                  <p className="text-2xl md:text-3xl font-black">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-white/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-secondary/20 to-white/10 blur-3xl" />
            <div className="relative rounded-[40px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="rounded-[32px] bg-[#f8f6ff] text-on-surface p-6 md:p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Visão da jornada</p>
                    <h2 className="text-2xl font-black">Dashboard SheConnect</h2>
                  </div>
                  <div className="flex -space-x-3">
                    {INITIAL_CONNECTIONS.slice(0, 3).map((conn) => (
                      <img key={conn.id} src={conn.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <MetricCard label="Mentorias" value="12" sublabel="este mês" icon={<Users className="w-5 h-5 text-primary" />} trend="+18%" />
                  <MetricCard label="Conexões" value="248" sublabel="rede ativa" icon={<Network className="w-5 h-5 text-secondary" />} trend="+32" />
                </div>

                <div className="rounded-[28px] bg-white p-5 border border-outline-variant/20 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black">Crescimento da rede</h3>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full">+42%</span>
                  </div>
                  <ChartFrame className="h-44">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="homePreview" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6063ee" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="#6063ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#6063ee" strokeWidth={4} fill="url(#homePreview)" dot={false} />
                    </AreaChart>
                  </ChartFrame>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5 py-10">
          {HOME_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[32px] border border-white/10 bg-white/[0.07] p-7 backdrop-blur hover:bg-white/[0.1] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                <p className="text-sm font-semibold text-white/55 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
