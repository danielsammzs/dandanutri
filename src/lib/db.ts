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
