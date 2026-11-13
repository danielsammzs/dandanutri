import React from 'react';
import { authClient } from '../lib/auth-client';
import { Activity, LogOut, Users, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">Feriani Nutri</span>
              <span className="text-xs text-slate-500 font-medium leading-none block">Gestão Nutricional Integrada</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <span className="text-sm font-semibold text-slate-800 block">
                {user?.name || 'Nutricionista'}
              </span>
              <span className="text-xs text-slate-500 block">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer border border-slate-200 hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Bem-vindo(a), {user?.name || 'Nutricionista'}! 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Seu painel clínico de atendimento está pronto e conectado ao ambiente seguro.
          </p>
        </div>

        {/* Cards de Status / Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pacientes Ativos</span>
              <span className="text-2xl font-bold text-slate-800">0</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Consultas Realizadas</span>
              <span className="text-2xl font-bold text-slate-800">0</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Planos Alimentares</span>
              <span className="text-2xl font-bold text-slate-800">0</span>
            </div>
          </div>
        </div>

        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-700/20">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-emerald-200" />
            <div>
              <h3 className="font-semibold text-lg">Banco de dados configurado & Autenticação ativa</h3>
              <p className="text-emerald-100 text-sm mt-1">
                Todas as tabelas de prontuário (pacientes, consultas, planos alimentares) e regras de segurança (RLS) já estão ativas para a sua conta.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
