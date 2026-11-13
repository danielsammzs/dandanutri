import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatTimeInput(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.length === 1 || digits.length === 2) {
    const h = parseInt(digits, 10);
    if (h >= 0 && h <= 23) {
      return `${String(h).padStart(2, '0')}:00`;
    }
  } else if (digits.length === 3) {
    const h = parseInt(digits.slice(0, 1), 10);
    const m = parseInt(digits.slice(1), 10);
    if (h <= 23 && m <= 59) {
      return `0${h}:${String(m).padStart(2, '0')}`;
    }
  } else if (digits.length === 4) {
    const h = parseInt(digits.slice(0, 2), 10);
    const m = parseInt(digits.slice(2, 4), 10);
    if (h <= 23 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return trimmed;
}

export function calculateAge(birthDateString?: string | null): number | null {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function calculateIMC(pesoKg: number | string, alturaCm: number | string): {
  imc: number | null;
  classificacao: string;
  colorClass: string;
} {
  const p = typeof pesoKg === 'number' ? pesoKg : parseFloat(pesoKg);
  const a = typeof alturaCm === 'number' ? alturaCm : parseFloat(alturaCm);

  if (!p || !a || isNaN(p) || isNaN(a) || p <= 0 || a <= 0) {
    return { imc: null, classificacao: '', colorClass: '' };
  }

  // Se altura > 3 metros, consideramos cm (ex: 170cm = 1.70m)
  const alturaMetros = a > 3 ? a / 100 : a;
  const imcRaw = p / (alturaMetros * alturaMetros);
  const imc = Math.round(imcRaw * 10) / 10;

  if (imc < 18.5) {
    return { imc, classificacao: 'Abaixo do peso', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else if (imc < 25) {
    return { imc, classificacao: 'Peso normal', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  } else if (imc < 30) {
    return { imc, classificacao: 'Sobrepeso', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else if (imc < 35) {
    return { imc, classificacao: 'Obesidade Grau I', colorClass: 'text-orange-700 bg-orange-50 border-orange-200' };
  } else if (imc < 40) {
    return { imc, classificacao: 'Obesidade Grau II', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' };
  } else {
    return { imc, classificacao: 'Obesidade Grau III', colorClass: 'text-red-800 bg-red-100 border-red-300' };
  }
}

export function formatDateBR(dateString?: string | null): string {
  if (!dateString) return '-';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}
