// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno&no-check'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient()
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { record: user } = await req.json()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Usuário não fornecido.' }), { status: 400, headers: corsHeaders })
  }

  try {
    // 1. Criar cliente no Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.raw_user_meta_data?.full_name,
      metadata: {
        user_id: user.id
      }
    })

    // 2. Inicializar Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Atualizar a tabela 'user_settings' com o ID do cliente Stripe
    // A tabela 'user_settings' precisa ter uma política que permita a atualização pela service_role
    const { error } = await supabaseAdmin
      .from('user_settings')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', user.id) // Supondo que 'user_id' em 'user_settings' referencia 'auth.users.id'

    if (error) {
      console.error('Erro ao atualizar user_settings no Supabase:', error)
      throw error
    }

    return new Response(JSON.stringify({
      message: `Cliente Stripe criado e salvo para o usuário ${user.id}`,
      stripe_customer_id: customer.id
    }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('Erro ao processar a criação do cliente Stripe:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
}) 