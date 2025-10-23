import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se estamos no lado do cliente ou se as variáveis estão disponíveis
const isClient = typeof window !== 'undefined';
const hasCredentials = supabaseUrl && supabaseAnonKey;

if (!hasCredentials && isClient) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Cria cliente apenas se tivermos as credenciais ou se estivermos no servidor
let supabase: any = null;

if (hasCredentials) {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
} else if (!isClient) {
  // Durante o build do servidor, cria um cliente mock para evitar erros
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    }),
    removeChannel: () => {},
  };
}

export { supabase };

