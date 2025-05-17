import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

interface TrainingConfig {
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
  trainingData: string;
  prompt: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const config: TrainingConfig = await req.json();

    // Validate the request body
    if (!config.model || !config.provider || !config.trainingData || !config.prompt) {
      throw new Error('Missing required fields');
    }

    // Here you would typically make a call to your AI provider's API
    // For now, we'll simulate a successful training response
    const response = {
      status: 'success',
      message: 'Training completed successfully',
      config: {
        model: config.model,
        provider: config.provider,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders },
        status: error.message === 'Unauthorized' ? 401 : 500,
      },
    );
  }
});