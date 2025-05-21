// @ts-ignore: Deno runtime handles remote module imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore: Deno handles npm imports internally
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
// @ts-ignore
import { OpenAI } from 'npm:openai@4.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, assistantId, userId } = await req.json();

    if (!message || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: assistantData, error: assistantError } = await supabase
      .from('assistant_settings')
      .select('*')
      .eq('id', assistantId)
      .single();

    if (assistantError) {
      return new Response(JSON.stringify({ error: 'Assistant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id, 
        start_time, 
        end_time, 
        status, 
        professional:professionals(name),
        specialty:specialties(name, duration)
      `)
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
    });

    const systemMessage = `
${assistantData.instructions}

INFORMAÇÕES DO USUÁRIO:
Nome: ${userData?.name || 'Cliente'}
Email: ${userData?.email || 'N/A'}

PRÓXIMOS AGENDAMENTOS:
${
  appointments && appointments.length > 0
    ? appointments.map(
        (apt) =>
          `- ${new Date(apt.start_time).toLocaleDateString()}, ${new Date(
            apt.start_time
          ).toLocaleTimeString()} - ${apt.specialty?.name} com ${apt.professional?.name}`
      ).join('\n')
    : 'Nenhum agendamento próximo.'
}

Hoje é ${new Date().toLocaleDateString()}.
Seja útil e responda às perguntas sobre agendamentos e horários.
    `;

    const { data: chatHistory } = await supabase
      .from('assistant_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    const messages = [
      { role: 'system', content: systemMessage },
      ...(chatHistory || []),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
    });

    const responseContent = completion.choices[0].message.content;

    await supabase.from('assistant_messages').insert([
      {
        user_id: userId,
        assistant_id: assistantId,
        role: 'user',
        content: message,
      },
      {
        user_id: userId,
        assistant_id: assistantId,
        role: 'assistant',
        content: responseContent,
      },
    ]);

    return new Response(JSON.stringify({ content: responseContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
