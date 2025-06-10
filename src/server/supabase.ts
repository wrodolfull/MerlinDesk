import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase:');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'Definida' : 'Não definida');
  throw new Error('Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Teste de conexão
supabase.from('users').select('count').then(({ error }) => {
  if (error) {
    console.error('❌ Erro na conexão com Supabase:', error.message);
  } else {
    console.log('✅ Conexão com Supabase estabelecida');
  }
});
