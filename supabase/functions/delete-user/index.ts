import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Definir a interface para os dados da requisição
interface DeleteUserPayload {
  user_id: string;
}

// Cabeçalhos CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratar requisição OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Inicializar o cliente Supabase com a role de serviço para ter privilégios de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Extrair o ID do usuário do corpo da requisição
    const payload: DeleteUserPayload = await req.json();
    const userId = payload.user_id;

    if (!userId) {
      throw new Error("O ID do usuário é obrigatório.");
    }

    // 3. Cancelar a assinatura ativa do usuário (exemplo com a tabela user_subscriptions)
    // Esta parte pode precisar de lógica adicional para interagir com um gateway de pagamento real (Stripe, MercadoPago, etc.)
    const { error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subscriptionError) {
      console.error(`Erro ao cancelar assinatura do usuário ${userId}:`, subscriptionError);
      // Decidir se o processo deve parar ou continuar mesmo se o cancelamento falhar
    }

    // 4. Deletar o usuário do sistema de autenticação do Supabase
    // Isso deve acionar um ON DELETE CASCADE no banco de dados para deletar os dados associados
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error(`Erro ao deletar usuário ${userId} da autenticação:`, deleteError);
      throw new Error(`Falha ao deletar usuário: ${deleteError.message}`);
    }

    // 5. Retornar uma resposta de sucesso
    return new Response(JSON.stringify({ message: `Usuário ${userId} deletado com sucesso.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erro na função delete-user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 