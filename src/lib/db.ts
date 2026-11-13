import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL || '';

export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function syncNutricionista(id: string, nome: string, email: string) {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO public.nutricionistas (id, nome, email, created_at)
      VALUES (${id}, ${nome}, ${email}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET nome = EXCLUDED.nome,
          email = EXCLUDED.email;
    `;
  } catch (error) {
    console.error('Erro ao sincronizar nutricionista no banco:', error);
  }
}

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  ultima_consulta: string;
  dias_sem_consulta: number;
}

export interface DashboardMetrics {
  totalPacientes: number;
  consultasSemana: number;
  pacientesSemRetorno: PacienteSemRetorno[];
}

export interface Paciente {
  id: string;
  nutricionista_id: string;
  nome: string;
  data_nascimento?: string | null;
  sexo?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  peso_inicial?: number | null;
  altura?: number | null;
  objetivos?: string[] | null;
  objetivo_texto?: string | null;
  nivel_atividade?: string | null;
  patologias?: string[] | null;
  restricoes_alimentares?: string[] | null;
  alergias?: string[] | null;
  medicamentos?: string | null;
  suplementos?: string | null;
  refeicoes_por_dia?: number | null;
  horario_acorda?: string | null;
  horario_dorme?: string | null;
  litros_agua?: number | null;
  atividade_fisica?: boolean | null;
  atividade_fisica_descricao?: string | null;
  observacoes?: string | null;
  created_at?: string;
  ultima_consulta?: string | null;
}

export type NovoPacienteInput = Omit<Paciente, 'id' | 'created_at' | 'ultima_consulta'>;

export async function getDashboardData(nutricionistaId: string): Promise<DashboardMetrics> {
  if (!sql || !nutricionistaId) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }

  try {
    // 1. Total de pacientes cadastrados pela nutricionista logada
    const countPacientesResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM public.pacientes
      WHERE nutricionista_id = ${nutricionistaId};
    `;
    const totalPacientes = countPacientesResult[0]?.total ?? 0;

    // 2. Número de consultas registradas na semana atual
    const countConsultasResult = await sql`
      SELECT COUNT(c.id)::int AS total
      FROM public.consultas c
      INNER JOIN public.pacientes p ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutricionistaId}
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
        AND c.data_consulta <= date_trunc('week', CURRENT_DATE) + INTERVAL '6 days';
    `;
    const consultasSemana = countConsultasResult[0]?.total ?? 0;

    // 3. Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
    const semRetornoResult = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          c.paciente_id,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS max_proximo_retorno
        FROM public.consultas c
        INNER JOIN public.pacientes p ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutricionistaId}
        GROUP BY c.paciente_id
      )
      SELECT 
        p.id,
        p.nome,
        p.telefone,
        p.email,
        uc.ultima_consulta::text AS ultima_consulta,
        (CURRENT_DATE - uc.ultima_consulta)::int AS dias_sem_consulta
      FROM ultimas_consultas uc
      INNER JOIN public.pacientes p ON uc.paciente_id = p.id
      WHERE uc.ultima_consulta < CURRENT_DATE - INTERVAL '30 days'
        AND (uc.max_proximo_retorno IS NULL OR uc.max_proximo_retorno < CURRENT_DATE)
      ORDER BY uc.ultima_consulta ASC;
    `;

    const pacientesSemRetorno: PacienteSemRetorno[] = semRetornoResult.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      ultima_consulta: row.ultima_consulta,
      dias_sem_consulta: row.dias_sem_consulta,
    }));

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno,
    };
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard do Neon:', error);
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }
}

export async function getPacientes(nutricionistaId: string): Promise<Paciente[]> {
  if (!sql || !nutricionistaId) return [];

  try {
    const rows = await sql`
      SELECT 
        p.*,
        (
          SELECT MAX(c.data_consulta)::text
          FROM public.consultas c
          WHERE c.paciente_id = p.id
        ) AS ultima_consulta
      FROM public.pacientes p
      WHERE p.nutricionista_id = ${nutricionistaId}
      ORDER BY p.nome ASC;
    `;

    return (rows as any[]) || [];
  } catch (error) {
    console.error('Erro ao buscar lista de pacientes:', error);
    return [];
  }
}

export async function getPacienteById(id: string, nutricionistaId: string): Promise<Paciente | null> {
  if (!sql || !id || !nutricionistaId) return null;

  try {
    const rows = await sql`
      SELECT 
        p.*,
        (
          SELECT MAX(c.data_consulta)::text
          FROM public.consultas c
          WHERE c.paciente_id = p.id
        ) AS ultima_consulta
      FROM public.pacientes p
      WHERE p.id = ${id} AND p.nutricionista_id = ${nutricionistaId};
    `;

    return (rows[0] as Paciente) || null;
  } catch (error) {
    console.error('Erro ao buscar paciente por id:', error);
    return null;
  }
}

export async function createPaciente(data: NovoPacienteInput): Promise<Paciente> {
  if (!sql) throw new Error('Conexão com banco não configurada');

  const rows = await sql`
    INSERT INTO public.pacientes (
      nutricionista_id,
      nome,
      data_nascimento,
      sexo,
      telefone,
      whatsapp,
      email,
      peso_inicial,
      altura,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    ) VALUES (
      ${data.nutricionista_id},
      ${data.nome.trim()},
      ${data.data_nascimento || null},
      ${data.sexo || null},
      ${data.telefone || null},
      ${data.whatsapp || null},
      ${data.email || null},
      ${data.peso_inicial != null && !isNaN(Number(data.peso_inicial)) ? Number(data.peso_inicial) : null},
      ${data.altura != null && !isNaN(Number(data.altura)) ? Number(data.altura) : null},
      ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null},
      ${data.objetivo_texto || null},
      ${data.nivel_atividade || null},
      ${data.patologias && data.patologias.length > 0 ? data.patologias : null},
      ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null},
      ${data.alergias && data.alergias.length > 0 ? data.alergias : null},
      ${data.medicamentos || null},
      ${data.suplementos || null},
      ${data.refeicoes_por_dia != null && !isNaN(Number(data.refeicoes_por_dia)) ? Number(data.refeicoes_por_dia) : null},
      ${data.horario_acorda || null},
      ${data.horario_dorme || null},
      ${data.litros_agua != null && !isNaN(Number(data.litros_agua)) ? Number(data.litros_agua) : null},
      ${data.atividade_fisica ?? null},
      ${data.atividade_fisica_descricao || null},
      ${data.observacoes || null}
    )
    RETURNING *;
  `;

  return rows[0] as Paciente;
}
