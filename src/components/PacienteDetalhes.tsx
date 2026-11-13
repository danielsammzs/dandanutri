import React, { useEffect, useState } from 'react';
import { sql, type Paciente } from '../lib/db';
import { calculateAge, calculateIMC, formatDateBR } from '../lib/utils';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Scale,
  Ruler,
  Activity,
  HeartPulse,
  Droplets,
  Utensils,
  User,
  MessageCircle,
  FileText,
} from 'lucide-react';

interface PacienteDetalhesProps {
  pacienteId: string;
  nutricionistaId: string;
  onVoltar: () => void;
}

export const PacienteDetalhes: React.FC<PacienteDetalhesProps> = ({
  pacienteId,
  nutricionistaId,
  onVoltar,
}) => {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!sql) return;
      setLoading(true);
      try {
        const pRes = await sql`
          SELECT * FROM public.pacientes 
          WHERE id = ${pacienteId} AND nutricionista_id = ${nutricionistaId};
        `;
        const cRes = await sql`
          SELECT * FROM public.consultas 
          WHERE paciente_id = ${pacienteId}
          ORDER BY data_consulta DESC;
        `;

        if (isMounted) {
          setPaciente((pRes[0] as Paciente) || null);
          setConsultas(cRes || []);
        }
      } catch (err) {
        console.error('Erro ao carregar paciente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [pacienteId, nutricionistaId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">Carregando prontuário do paciente...</span>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Paciente não encontrado</h3>
        <p className="text-xs text-slate-500 mb-6">
          O registro solicitado não existe ou você não possui permissão para acessá-lo.
        </p>
        <button
          onClick={onVoltar}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Lista de Pacientes
        </button>
      </div>
    );
  }

  const idade = calculateAge(paciente.data_nascimento);
  const imcInfo = calculateIMC(paciente.peso_inicial || 0, paciente.altura || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Botão de retorno e cabeçalho principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onVoltar}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
            title="Voltar à lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {paciente.nome}
              </h1>
              {paciente.sexo && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {paciente.sexo}
                </span>
              )}
              {idade !== null && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {idade} anos
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastrado em {formatDateBR(paciente.created_at)}
            </p>
          </div>
        </div>

        {/* Ações de Contato Rápido */}
        <div className="flex items-center gap-2 flex-wrap">
          {(paciente.whatsapp || paciente.telefone) && (
            <a
              href={`https://wa.me/55${(paciente.whatsapp || paciente.telefone || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          )}
          {paciente.email && (
            <a
              href={`mailto:${paciente.email}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition border border-slate-200 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>E-mail</span>
            </a>
          )}
        </div>
      </div>

      {/* Cards de Métricas e Indicadores Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Peso */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Peso Inicial</span>
            <span className="text-base font-bold text-slate-800">
              {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '-'}
            </span>
          </div>
        </div>

        {/* Altura */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Altura</span>
            <span className="text-base font-bold text-slate-800">
              {paciente.altura ? `${paciente.altura} cm` : '-'}
            </span>
          </div>
        </div>

        {/* IMC */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">IMC</span>
            {imcInfo.imc ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-slate-800">{imcInfo.imc}</span>
                <span className="text-[10px] font-semibold text-emerald-700">
                  {imcInfo.classificacao}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">-</span>
            )}
          </div>
        </div>

        {/* Água por dia */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Água / Dia</span>
            <span className="text-base font-bold text-slate-800">
              {paciente.litros_agua ? `${paciente.litros_agua} L` : '-'}
            </span>
          </div>
        </div>

        {/* Refeições por dia */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Refeições / Dia</span>
            <span className="text-base font-bold text-slate-800">
              {paciente.refeicoes_por_dia ? `${paciente.refeicoes_por_dia}x` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal com Dados Clínicos e Hábitos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel 1: Dados Clínicos & Objetivos */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            Perfil Clínico e Nutricional
          </h2>

          {/* Objetivos */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Objetivos
            </span>
            {paciente.objetivos && paciente.objetivos.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {paciente.objetivos.map((obj) => (
                  <span
                    key={obj}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {obj}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">Nenhum objetivo selecionado</span>
            )}

            {paciente.objetivo_texto && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mt-2.5 border border-slate-100">
                {paciente.objetivo_texto}
              </p>
            )}
          </div>

          {/* Nível de Atividade */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Nível de Atividade Física
            </span>
            <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg inline-block">
              {paciente.nivel_atividade || 'Não informado'}
            </span>
          </div>

          {/* Patologias */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Patologias ou Condições de Saúde
            </span>
            {paciente.patologias && paciente.patologias.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {paciente.patologias.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">Nenhuma patologia registrada</span>
            )}
          </div>

          {/* Restrições Alimentares */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Restrições Alimentares
            </span>
            {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {paciente.restricoes_alimentares.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">Nenhuma restrição registrada</span>
            )}
          </div>

          {/* Alergias Alimentares */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Alergias Alimentares
            </span>
            {paciente.alergias && paciente.alergias.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {paciente.alergias.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">Nenhuma alergia registrada</span>
            )}
          </div>

          {/* Medicamentos e Suplementos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Medicamentos Contínuos
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[44px]">
                {paciente.medicamentos || 'Nenhum'}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Suplementos em Uso
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[44px]">
                {paciente.suplementos || 'Nenhum'}
              </p>
            </div>
          </div>
        </div>

        {/* Painel 2: Hábitos de Vida & Rotina */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              Rotina e Hábitos de Vida
            </h2>

            {/* Sono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Horário que Acorda
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {paciente.horario_acorda || '-'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Horário que Dorme
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {paciente.horario_dorme || '-'}
                </span>
              </div>
            </div>

            {/* Atividade Física */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Prática de Atividade Física
              </span>
              {paciente.atividade_fisica ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-800 block mb-0.5">
                    ✓ Pratica atividade física
                  </span>
                  <p className="text-xs text-emerald-900">
                    {paciente.atividade_fisica_descricao || 'Sem descrição adicional de frequência.'}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-xs text-slate-500 font-medium">
                    Não pratica atividade física regular no momento.
                  </span>
                </div>
              )}
            </div>

            {/* Observações Gerais */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Observações Gerais
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                {paciente.observacoes || 'Nenhuma observação registrada.'}
              </p>
            </div>
          </div>

          {/* Painel: Histórico de Consultas */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Histórico de Consultas ({consultas.length})
              </span>
            </h3>

            {consultas.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-600">Nenhuma consulta realizada ainda</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  As consultas e medições registradas aparecerão em ordem cronológica aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {consultas.map((c) => (
                  <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">
                        {formatDateBR(c.data_consulta)}
                      </span>
                      {c.observacoes && (
                        <p className="text-xs text-slate-500 mt-0.5">{c.observacoes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      {c.peso && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {c.peso} kg
                        </span>
                      )}
                      {c.proximo_retorno && (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                          Retorno: {formatDateBR(c.proximo_retorno)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
