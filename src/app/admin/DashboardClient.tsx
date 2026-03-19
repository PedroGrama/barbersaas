"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Users, Scissors, DollarSign, AlertCircle, Building2, TrendingUp } from "lucide-react";

// ────────────────────────────────────────────────────────────
// MOCK DATA — used when NODE_ENV !== "production"
// ────────────────────────────────────────────────────────────
const MOCK_KPIs = {
  tenantsAtivos: 14,
  inativos: 4,
  inadimplentes: 1,
  ticketMedio: 52.4,
  agendamentosMes: 512,
};

const MOCK_REVENUE = [
  { name: "Jan", total: 14200 },
  { name: "Fev", total: 17800 },
  { name: "Mar", total: 15400 },
  { name: "Abr", total: 21000 },
  { name: "Mai", total: 18600 },
  { name: "Jun", total: 24500 },
];

const MOCK_PAYMENTS = [
  { name: "PIX", value: 65, color: "#3b82f6" },
  { name: "Dinheiro", value: 25, color: "#10b981" },
  { name: "Cartão", value: 10, color: "#6366f1" },
];

const MOCK_BARBERS = [
  { name: "João Costa", cortes: 342, receita: 12500 },
  { name: "Marcos Silva", cortes: 289, receita: 9800 },
  { name: "Rafael Sousa", cortes: 245, receita: 8200 },
  { name: "Diego Alves", cortes: 190, receita: 6100 },
];

const IS_DEV = process.env.NODE_ENV !== "production";

type DashboardData = {
  kpis?: typeof MOCK_KPIs;
  revenue?: typeof MOCK_REVENUE;
  payments?: typeof MOCK_PAYMENTS;
  barbers?: typeof MOCK_BARBERS;
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function DashboardClient({ data }: { data?: DashboardData }) {
  const [filter, setFilter] = useState("all");

  const kpis = IS_DEV ? MOCK_KPIs : (data?.kpis ?? MOCK_KPIs);
  const revenue = IS_DEV ? MOCK_REVENUE : (data?.revenue ?? MOCK_REVENUE);
  const payments = IS_DEV ? MOCK_PAYMENTS : (data?.payments ?? MOCK_PAYMENTS);
  const barbers = IS_DEV ? MOCK_BARBERS : (data?.barbers ?? MOCK_BARBERS);

  return (
    <div className="space-y-10">
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        {...fadeUp}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Painel de Gestão</h2>
            {IS_DEV && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Modo Simulação
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-sm">Visão consolidada de todos os estabelecimentos StudioFlow.</p>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-md px-4 py-2.5 text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
        >
          <option value="all" className="bg-zinc-900">Todos os Estabelecimentos</option>
          <option value="active" className="bg-zinc-900">Apenas Ativos</option>
          <option value="inactive" className="bg-zinc-900">Suspensos / Inativos</option>
        </select>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-5"
        initial="initial"
        animate="animate"
        variants={{
          animate: { transition: { staggerChildren: 0.1 } }
        }}
      >
        <KPICard 
          title="Ativos" 
          value={kpis.tenantsAtivos} 
          icon={Building2} 
          color="blue" 
          trend="+4 novos" 
        />
        <KPICard 
          title="Inativos" 
          value={kpis.inativos} 
          icon={AlertCircle} 
          color="zinc" 
        />
        <KPICard 
          title="Inadimplentes" 
          value={kpis.inadimplentes} 
          icon={AlertCircle} 
          color="red" 
          warning={kpis.inadimplentes > 0} 
        />
        <KPICard 
          title="Ticket Médio" 
          value={`R$ ${kpis.ticketMedio.toFixed(2)}`} 
          icon={TrendingUp} 
          color="green" 
        />
        <KPICard 
          title="Agendamentos" 
          value={kpis.agendamentosMes.toLocaleString("pt-BR")} 
          icon={Scissors} 
          color="indigo" 
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-12">
        <motion.div 
          className="md:col-span-12 lg:col-span-8 rounded-3xl border border-white/5 bg-white/3 backdrop-blur-xl p-8 shadow-2xl"
          {...fadeUp}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Crescimento da Plataforma</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Receita</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "rgba(9, 9, 11, 0.9)", 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(12px)"
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: 600 }}
                  labelStyle={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "4px" }}
                  formatter={(v: any) => [`R$ ${Number(v).toLocaleString("pt-BR")}`, "Volume"]}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="md:col-span-12 lg:col-span-4 space-y-6"
          {...fadeUp}
        >
          <div className="rounded-3xl border border-white/5 bg-white/3 backdrop-blur-xl p-6 shadow-2xl">
            <h3 className="mb-6 text-sm font-bold text-zinc-400 uppercase tracking-widest">Modelos de Uso</h3>
            <div className="h-[180px] flex items-center justify-around">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={payments} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8} dataKey="value" stroke="none">
                    {payments.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 px-4">
                {payments.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-zinc-300">{item.name}</span>
                    <span className="text-zinc-500 text-xs ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/3 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Rank de Profissionais</h3>
              <Users className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="space-y-5">
              {barbers.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-bold text-[10px] text-zinc-500 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{b.name}</div>
                      <div className="text-[10px] text-zinc-500">{b.cortes} atendimentos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">R$ {(b.receita / 1000).toFixed(1)}k</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend, warning }: any) {
  const colorClasses: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    zinc: "text-zinc-400 bg-white/5 border-white/10",
  };

  return (
    <motion.div 
      variants={{
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 }
      }}
      className="rounded-3xl border border-white/5 bg-white/3 backdrop-blur-xl p-6 shadow-2xl group hover:bg-white/5 transition-colors cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{value}</h3>
          {warning && (
            <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
