import { createAuthClient } from '@neondatabase/auth';

const rawAuthUrl = import.meta.env.VITE_NEON_AUTH_URL || '';
// Garantir que a baseURL use estritamente sem barras residuais no final
const baseURL = rawAuthUrl.replace(/\/+$/, '');

export const authClient = createAuthClient(baseURL);
