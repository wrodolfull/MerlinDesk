// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno&no-check'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient()
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let event
  try {
    event = await stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  try {
    const { metadata, id, customer, status, items } = event.data.object
    const userId = metadata?.user_id || (await stripe.customers.retrieve(customer)).metadata.user_id
    
    // VERIFICAÇÃO CRUCIAL: Checar se o usuário ainda existe no Supabase
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !user) {
      console.warn(`Webhook recebido para usuário não existente: ${userId}. Assinatura: ${id}.`)
      
      // Se o usuário não existe, cancela a assinatura no Stripe para evitar cobranças futuras
      if (event.type.startsWith('customer.subscription.')) {
        await stripe.subscriptions.cancel(id)
        console.log(`Assinatura órfã ${id} cancelada no Stripe.`)
      }

      // Retorna sucesso para o Stripe não tentar reenviar o webhook
      return new Response(JSON.stringify({ message: "Usuário não encontrado, assinatura órfã tratada." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Se o usuário existe, continua o processo normal
    const priceId = items.data[0].price.id
    
    const subscriptionData = {
      user_id: userId,
      status,
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      stripe_price_id: priceId,
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.resumed':
      case 'customer.subscription.trial_will_end':
        await supabaseAdmin
          .from('user_subscriptions')
          .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })
        break
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', id)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
}) 