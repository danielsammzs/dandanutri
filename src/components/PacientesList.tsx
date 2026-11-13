import React, { useCallback, useEffect, useState } from 'react';
import { getPacientes, type Paciente } from '../lib/db';
import { formatDateBR } from '../lib/utils';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Target,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react';

interface PacientesListProps {
  nutricionistaId: string;
  onSelectPaciente: (id: string) => void;
  onNovoPaciente: () => void;
}

export const PacientesList: React.FC<PacientesListProps> = ({
  nutricionistaId,
  onSelectPaciente,
  onNovoPaciente,
}) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const carregarPacientes = useCallback(async (isManual = false) => {
    if (!nutricionistaId) return;
    if (isManual) {
      setRefreshing(true);
    }

    try {
      const data = await getPacientes(nutricionistaId);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao listar pacientes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [nutricionistaId]);

  useEffect(() => {
    carregarPacientes();
  }, [carregarPacientes]);

  const filtrados = pacientes.filter((p) => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    const nomeMatch = p.nome?.toLowerCase().includes(termo);
    const emailMatch = p.email?.toLowerCase().includes(termo);
    const telMatch = (p.telefone || p.whatsapp || '').includes(termo);
    const objMatch = (p.objetivos || []).some((obj) => obj.toLowerCase().includes(termo));
    return nomeMatch || emailMatch || telMatch || objMatch;
  });

  const getObjetivoExibicao = (p: Paciente) => {
    if (p.objetivos && p.objetivos.length > 0) {
      return p.objetivos.join(', ');
    }
    if (p.objetivo_texto) {
      return p.objetivo_texto;
    }
    return 'Não informado';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Listagem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Pacientes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento completo dos prontuários clínicos sob seus cuidados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => carregarPacientes(true)}
            disabled={refreshing || loading}
            title="Atualizar lista"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={onNovoPaciente}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar paciente por nome..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Conteúdo / Tabela de Pacientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Carregando lista de pacientes...</p>
          </div>
        ) : pacientes.length === 0 ? (
          /* Estado Vazio: Nenhum paciente cadastrado ainda */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Nenhum paciente cadastrado ainda
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Comece agora cadastrando o prontuário do seu primeiro paciente para acompanhar consultas, medidas e evolução.
            </p>
            <button
              onClick={onNovoPaciente}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Primeiro Paciente
            </button>
          </div>
        ) : filtrados.length === 0 ? (
          /* Nenhum paciente correspondente à busca */
          <div className="p-10 text-center text-slate-500">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">
              Nenhum paciente encontrado para "{busca}"
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tente pesquisar por outro termo ou limpe o campo de busca.
            </p>
            <button
              onClick={() => setBusca('')}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          /* Lista com pacientes */
          <div className="divide-y divide-slate-100">
            {/* Header das colunas para telas médias e grandes */}
            <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Paciente</div>
              <div className="col-span-4">Objetivo</div>
              <div className="col-span-3 text-right">Última Consulta</div>
            </div>

            {filtrados.map((p) => {
              const objetivoTexto = getObjetivoExibicao(p);
              const dataUltimaConsulta = p.ultima_consulta
                ? formatDateBR(p.ultima_consulta)
                : 'Nenhuma consulta';

              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPaciente(p.id)}
                  className="w-full px-6 py-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 hover:bg-emerald-50/40 transition text-left cursor-pointer group"
                >
                  {/* Coluna 1: Nome e Contato */}
                  <div className="col-span-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                      {p.nome?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700 transition truncate">
                        {p.nome}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        {(p.whatsapp || p.telefone) && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {p.whatsapp || p.telefone}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {p.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Objetivo */}
                  <div className="col-span-4 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 md:hidden" />
                    <span className="text-xs text-slate-600 font-medium line-clamp-1">
                      {objetivoTexto}
                    </span>
                  </div>

                  {/* Coluna 3: Data da Última Consulta e Ação */}
                  <div className="col-span-3 flex items-center justify-between md:justify-end gap-3 text-right">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className={p.ultima_consulta ? 'font-medium text-slate-700' : 'text-slate-400 italic'}>
                        {dataUltimaConsulta}
                      </span>
                    </div>

                    <div className="flex items-center text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
