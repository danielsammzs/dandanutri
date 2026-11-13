import React, { useCallback, useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { getDashboardData, type DashboardMetrics, type PacienteSemRetorno } from '../lib/db';
import { PacientesList } from './PacientesList';
import { PacienteDetalhes } from './PacienteDetalhes';
import { NovoPacienteForm } from './NovoPacienteForm';
import {
  Activity,
  LogOut,
  Users,
  Calendar,
  ClockAlert,
  ChevronRight,
  LayoutDashboard,
  UserCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'pacientes';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [isNovoPaciente, setIsNovoPaciente] = useState(false);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const nutricionistaId = user?.id;

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (!nutricionistaId) return;
    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      const data = await getDashboardData(nutricionistaId);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dados do Neon:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [nutricionistaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
    onLogout();
  };

  const handleNavigateToPaciente = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    setIsNovoPaciente(false);
    setCurrentTab('pacientes');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Menu Lateral Fixo */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-30 shadow-sm">
        {/* Topo com Logotipo Nutri APP */}
        <div className="h-20 px-6 flex items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg tracking-tight block">
                Nutri APP
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase block">
                Gestão Clínica
              </span>
            </div>
          </div>
        </div>

        {/* Navegação / Menus */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              setSelectedPacienteId(null);
              setIsNovoPaciente(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`} />
            Dashboard
          </button>

          <button
            onClick={() => {
              setCurrentTab('pacientes');
              setSelectedPacienteId(null);
              setIsNovoPaciente(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
              currentTab === 'pacientes'
                ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className={`w-5 h-5 ${currentTab === 'pacientes' ? 'text-emerald-600' : 'text-slate-400'}`} />
            Pacientes
          </button>
        </nav>

        {/* Rodapé do Menu com Dados da Nutricionista e Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate mr-2">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {user?.name || 'Nutricionista'}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200/80 hover:border-red-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Barra superior de status */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Painel
            </span>
            <span className="text-xs text-slate-300">/</span>
            {currentTab === 'dashboard' ? (
              <span className="text-xs font-semibold text-slate-700 capitalize">
                Visão Geral
              </span>
            ) : isNovoPaciente ? (
              <>
                <button
                  onClick={() => setIsNovoPaciente(false)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Pacientes
                </button>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-semibold text-emerald-700">Novo Cadastro</span>
              </>
            ) : selectedPacienteId ? (
              <>
                <button
                  onClick={() => setSelectedPacienteId(null)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Pacientes
                </button>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-semibold text-emerald-700">Prontuário Clínico</span>
              </>
            ) : (
              <span className="text-xs font-semibold text-slate-700">
                Gestão de Pacientes
              </span>
            )}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Atualizar dados em tempo real"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-slate-200 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Atualizar</span>
          </button>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="p-8 flex-1 max-w-7xl w-full">
          {currentTab === 'pacientes' ? (
            isNovoPaciente ? (
              <NovoPacienteForm
                nutricionistaId={nutricionistaId}
                onVoltar={() => setIsNovoPaciente(false)}
                onSuccess={(newId) => {
                  setIsNovoPaciente(false);
                  setSelectedPacienteId(newId);
                  loadData();
                }}
              />
            ) : selectedPacienteId ? (
              <PacienteDetalhes
                pacienteId={selectedPacienteId}
                nutricionistaId={nutricionistaId}
                onVoltar={() => {
                  setSelectedPacienteId(null);
                  setIsNovoPaciente(false);
                }}
              />
            ) : (
              <PacientesList
                nutricionistaId={nutricionistaId}
                onSelectPaciente={(id) => {
                  setSelectedPacienteId(id);
                  setIsNovoPaciente(false);
                }}
                onNovoPaciente={() => {
                  setIsNovoPaciente(true);
                  setSelectedPacienteId(null);
                }}
              />
            )
          ) : (
            /* TAB DASHBOARD */
            <div className="space-y-8">
              {/* Boas-vindas */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                  Olá, {user?.name || 'Nutricionista'}! 👋
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Acompanhe em tempo real o status dos seus atendimentos e pacientes.
                </p>
              </div>

              {/* Grid com os 3 Cards Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1 — Total de pacientes ativos */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-slate-200/70 transition">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pacientes Ativos
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800">
                      {loading ? '...' : metrics.totalPacientes}
                    </span>
                    <span className="text-xs font-medium text-emerald-600">
                      cadastrados
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Total sob seus cuidados clínicos
                  </p>
                </div>

                {/* Card 2 — Consultas da semana */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-slate-200/70 transition">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Consultas da Semana
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800">
                      {loading ? '...' : metrics.consultasSemana}
                    </span>
                    <span className="text-xs font-medium text-teal-600">
                      na semana atual
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Atendimentos agendados ou registrados
                  </p>
                </div>

                {/* Card 3 — Pacientes sem retorno */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-slate-200/70 transition flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pacientes Sem Retorno
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ClockAlert className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-extrabold text-slate-800">
                      {loading ? '...' : metrics.pacientesSemRetorno.length}
                    </span>
                    <span className="text-xs font-medium text-amber-600">
                      {metrics.pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'}
                    </span>
                  </div>

                  {/* Lista de pacientes sem retorno */}
                  <div className="flex-1 mt-1 border-t border-slate-100 pt-3">
                    {loading ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Carregando lista...
                      </div>
                    ) : metrics.pacientesSemRetorno.length === 0 ? (
                      <div className="py-6 flex flex-col items-center justify-center text-center">
                        <UserCheck className="w-8 h-8 text-emerald-500/60 mb-2" />
                        <p className="text-xs font-medium text-slate-600">
                          Nenhum paciente sem retorno no momento
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Todos os pacientes estão com acompanhamento em dia!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {metrics.pacientesSemRetorno.map((p: PacienteSemRetorno) => (
                          <button
                            key={p.id}
                            onClick={() => handleNavigateToPaciente(p.id)}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition group flex items-center justify-between cursor-pointer"
                          >
                            <div className="truncate mr-2">
                              <span className="text-xs font-bold text-slate-800 group-hover:text-amber-800 block truncate">
                                {p.nome}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                Última consulta: {new Date(p.ultima_consulta).toLocaleDateString('pt-BR')} ({p.dias_sem_consulta} dias atrás)
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações complementares da sessão */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 flex items-start gap-3.5">
                <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <span className="font-semibold block text-emerald-950 mb-0.5">
                    Sincronização Neon em tempo real
                  </span>
                  As métricas acima filtram exclusivamente os registros vinculados à sua conta de nutricionista (<code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">{user?.email}</code>). Qualquer nova consulta ou paciente cadastrado refletirá instantaneamente nos cards.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
