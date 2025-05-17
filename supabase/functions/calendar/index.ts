import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const calendarId = pathParts[pathParts.length - 2];
    const action = pathParts[pathParts.length - 1];

    if (req.method === 'GET' && action === 'schedule') {
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      if (!startDate || !endDate) {
        return new Response(
          JSON.stringify({ error: 'Missing date parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all professionals for this calendar
      const { data: professionals, error: professionalsError } = await supabaseClient
        .from('professionals')
        .select(`
          id,
          name,
          specialty:specialties(id, name, duration),
          appointments!inner(
            id,
            start_time,
            end_time,
            status,
            client:clients(id, name, email)
          )
        `)
        .eq('calendar_id', calendarId)
        .gte('appointments.start_time', startDate)
        .lte('appointments.start_time', endDate)
        .eq('appointments.status', 'confirmed');

      if (professionalsError) throw professionalsError;

      // Group appointments by date
      const schedule = {};
      professionals?.forEach(professional => {
        professional.appointments?.forEach(appointment => {
          const date = appointment.start_time.split('T')[0];
          if (!schedule[date]) {
            schedule[date] = {
              date,
              professionals: [],
            };
          }
          
          const profIndex = schedule[date].professionals.findIndex(
            p => p.id === professional.id
          );
          
          if (profIndex === -1) {
            schedule[date].professionals.push({
              id: professional.id,
              name: professional.name,
              specialty: professional.specialty,
              appointments: [appointment],
            });
          } else {
            schedule[date].professionals[profIndex].appointments.push(appointment);
          }
        });
      });

      return new Response(
        JSON.stringify({ schedule: Object.values(schedule) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});