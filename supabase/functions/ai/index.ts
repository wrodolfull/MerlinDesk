import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'npm:openai@4.28.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Set the user's JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('openai_key, deepseek_key')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      throw new Error('Failed to fetch user settings');
    }

    const { provider, model, temperature, maxTokens, trainingData, prompt } = await req.json();

    let completion;

    if (provider === 'openai') {
      if (!settings.openai_key) {
        throw new Error('OpenAI API key not configured in user settings');
      }

      const openai = new OpenAI({
        apiKey: settings.openai_key,
      });

      completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: trainingData }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      });
    } else if (provider === 'deepseek') {
      if (!settings.deepseek_key) {
        throw new Error('DeepSeek API key not configured in user settings');
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.deepseek_key}`,
        },
        body: JSON.stringify({
          model: model === 'deepseek-chat' ? 'deepseek-chat-v1' : 'deepseek-coder-v1',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: trainingData }
          ],
          temperature: parseFloat(temperature),
          max_tokens: parseInt(maxTokens),
          stream: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `DeepSeek API request failed with status ${response.status}`
        );
      }

      completion = await response.json();
    } else {
      throw new Error('Invalid provider');
    }

    return new Response(
      JSON.stringify({
        text: provider === 'openai' 
          ? completion.choices[0].message.content
          : completion.choices[0].message.content,
        usage: completion.usage
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('AI training error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during AI training'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});