import React, { useState } from 'react';
import { createPaciente, type NovoPacienteInput } from '../lib/db';
import {
  formatPhone,
  formatTimeInput,
  calculateAge,
  calculateIMC,
} from '../lib/utils';
import {
  ArrowLeft,
  User,
  HeartPulse,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  Clock,
} from 'lucide-react';

interface NovoPacienteFormProps {
  nutricionistaId: string;
  onVoltar: () => void;
  onSuccess: (pacienteId: string) => void;
}

type TabKey = 'pessoal' | 'clinico' | 'habitos';

const OBJETIVOS_PADRAO = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
];

const NIVEIS_ATIVIDADE = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
];

const PATOLOGIAS_PADRAO = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
];

const RESTRICOES_PADRAO = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
];

const ALERGIAS_PADRAO = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
];

export const NovoPacienteForm: React.FC<NovoPacienteFormProps> = ({
  nutricionistaId,
  onVoltar,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('pessoal');
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroNome, setErroNome] = useState(false);

  // Aba 1: Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<string>('Feminino');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Aba 2: Clínico
  const [peso, setPeso] = useState<string>('');
  const [altura, setAltura] = useState<string>('');
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState<string>('Moderadamente ativo');

  const [patologias, setPatologias] = useState<string[]>([]);
  const [novaPatologia, setNovaPatologia] = useState('');

  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [novaRestricao, setNovaRestricao] = useState('');

  const [alergias, setAlergias] = useState<string[]>([]);
  const [novaAlergia, setNovaAlergia] = useState('');

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Aba 3: Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState<string>('');
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState<boolean>(false);
  const [atividadeFisicaDescricao, setAtividadeFisicaDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Cálculos automáticos
  const idadeCalculada = calculateAge(dataNascimento);
  const imcInfo = calculateIMC(peso, altura);

  // Manipuladores de Lista com "Nenhum" e tags customizadas
  const handleToggleMultiItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    // Se selecionou um item normal, remove 'Nenhum'
    const semNenhum = list.filter((i) => i !== 'Nenhum');
    if (semNenhum.includes(item)) {
      setList(semNenhum.filter((i) => i !== item));
    } else {
      setList([...semNenhum, item]);
    }
  };

  const handleAddCustomTag = (
    novoItem: string,
    setNovoItem: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = novoItem.trim();
    if (!trimmed) return;
    if (!list.includes(trimmed)) {
      const semNenhum = list.filter((i) => i !== 'Nenhum');
      setList([...semNenhum, trimmed]);
    }
    setNovoItem('');
  };

  const handleRemoveCustomTag = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((i) => i !== item));
  };

  // Envio do formulário
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!nome.trim()) {
      setActiveTab('pessoal');
      setErroNome(true);
      return;
    }

    setSalvando(true);
    setErroNome(false);

    try {
      const payload: NovoPacienteInput = {
        nutricionista_id: nutricionistaId,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        telefone: telefone || null,
        whatsapp: whatsapp || null,
        email: email ? email.trim() : null,
        peso_inicial: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        objetivos: objetivos.length > 0 ? objetivos : null,
        objetivo_texto: objetivoTexto ? objetivoTexto.trim() : null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias.length > 0 ? patologias : null,
        restricoes_alimentares: restricoes.length > 0 ? restricoes : null,
        alergias: alergias.length > 0 ? alergias : null,
        medicamentos: medicamentos ? medicamentos.trim() : null,
        suplementos: suplementos ? suplementos.trim() : null,
        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
        horario_acorda: horarioAcorda || null,
        horario_dorme: horarioDorme || null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua) : null,
        atividade_fisica: praticaAtividadeFisica,
        atividade_fisica_descricao: praticaAtividadeFisica
          ? atividadeFisicaDescricao.trim() || null
          : null,
        observacoes: observacoes ? observacoes.trim() : null,
      };

      const novoPaciente = await createPaciente(payload);

      setMensagemSucesso('Paciente cadastrado com sucesso! Redirecionando para o perfil...');

      setTimeout(() => {
        onSuccess(novoPaciente.id);
      }, 1200);
    } catch (err: any) {
      console.error('Erro ao salvar paciente:', err);
      alert('Erro ao salvar paciente: ' + (err?.message || 'Verifique sua conexão.'));
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast / Mensagem de Sucesso Flutuante */}
      {mensagemSucesso && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{mensagemSucesso}</span>
        </div>
      )}

      {/* Topo / Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
            title="Voltar à lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Novo Paciente
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre a ficha inicial do paciente organizada em 3 etapas clínicas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={salvando}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-60"
          >
            {salvando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Paciente</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navegação de Abas (Pessoal, Clínico, Hábitos) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pessoal'
                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'pessoal' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>1. Pessoal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'clinico'
                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'clinico' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>2. Clínico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'habitos'
                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <HeartPulse className={`w-4 h-4 ${activeTab === 'habitos' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>3. Hábitos</span>
          </button>
        </div>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* ABA 1: PESSOAL */}
        {activeTab === 'pessoal' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Dados Pessoais
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Identificação do paciente e formas de contato direto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome completo (Obrigatório) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (erroNome) setErroNome(false);
                  }}
                  placeholder="Ex: Maria Luiza da Silva"
                  className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                    erroNome
                      ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {erroNome && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> O nome completo é obrigatório.
                  </p>
                )}
              </div>

              {/* Data de Nascimento + Cálculo de Idade */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Data de Nascimento
                  </label>
                  {idadeCalculada !== null && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Sexo (Seleção única: Feminino, Masculino, Outro) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sexo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Feminino', 'Masculino', 'Outro'].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setSexo(item)}
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                        sexo === item
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                          : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp
                  </label>
                  {telefone && telefone !== whatsapp && (
                    <button
                      type="button"
                      onClick={() => setWhatsapp(telefone)}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
                    >
                      Copiar do telefone
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@exemplo.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Botão de avanço para a próxima aba */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                <span>Próximo: Dados Clínicos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 'clinico' && (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Dados Clínicos e Antropométricos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Medidas basais, objetivos de saúde, condições prévias e alergias.
              </p>
            </div>

            {/* Linha 1: Peso, Altura e IMC Automático */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Peso atual em kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Peso Atual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="400"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ex: 70.5"
                    className="w-full pl-4 pr-12 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    kg
                  </span>
                </div>
              </div>

              {/* Altura em cm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Altura
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="30"
                    max="260"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                    placeholder="Ex: 172"
                    className="w-full pl-4 pr-12 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    cm
                  </span>
                </div>
              </div>

              {/* IMC Calculado (Somente Leitura) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  IMC (Automático)
                </label>
                <div className="h-[42px] px-4 py-2 bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between">
                  {imcInfo.imc !== null ? (
                    <>
                      <span className="text-sm font-bold text-slate-800">
                        {imcInfo.imc} <span className="text-xs font-normal text-slate-400">kg/m²</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${imcInfo.colorClass}`}
                      >
                        {imcInfo.classificacao}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Preencha peso e altura
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Linha 2: Objetivos (Múltipla escolha + campo livre) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Objetivo do Paciente
              </label>
              <div className="flex flex-wrap gap-2">
                {OBJETIVOS_PADRAO.map((obj) => {
                  const selecionado = objetivos.includes(obj);
                  return (
                    <button
                      type="button"
                      key={obj}
                      onClick={() => {
                        if (selecionado) {
                          setObjetivos(objetivos.filter((i) => i !== obj));
                        } else {
                          setObjetivos([...objetivos, obj]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        selecionado
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                          : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {obj}
                    </button>
                  );
                })}
              </div>

              {/* Campo livre adicional */}
              <input
                type="text"
                value={objetivoTexto}
                onChange={(e) => setObjetivoTexto(e.target.value)}
                placeholder="Detalhes adicionais sobre o objetivo (ex: perder 5kg até o final do ano)..."
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            {/* Linha 3: Nível de Atividade Física (Seleção única) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nível de Atividade Física
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {NIVEIS_ATIVIDADE.map((nivel) => (
                  <button
                    type="button"
                    key={nivel}
                    onClick={() => setNivelAtividade(nivel)}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                      nivelAtividade === nivel
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>

            {/* Linha 4: Patologias ou Condições de Saúde */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Patologias ou Condições de Saúde
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleMultiItem('Nenhum', patologias, setPatologias)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    patologias.includes('Nenhum')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {PATOLOGIAS_PADRAO.map((item) => {
                  const sel = patologias.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleToggleMultiItem(item, patologias, setPatologias)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        sel
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
                {/* Exibir tags customizadas adicionadas */}
                {patologias
                  .filter((p) => p !== 'Nenhum' && !PATOLOGIAS_PADRAO.includes(p))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTag(tag, patologias, setPatologias)}
                        className="hover:bg-emerald-700 rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              {/* Campo para adicionar livremente */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={novaPatologia}
                  onChange={(e) => setNovaPatologia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(novaPatologia, setNovaPatologia, patologias, setPatologias);
                    }
                  }}
                  placeholder="Adicionar outra patologia..."
                  className="flex-1 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag(novaPatologia, setNovaPatologia, patologias, setPatologias)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Linha 5: Restrições Alimentares */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Restrições Alimentares
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleMultiItem('Nenhum', restricoes, setRestricoes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    restricoes.includes('Nenhum')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {RESTRICOES_PADRAO.map((item) => {
                  const sel = restricoes.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleToggleMultiItem(item, restricoes, setRestricoes)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        sel
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
                {restricoes
                  .filter((r) => r !== 'Nenhum' && !RESTRICOES_PADRAO.includes(r))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTag(tag, restricoes, setRestricoes)}
                        className="hover:bg-emerald-700 rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={novaRestricao}
                  onChange={(e) => setNovaRestricao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(novaRestricao, setNovaRestricao, restricoes, setRestricoes);
                    }
                  }}
                  placeholder="Adicionar outra restrição..."
                  className="flex-1 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag(novaRestricao, setNovaRestricao, restricoes, setRestricoes)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Linha 6: Alergias Alimentares */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Alergias Alimentares
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleMultiItem('Nenhum', alergias, setAlergias)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    alergias.includes('Nenhum')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {ALERGIAS_PADRAO.map((item) => {
                  const sel = alergias.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleToggleMultiItem(item, alergias, setAlergias)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        sel
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
                {alergias
                  .filter((a) => a !== 'Nenhum' && !ALERGIAS_PADRAO.includes(a))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTag(tag, alergias, setAlergias)}
                        className="hover:bg-emerald-700 rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={novaAlergia}
                  onChange={(e) => setNovaAlergia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag(novaAlergia, setNovaAlergia, alergias, setAlergias);
                    }
                  }}
                  placeholder="Adicionar outra alergia..."
                  className="flex-1 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag(novaAlergia, setNovaAlergia, alergias, setAlergias)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Linha 7: Medicamentos Contínuos e Suplementos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Medicamentos Contínuos
                </label>
                <textarea
                  rows={3}
                  value={medicamentos}
                  onChange={(e) => setMedicamentos(e.target.value)}
                  placeholder="Ex: Losartana 50mg pela manhã, Omeprazol..."
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Suplementos em Uso
                </label>
                <textarea
                  rows={3}
                  value={suplementos}
                  onChange={(e) => setSuplementos(e.target.value)}
                  placeholder="Ex: Whey protein pós-treino, Creatina 5g, Vitamina D..."
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>

            {/* Navegação entre abas */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('pessoal')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar: Pessoal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('habitos')}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                <span>Próximo: Hábitos de Vida</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ABA 3: HÁBITOS */}
        {activeTab === 'habitos' && (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                Hábitos de Vida e Rotina
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rotina diária, ingestão hídrica, sono e atividade física.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantas refeições faz por dia */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Refeições por Dia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={refeicoesPorDia}
                    onChange={(e) => setRefeicoesPorDia(e.target.value)}
                    placeholder="Ex: 4"
                    className="w-full pl-4 pr-16 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    refeições
                  </span>
                </div>
              </div>

              {/* Quantidade de água por dia */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantidade de Água por Dia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={litrosAgua}
                    onChange={(e) => setLitrosAgua(e.target.value)}
                    placeholder="Ex: 2.5"
                    className="w-full pl-4 pr-16 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    litros
                  </span>
                </div>
              </div>

              {/* Horário que acorda */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Horário que Acorda
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={horarioAcorda}
                    onChange={(e) => setHorarioAcorda(e.target.value)}
                    onBlur={() => setHorarioAcorda(formatTimeInput(horarioAcorda))}
                    placeholder="Ex: 6 ou 630"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digite o número e o sistema converte (ex: 6 → 06:00, 630 → 06:30).
                </p>
              </div>

              {/* Horário que dorme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Horário que Dorme
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={horarioDorme}
                    onChange={(e) => setHorarioDorme(e.target.value)}
                    onBlur={() => setHorarioDorme(formatTimeInput(horarioDorme))}
                    placeholder="Ex: 23 ou 2230"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digite o número e o sistema converte (ex: 23 → 23:00, 2230 → 22:30).
                </p>
              </div>

              {/* Pratica atividade física (sim/não) */}
              <div className="md:col-span-2 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pratica Atividade Física?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPraticaAtividadeFisica(true)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      praticaAtividadeFisica
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPraticaAtividadeFisica(false);
                      setAtividadeFisicaDescricao('');
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      !praticaAtividadeFisica
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {/* Se sim, abre campo de texto: qual atividade e frequência semanal */}
                {praticaAtividadeFisica && (
                  <div className="pt-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Qual atividade e frequência semanal?
                    </label>
                    <input
                      type="text"
                      value={atividadeFisicaDescricao}
                      onChange={(e) => setAtividadeFisicaDescricao(e.target.value)}
                      placeholder="Ex: Musculação 4x por semana e corrida aos sábados"
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                  </div>
                )}
              </div>

              {/* Observações gerais */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações Gerais
                </label>
                <textarea
                  rows={4}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais relevantes, preferências comportamentais, histórico..."
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>

            {/* Navegação e Ação de Salvar Final */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar: Clínico</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={salvando}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-60"
              >
                {salvando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Concluir e Salvar Paciente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

