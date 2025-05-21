--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.5

-- Started on 2025-05-19 17:58:19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 18 (class 2615 OID 16986)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- TOC entry 28 (class 2615 OID 16987)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- TOC entry 16 (class 2615 OID 16988)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- TOC entry 15 (class 2615 OID 16989)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- TOC entry 11 (class 2615 OID 16990)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- TOC entry 13 (class 2615 OID 16991)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- TOC entry 17 (class 2615 OID 16992)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- TOC entry 12 (class 2615 OID 16993)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- TOC entry 14 (class 2615 OID 16994)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- TOC entry 3 (class 3079 OID 17985)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 4169 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 7 (class 3079 OID 17005)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 4170 (class 0 OID 0)
-- Dependencies: 7
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 6 (class 3079 OID 17036)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 4171 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 5 (class 3079 OID 17073)
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- TOC entry 4172 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- TOC entry 2 (class 3079 OID 17080)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 4173 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 4 (class 3079 OID 17103)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 4174 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1031 (class 1247 OID 17115)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- TOC entry 1034 (class 1247 OID 17122)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- TOC entry 1037 (class 1247 OID 17128)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- TOC entry 1040 (class 1247 OID 17134)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- TOC entry 1043 (class 1247 OID 17142)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- TOC entry 1046 (class 1247 OID 17156)
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- TOC entry 1049 (class 1247 OID 17168)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- TOC entry 1052 (class 1247 OID 17185)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- TOC entry 1055 (class 1247 OID 17188)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- TOC entry 1058 (class 1247 OID 17191)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- TOC entry 323 (class 1255 OID 17192)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- TOC entry 4175 (class 0 OID 0)
-- Dependencies: 323
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 324 (class 1255 OID 17193)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- TOC entry 325 (class 1255 OID 17194)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- TOC entry 4176 (class 0 OID 0)
-- Dependencies: 325
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 321 (class 1255 OID 17195)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- TOC entry 4177 (class 0 OID 0)
-- Dependencies: 321
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 407 (class 1255 OID 17196)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- TOC entry 4178 (class 0 OID 0)
-- Dependencies: 407
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 402 (class 1255 OID 17197)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- TOC entry 4179 (class 0 OID 0)
-- Dependencies: 402
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 360 (class 1255 OID 17198)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- TOC entry 4180 (class 0 OID 0)
-- Dependencies: 360
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 334 (class 1255 OID 17199)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 336 (class 1255 OID 17200)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 400 (class 1255 OID 17201)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- TOC entry 4181 (class 0 OID 0)
-- Dependencies: 400
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 333 (class 1255 OID 17202)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- TOC entry 337 (class 1255 OID 17203)
-- Name: create_default_user_settings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_user_settings() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;


--
-- TOC entry 338 (class 1255 OID 17204)
-- Name: create_free_subscription(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_free_subscription() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  )
  SELECT
    NEW.id,
    id,
    'active',
    now(),
    now() + interval '1 month'
  FROM subscription_plans
  WHERE name = 'Free'
  LIMIT 1;
  RETURN NEW;
END;
$$;


--
-- TOC entry 363 (class 1255 OID 17205)
-- Name: get_available_slots(uuid, uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_available_slots(input_professional_id uuid, input_specialty_id uuid, input_date date) RETURNS TABLE(start_time timestamp without time zone, end_time timestamp without time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  v_day_of_week int;
  v_start time;
  v_end time;
  v_duration int;
  slot_start timestamp;
  slot_end timestamp;
begin
  v_day_of_week := extract(dow from input_date);

  select wh.start_time, wh.end_time
    into v_start, v_end
  from working_hours wh
  where wh.professional_id = input_professional_id
    and wh.day_of_week = v_day_of_week
    and wh.is_working_day = true;

  if v_start is null or v_end is null then
    return;
  end if;

  select s.duration
    into v_duration
  from specialties s
  where s.id = input_specialty_id;

  if v_duration is null then
    return;
  end if;

  slot_start := input_date + v_start;
  slot_end := slot_start + (v_duration || ' minutes')::interval;

  while slot_end <= input_date + v_end loop
    if not exists (
      select 1
      from appointments a
      where a.professional_id = input_professional_id
        and a.status = 'confirmed'
        and a.start_time < slot_end
        and a.end_time > slot_start
    ) then
      start_time := slot_start;
      end_time := slot_end;
      return next;
    end if;

    slot_start := slot_start + (v_duration || ' minutes')::interval;
    slot_end := slot_start + (v_duration || ' minutes')::interval;
  end loop;
end;
$$;


--
-- TOC entry 341 (class 1255 OID 17206)
-- Name: initialize_working_hours(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.initialize_working_hours() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Create default working hours for weekdays (Monday-Friday)
  FOR day IN 1..5 LOOP
    INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_working_day)
    VALUES (NEW.id, day, '09:00', '17:00', true);
  END LOOP;
  
  -- Create weekend entries (Saturday-Sunday) as non-working days
  INSERT INTO working_hours (professional_id, day_of_week, is_working_day)
  VALUES 
    (NEW.id, 0, false), -- Sunday
    (NEW.id, 6, false); -- Saturday
  
  RETURN NEW;
END;
$$;


--
-- TOC entry 365 (class 1255 OID 17207)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- TOC entry 339 (class 1255 OID 17209)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- TOC entry 362 (class 1255 OID 17210)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- TOC entry 340 (class 1255 OID 17211)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- TOC entry 369 (class 1255 OID 17212)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- TOC entry 382 (class 1255 OID 17213)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- TOC entry 383 (class 1255 OID 17214)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- TOC entry 370 (class 1255 OID 17215)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- TOC entry 344 (class 1255 OID 17216)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- TOC entry 399 (class 1255 OID 17217)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- TOC entry 346 (class 1255 OID 17218)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- TOC entry 347 (class 1255 OID 17219)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- TOC entry 342 (class 1255 OID 17220)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- TOC entry 392 (class 1255 OID 17221)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- TOC entry 393 (class 1255 OID 17222)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- TOC entry 307 (class 1255 OID 17223)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- TOC entry 308 (class 1255 OID 17224)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- TOC entry 394 (class 1255 OID 17225)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- TOC entry 396 (class 1255 OID 17226)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- TOC entry 355 (class 1255 OID 17227)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- TOC entry 397 (class 1255 OID 17228)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- TOC entry 398 (class 1255 OID 17229)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 246 (class 1259 OID 17230)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 4182 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 247 (class 1259 OID 17236)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- TOC entry 4183 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 248 (class 1259 OID 17241)
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 4184 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4185 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 249 (class 1259 OID 17248)
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- TOC entry 4186 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 250 (class 1259 OID 17253)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- TOC entry 4187 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 251 (class 1259 OID 17258)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- TOC entry 4188 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 252 (class 1259 OID 17263)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- TOC entry 4189 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 253 (class 1259 OID 17268)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- TOC entry 254 (class 1259 OID 17276)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- TOC entry 4190 (class 0 OID 0)
-- Dependencies: 254
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 255 (class 1259 OID 17281)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4191 (class 0 OID 0)
-- Dependencies: 255
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 256 (class 1259 OID 17282)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- TOC entry 4192 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 257 (class 1259 OID 17290)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- TOC entry 4193 (class 0 OID 0)
-- Dependencies: 257
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 258 (class 1259 OID 17296)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- TOC entry 4194 (class 0 OID 0)
-- Dependencies: 258
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 259 (class 1259 OID 17299)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- TOC entry 4195 (class 0 OID 0)
-- Dependencies: 259
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 4196 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 260 (class 1259 OID 17304)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- TOC entry 4197 (class 0 OID 0)
-- Dependencies: 260
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 261 (class 1259 OID 17310)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- TOC entry 4198 (class 0 OID 0)
-- Dependencies: 261
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 4199 (class 0 OID 0)
-- Dependencies: 261
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 262 (class 1259 OID 17316)
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- TOC entry 4200 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 4201 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 263 (class 1259 OID 17331)
-- Name: ai_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    model text NOT NULL,
    temperature numeric NOT NULL,
    max_tokens integer NOT NULL,
    training_data text NOT NULL,
    prompt text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    provider text DEFAULT 'openai'::text NOT NULL,
    working_hours jsonb DEFAULT '{"is24h": false, "schedule": {}}'::jsonb
);


--
-- TOC entry 264 (class 1259 OID 17340)
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    professional_id uuid,
    specialty_id uuid,
    calendar_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'pending'::text, 'completed'::text, 'canceled'::text])))
);


--
-- TOC entry 265 (class 1259 OID 17348)
-- Name: calendars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location_id text,
    created_at timestamp with time zone DEFAULT now(),
    owner_id uuid,
    user_id uuid
);


--
-- TOC entry 266 (class 1259 OID 17355)
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    calendar_id uuid,
    user_id uuid,
    owner_id uuid NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 17362)
-- Name: professional_specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_specialties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid,
    specialty_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 268 (class 1259 OID 17367)
-- Name: professionals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professionals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    specialty_id uuid,
    calendar_id uuid,
    email text,
    phone text,
    avatar text,
    bio text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- TOC entry 269 (class 1259 OID 17374)
-- Name: specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    calendar_id uuid,
    duration integer NOT NULL,
    price numeric(10,2),
    description text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


--
-- TOC entry 270 (class 1259 OID 17381)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2),
    features jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 271 (class 1259 OID 17388)
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    user_id uuid NOT NULL,
    timezone text DEFAULT 'America/Sao_Paulo'::text,
    language text DEFAULT 'pt'::text,
    notification_preferences jsonb DEFAULT '{"sms": false, "email": true}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    openai_key text,
    deepseek_key text,
    elevenlabs_key text
);


--
-- TOC entry 272 (class 1259 OID 17398)
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    plan_id uuid,
    status text NOT NULL,
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'canceled'::text, 'expired'::text])))
);


--
-- TOC entry 273 (class 1259 OID 17406)
-- Name: working_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.working_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid,
    day_of_week integer NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    is_working_day boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT valid_times CHECK (((NOT is_working_day) OR ((start_time IS NOT NULL) AND (end_time IS NOT NULL) AND (start_time < end_time)))),
    CONSTRAINT working_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- TOC entry 4202 (class 0 OID 0)
-- Dependencies: 273
-- Name: TABLE working_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.working_hours IS 'Stores working hours for professionals';


--
-- TOC entry 274 (class 1259 OID 17414)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- TOC entry 275 (class 1259 OID 17439)
-- Name: messages_2025_05_16; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 276 (class 1259 OID 17448)
-- Name: messages_2025_05_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 277 (class 1259 OID 17457)
-- Name: messages_2025_05_18; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 278 (class 1259 OID 17466)
-- Name: messages_2025_05_19; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 279 (class 1259 OID 17475)
-- Name: messages_2025_05_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 280 (class 1259 OID 17484)
-- Name: messages_2025_05_21; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 291 (class 1259 OID 19109)
-- Name: messages_2025_05_22; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_05_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 17493)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- TOC entry 282 (class 1259 OID 17496)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- TOC entry 283 (class 1259 OID 17504)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 284 (class 1259 OID 17505)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- TOC entry 4203 (class 0 OID 0)
-- Dependencies: 284
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 285 (class 1259 OID 17514)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 286 (class 1259 OID 17518)
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- TOC entry 4204 (class 0 OID 0)
-- Dependencies: 286
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 287 (class 1259 OID 17528)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- TOC entry 288 (class 1259 OID 17535)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 289 (class 1259 OID 17543)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- TOC entry 292 (class 1259 OID 19141)
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- TOC entry 3583 (class 0 OID 0)
-- Name: messages_2025_05_16; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_16 FOR VALUES FROM ('2025-05-16 00:00:00') TO ('2025-05-17 00:00:00');


--
-- TOC entry 3584 (class 0 OID 0)
-- Name: messages_2025_05_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_17 FOR VALUES FROM ('2025-05-17 00:00:00') TO ('2025-05-18 00:00:00');


--
-- TOC entry 3585 (class 0 OID 0)
-- Name: messages_2025_05_18; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_18 FOR VALUES FROM ('2025-05-18 00:00:00') TO ('2025-05-19 00:00:00');


--
-- TOC entry 3586 (class 0 OID 0)
-- Name: messages_2025_05_19; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_19 FOR VALUES FROM ('2025-05-19 00:00:00') TO ('2025-05-20 00:00:00');


--
-- TOC entry 3587 (class 0 OID 0)
-- Name: messages_2025_05_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_20 FOR VALUES FROM ('2025-05-20 00:00:00') TO ('2025-05-21 00:00:00');


--
-- TOC entry 3588 (class 0 OID 0)
-- Name: messages_2025_05_21; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_21 FOR VALUES FROM ('2025-05-21 00:00:00') TO ('2025-05-22 00:00:00');


--
-- TOC entry 3589 (class 0 OID 0)
-- Name: messages_2025_05_22; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_05_22 FOR VALUES FROM ('2025-05-22 00:00:00') TO ('2025-05-23 00:00:00');


--
-- TOC entry 3600 (class 2604 OID 17548)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4119 (class 0 OID 17230)
-- Dependencies: 246
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	e4aefbc1-ed68-4cf2-a9bf-1465ebc76be4	{"action":"user_confirmation_requested","actor_id":"fd65fa61-705d-4082-923c-ccf40f2dceb7","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-02 20:27:40.82344+00	
00000000-0000-0000-0000-000000000000	9662bc97-a602-4cad-bf6e-720f634071e6	{"action":"user_confirmation_requested","actor_id":"d323c16e-fffb-4c50-844e-d4f46ca9178f","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-02 20:29:44.469838+00	
00000000-0000-0000-0000-000000000000	a9efb19e-da96-4420-b0e2-ce7097aaab11	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"w_rodolfoo@hotmail.com","user_id":"d323c16e-fffb-4c50-844e-d4f46ca9178f","user_phone":""}}	2025-05-02 20:31:12.385668+00	
00000000-0000-0000-0000-000000000000	e0678cb0-d3d8-4c6d-813b-d954942a6cb8	{"action":"user_confirmation_requested","actor_id":"76f6660c-6b7c-4e71-8db5-452c65727af7","actor_username":"wrodolfoo23@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-02 20:32:03.076107+00	
00000000-0000-0000-0000-000000000000	3ca8cf9c-8af5-4e00-8a1c-dc55d7b4f0fc	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"w.rodolfo@outlook.com.br","user_id":"fd65fa61-705d-4082-923c-ccf40f2dceb7","user_phone":""}}	2025-05-02 20:43:05.115154+00	
00000000-0000-0000-0000-000000000000	18a22d20-3676-40d6-a187-a8c10295d4b3	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"wrodolfoo23@gmail.com","user_id":"76f6660c-6b7c-4e71-8db5-452c65727af7","user_phone":""}}	2025-05-02 20:43:10.780573+00	
00000000-0000-0000-0000-000000000000	829f922a-809a-49a9-a6aa-70a0c3839d2b	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"w.rodolfo@outlook.com.br","user_id":"0378b665-617e-4e9e-9a53-b086855f2589","user_phone":""}}	2025-05-02 22:37:33.350334+00	
00000000-0000-0000-0000-000000000000	f24634c2-6fc9-4485-9538-4f5aa839a259	{"action":"user_signedup","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-02 23:45:44.796851+00	
00000000-0000-0000-0000-000000000000	5bf7de87-52df-4943-aebc-70921fdeef0a	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-02 23:45:44.805348+00	
00000000-0000-0000-0000-000000000000	1e588d69-95a4-4c78-88c9-748d5897a8c3	{"action":"logout","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-02 23:45:45.024977+00	
00000000-0000-0000-0000-000000000000	01cace6e-2f7d-402f-94d0-0fbda37691b1	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-02 23:49:01.056731+00	
00000000-0000-0000-0000-000000000000	eedb1f8d-2d6f-4024-a13c-c36b6f97be93	{"action":"user_signedup","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-02 23:49:40.343352+00	
00000000-0000-0000-0000-000000000000	ae2c4040-9551-419c-9726-94fb30709a56	{"action":"login","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-02 23:49:40.347841+00	
00000000-0000-0000-0000-000000000000	deadfccf-6d65-46aa-a39e-04f22f3c505b	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-02 23:51:12.523008+00	
00000000-0000-0000-0000-000000000000	a10e913a-a4eb-494e-afba-7af4b1b905e9	{"action":"login","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-02 23:51:33.461714+00	
00000000-0000-0000-0000-000000000000	0e5ad43c-835d-4b31-b524-79f3959f85cd	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 00:50:11.56668+00	
00000000-0000-0000-0000-000000000000	25f4be0c-2eca-4407-a950-b324a502bc4e	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 00:50:11.568225+00	
00000000-0000-0000-0000-000000000000	52c24133-8593-4053-a220-d924dc0de4e0	{"action":"token_refreshed","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 00:50:12.475539+00	
00000000-0000-0000-0000-000000000000	ee9b292e-26a1-4e79-8aa3-e653a9191db9	{"action":"token_revoked","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 00:50:12.476096+00	
00000000-0000-0000-0000-000000000000	2ef96112-a853-47f3-bb46-e802acdde6b1	{"action":"token_refreshed","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 14:47:32.7351+00	
00000000-0000-0000-0000-000000000000	7895f2cd-4544-445b-b60c-d0724655906a	{"action":"token_revoked","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 14:47:32.744143+00	
00000000-0000-0000-0000-000000000000	78553cd4-9de3-4fe8-abc5-12db8fb1e17a	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 14:47:35.603657+00	
00000000-0000-0000-0000-000000000000	39f7e96b-f90e-4bc1-ba3c-cd765ca59f9d	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 14:47:35.604255+00	
00000000-0000-0000-0000-000000000000	b785c812-cb12-4887-b1a5-c3f3201f11eb	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 15:46:10.83454+00	
00000000-0000-0000-0000-000000000000	9b935e7d-6d4a-4b18-abc0-db2fc81b125b	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 15:46:10.837096+00	
00000000-0000-0000-0000-000000000000	9aa8c6f3-0247-4b8e-ba7d-7453185bda91	{"action":"token_refreshed","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 15:46:14.645073+00	
00000000-0000-0000-0000-000000000000	a889334a-1c37-4284-8fe1-c4df66f2143a	{"action":"token_revoked","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 15:46:14.645622+00	
00000000-0000-0000-0000-000000000000	ed34c374-660a-4477-be26-7f72ce2acb8e	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 23:59:50.437251+00	
00000000-0000-0000-0000-000000000000	74bd3981-565a-46e8-a1cd-e4d46b4d0a2d	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-03 23:59:50.43905+00	
00000000-0000-0000-0000-000000000000	fdf537c5-c034-482f-9a4f-3632d9d9b2c4	{"action":"token_refreshed","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 00:00:36.750933+00	
00000000-0000-0000-0000-000000000000	15a566b5-a2d9-408b-83ca-26f170a417f4	{"action":"token_revoked","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 00:00:36.751514+00	
00000000-0000-0000-0000-000000000000	5f54a2b5-e1c9-40d4-b106-c70352efe95d	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 00:09:44.973074+00	
00000000-0000-0000-0000-000000000000	4c33c0f4-63aa-4c5c-901f-ede8538c7565	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 00:20:57.422333+00	
00000000-0000-0000-0000-000000000000	e3a3c0a4-4cab-4bcd-8e19-0f19b7ecab1f	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 01:08:53.23349+00	
00000000-0000-0000-0000-000000000000	14035515-3f24-4478-9087-955a9efa5932	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 01:08:53.234976+00	
00000000-0000-0000-0000-000000000000	7bc2e646-ff71-466c-92fa-bbb6e2ba9059	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 01:19:40.656101+00	
00000000-0000-0000-0000-000000000000	42c310af-3b50-4b2b-a757-cfb2ff1d4fe7	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 01:19:40.657523+00	
00000000-0000-0000-0000-000000000000	bae73241-2d14-41c9-ae3d-386738e773f9	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 15:23:53.629861+00	
00000000-0000-0000-0000-000000000000	479d110d-1956-4c0d-8644-0f55625af011	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 15:23:53.637515+00	
00000000-0000-0000-0000-000000000000	c8fb62e3-1560-4a28-899f-334cadaa8b1b	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 15:23:54.449569+00	
00000000-0000-0000-0000-000000000000	c1a32e75-e171-492b-bcf7-0d35c0a15318	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 15:23:54.450724+00	
00000000-0000-0000-0000-000000000000	81973e09-67fd-4590-b606-194e37264b42	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 16:22:19.383551+00	
00000000-0000-0000-0000-000000000000	5ffdde3c-1ffb-45aa-8390-7159852900d8	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 16:22:19.38586+00	
00000000-0000-0000-0000-000000000000	63636293-09a4-4e7f-864a-35d4e75e8b74	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 17:20:49.24434+00	
00000000-0000-0000-0000-000000000000	1cab5e43-0c45-48a0-b268-e7a64db02466	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 17:20:49.246455+00	
00000000-0000-0000-0000-000000000000	694043c7-a501-4ea8-a525-a638daa86410	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 18:20:02.021013+00	
00000000-0000-0000-0000-000000000000	57cab674-96f7-41ef-b92d-9a8cb9f3626c	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-04 18:20:02.022342+00	
00000000-0000-0000-0000-000000000000	dc4be88d-0a1e-485e-a4b9-c4f4fecc6fdc	{"action":"user_signedup","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-04 18:47:45.015914+00	
00000000-0000-0000-0000-000000000000	e5fa975b-0a81-466b-bbe3-88ebaa0c4626	{"action":"login","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-04 18:47:45.023039+00	
00000000-0000-0000-0000-000000000000	6ac73148-82fd-4abb-8801-42c3a035d70d	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 11:37:54.846786+00	
00000000-0000-0000-0000-000000000000	3cee5154-c51b-4a3a-8143-b5751fa87daf	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 11:37:54.857957+00	
00000000-0000-0000-0000-000000000000	005b8935-36d1-40fa-a7e2-289a7877c503	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 11:38:13.94261+00	
00000000-0000-0000-0000-000000000000	e80c612e-27a2-4e76-8a48-771c52872d1a	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 11:38:13.943156+00	
00000000-0000-0000-0000-000000000000	e522225f-e28c-4d36-badb-d44ef6fc0f66	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 12:36:57.24717+00	
00000000-0000-0000-0000-000000000000	5faeaef8-3887-49de-912f-5c77ac2184b6	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 12:36:57.250876+00	
00000000-0000-0000-0000-000000000000	79649966-7c9a-46cc-aebf-46231ea5c7fb	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 13:35:56.281077+00	
00000000-0000-0000-0000-000000000000	9b0787f1-52ec-4c81-b7d1-89e4335ecb3c	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 13:35:56.282522+00	
00000000-0000-0000-0000-000000000000	e7eb0d5a-a649-42a4-9627-80120d0d2606	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 14:34:38.22516+00	
00000000-0000-0000-0000-000000000000	cd0d6ccc-4378-4901-a62d-64732f12181a	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 14:34:38.227484+00	
00000000-0000-0000-0000-000000000000	00c5fbd7-e571-4a74-a02e-b782f106122c	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 15:33:14.262718+00	
00000000-0000-0000-0000-000000000000	cd48fd3c-9843-4174-92df-75bbd7b2f320	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 15:33:14.265191+00	
00000000-0000-0000-0000-000000000000	4abdb3a0-6f23-4b1e-828e-dfd581e44f49	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 16:31:19.463187+00	
00000000-0000-0000-0000-000000000000	086e8dee-45ec-41f7-b677-2e89dd3e0f45	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 16:31:19.465129+00	
00000000-0000-0000-0000-000000000000	bf85861e-8d96-43af-a1a0-06fb49b41f9b	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 17:29:45.308466+00	
00000000-0000-0000-0000-000000000000	dc60cabe-49e3-490d-8143-8fa72b557c2f	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 17:29:45.314597+00	
00000000-0000-0000-0000-000000000000	5770faa9-e692-42a6-9302-fefb56f9a21d	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 19:41:29.091381+00	
00000000-0000-0000-0000-000000000000	51fc42b1-3dab-40a9-8bcd-a3311996e121	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-05 19:41:29.093286+00	
00000000-0000-0000-0000-000000000000	ecddab37-b2e0-4f82-8d04-2faab5a72bf1	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-05 20:04:15.412612+00	
00000000-0000-0000-0000-000000000000	7f87ff78-6354-4186-b611-be11b9d3d4c0	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-05 20:05:57.942107+00	
00000000-0000-0000-0000-000000000000	ca58902e-557e-403c-b537-5b0b841abd41	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 00:05:29.907411+00	
00000000-0000-0000-0000-000000000000	6d144f39-8b52-419b-b337-ecd4ad77cc70	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 00:05:29.914322+00	
00000000-0000-0000-0000-000000000000	65f02b50-5fc5-4739-9d58-0a7255c57ef0	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 00:05:46.715509+00	
00000000-0000-0000-0000-000000000000	c6a136e2-b782-41e0-b5bf-53c6e1ed66c7	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 00:05:46.716089+00	
00000000-0000-0000-0000-000000000000	8eda607a-33cf-41bd-a5cd-006c97cf0f85	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 00:06:33.889504+00	
00000000-0000-0000-0000-000000000000	e5359d52-7131-45c2-b511-7f083449ea29	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 00:06:33.890107+00	
00000000-0000-0000-0000-000000000000	fee0edc8-99a1-4047-88d5-762ded24a91a	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 01:04:42.037981+00	
00000000-0000-0000-0000-000000000000	b46fed83-38f1-4cba-b7b1-d09efd014e35	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 01:04:42.039445+00	
00000000-0000-0000-0000-000000000000	f59f4e13-555b-46a3-82b7-43ff2e7c661c	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 01:04:47.995983+00	
00000000-0000-0000-0000-000000000000	c4d19b60-20c8-4959-9d5a-568b53c50b3b	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 01:04:47.99654+00	
00000000-0000-0000-0000-000000000000	6300bfbc-4228-49bc-87de-14d1eec1e45f	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 11:40:45.021251+00	
00000000-0000-0000-0000-000000000000	1916a7da-07c3-41b9-8fd3-f45e9e72bb24	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 11:40:45.029575+00	
00000000-0000-0000-0000-000000000000	28c2b746-c5f3-471b-aefb-f3c58a627a22	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 11:40:57.698425+00	
00000000-0000-0000-0000-000000000000	35d6f699-a9a0-478b-8d1f-c4ff6e380983	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 11:40:57.699029+00	
00000000-0000-0000-0000-000000000000	625624f6-6de3-4053-a9bf-a2f1e1c1efeb	{"action":"token_refreshed","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 13:12:19.734526+00	
00000000-0000-0000-0000-000000000000	ff52705b-2b37-4e8e-86b1-c9d40ebe619f	{"action":"token_revoked","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 13:12:19.741994+00	
00000000-0000-0000-0000-000000000000	fca8371c-c91b-486e-909c-ad7a118843f2	{"action":"login","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-06 13:13:07.818339+00	
00000000-0000-0000-0000-000000000000	f4838927-e4a3-4a46-abe3-20493846fc0c	{"action":"user_recovery_requested","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user"}	2025-05-06 13:13:14.904326+00	
00000000-0000-0000-0000-000000000000	cf6e7a17-df71-46eb-aefb-7ac1ed043ccb	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 13:38:05.017037+00	
00000000-0000-0000-0000-000000000000	3d1c7739-3673-42e7-b3e8-53e7a87db31b	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-06 13:38:05.019633+00	
00000000-0000-0000-0000-000000000000	40f2cd75-83d8-492a-a4eb-b949be013b5f	{"action":"user_recovery_requested","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user"}	2025-05-06 13:51:53.66385+00	
00000000-0000-0000-0000-000000000000	4eca5a8c-234d-4fb0-b437-6046fb2bfe4c	{"action":"login","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"account"}	2025-05-06 13:54:28.537661+00	
00000000-0000-0000-0000-000000000000	69c99d13-c8b7-4039-87b2-146fe265c8ce	{"action":"user_recovery_requested","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user"}	2025-05-06 13:58:43.02227+00	
00000000-0000-0000-0000-000000000000	1642788e-b130-4883-8d5c-8baf07cd6fc1	{"action":"login","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"account"}	2025-05-06 13:58:57.058496+00	
00000000-0000-0000-0000-000000000000	83e3c0ff-90c8-46b6-90d7-cd6a0678d88d	{"action":"user_updated_password","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user"}	2025-05-06 13:59:11.819913+00	
00000000-0000-0000-0000-000000000000	bff1ec83-74d6-4e30-974b-4db13c4de434	{"action":"user_modified","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user"}	2025-05-06 13:59:11.821111+00	
00000000-0000-0000-0000-000000000000	6ba33be3-3d3e-4891-befd-845c89479a69	{"action":"login","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-06 13:59:17.054817+00	
00000000-0000-0000-0000-000000000000	f18ae6e4-ca94-48cb-9415-90dfc5a24548	{"action":"login","actor_id":"0378b665-617e-4e9e-9a53-b086855f2589","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-06 14:23:17.992392+00	
00000000-0000-0000-0000-000000000000	13eff67a-a980-43d6-a9f2-a72b26c8e0e7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"w.rodolfo@outlook.com.br","user_id":"0378b665-617e-4e9e-9a53-b086855f2589","user_phone":""}}	2025-05-06 14:54:34.430704+00	
00000000-0000-0000-0000-000000000000	1267a2ba-85c8-4004-b049-082e31aa00b6	{"action":"user_signedup","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-06 14:55:50.554295+00	
00000000-0000-0000-0000-000000000000	bd301c1c-7700-4ac4-920f-3d075fd914cc	{"action":"login","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-06 14:55:50.559454+00	
00000000-0000-0000-0000-000000000000	b9cf4973-c415-4962-8e52-0d034087efba	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-06 16:56:12.621544+00	
00000000-0000-0000-0000-000000000000	aaf15a4e-d8fc-4a45-8f07-454569975580	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-06 16:56:12.624399+00	
00000000-0000-0000-0000-000000000000	b04e8034-17e3-458f-8cbe-8a809b0c47d1	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-06 18:25:10.713196+00	
00000000-0000-0000-0000-000000000000	752d5de0-46ef-4cd4-8b29-cc725aa08ff3	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-06 18:25:10.71474+00	
00000000-0000-0000-0000-000000000000	44c721a7-bd9c-4be9-98df-12fb022853e7	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-06 23:50:44.680264+00	
00000000-0000-0000-0000-000000000000	1ef79e4e-d1c0-40a4-b195-cf2f14f23d6c	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-06 23:50:44.686826+00	
00000000-0000-0000-0000-000000000000	45a11d20-bc5d-4ed5-b32f-db83aa93b7ec	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-07 00:49:23.904273+00	
00000000-0000-0000-0000-000000000000	1f46517a-2337-4a57-980f-78ef1256d5d6	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-07 00:49:23.907879+00	
00000000-0000-0000-0000-000000000000	75143616-f3c1-4a3e-9e24-b14b72f439e1	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 13:21:36.1286+00	
00000000-0000-0000-0000-000000000000	32b2f757-1063-4792-8c29-74674aa38204	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 13:21:36.143265+00	
00000000-0000-0000-0000-000000000000	1d270790-f067-4de6-8755-79e798b61cca	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 14:21:02.574371+00	
00000000-0000-0000-0000-000000000000	217e630c-07a6-423a-a9d2-43b5e288c3fd	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 14:21:02.584677+00	
00000000-0000-0000-0000-000000000000	7d76d1fb-a16f-42c3-8157-a72f8e589e56	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 15:20:01.585314+00	
00000000-0000-0000-0000-000000000000	5b9e5332-fb11-44ed-aa66-6bfd96dda926	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 15:20:01.586138+00	
00000000-0000-0000-0000-000000000000	3df9d5ed-61c4-4bf8-96b8-d374bc7755d3	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 16:18:40.732961+00	
00000000-0000-0000-0000-000000000000	4e684b42-c797-4d01-aed1-13fc24d2344e	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-10 16:18:40.737958+00	
00000000-0000-0000-0000-000000000000	f9aafbed-c91b-43aa-bfbf-c5b65e8b9955	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 11:58:45.212967+00	
00000000-0000-0000-0000-000000000000	78fec5b5-62d4-4c1a-8fa1-812100b81a4e	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 11:58:45.218868+00	
00000000-0000-0000-0000-000000000000	1368827c-53d0-4409-b917-2228cd22d4f8	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 11:58:51.919013+00	
00000000-0000-0000-0000-000000000000	78296dd9-f409-4dea-82ea-a13ffd9e56d5	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 13:18:50.475689+00	
00000000-0000-0000-0000-000000000000	e08c948b-d78e-41f8-9026-9535ab9ad016	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 13:18:50.479857+00	
00000000-0000-0000-0000-000000000000	d990592e-e3e1-4c46-8246-ed77a252e4f8	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 14:17:18.365292+00	
00000000-0000-0000-0000-000000000000	bb0134af-552e-4f17-85c9-407cacdd2268	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 14:17:18.370961+00	
00000000-0000-0000-0000-000000000000	25f978ef-0db8-4be7-aab1-1a2cb8e61bb8	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 15:15:48.958484+00	
00000000-0000-0000-0000-000000000000	f2dcdbc5-fec5-41bd-b023-dd9445614dc3	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 15:15:48.96175+00	
00000000-0000-0000-0000-000000000000	7435206a-0019-48ca-a5a6-3063e0eb8a41	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 16:14:51.942943+00	
00000000-0000-0000-0000-000000000000	b86f25d1-49f9-409a-9a09-2ec150385306	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 16:14:51.946173+00	
00000000-0000-0000-0000-000000000000	c047ab7b-860c-4d3d-8727-204ba4097da4	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 17:23:45.307455+00	
00000000-0000-0000-0000-000000000000	d3fe4e0e-ef3e-4e12-a0c0-2a473ab37758	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 17:23:45.310319+00	
00000000-0000-0000-0000-000000000000	c4fa75ba-526f-4038-8e0e-e45109d52efa	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 19:38:33.329288+00	
00000000-0000-0000-0000-000000000000	ac24a2a8-90aa-4b05-a429-6198e69972bd	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-12 19:38:33.331148+00	
00000000-0000-0000-0000-000000000000	22108492-f252-42e8-b5c5-3031ec18fddd	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 11:48:47.593195+00	
00000000-0000-0000-0000-000000000000	8bd49ca4-20ab-4f86-a3ec-7cd1a51684e6	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 11:48:47.603318+00	
00000000-0000-0000-0000-000000000000	3b5d799f-56a3-40eb-9c46-3a393b64135b	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 11:48:56.173731+00	
00000000-0000-0000-0000-000000000000	cc37fb8d-2a8b-4616-acb1-9cc43b8ca4d2	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 16:42:03.681845+00	
00000000-0000-0000-0000-000000000000	3e5d6fa4-4217-4efc-950c-0bbf8354f8bf	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 16:42:03.688332+00	
00000000-0000-0000-0000-000000000000	cc232a1f-1eca-4abd-acda-8081a20685a8	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 17:41:35.430997+00	
00000000-0000-0000-0000-000000000000	45910edf-d0a0-42c7-8b60-dd9278571485	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 17:41:35.433296+00	
00000000-0000-0000-0000-000000000000	aeca2f80-05f7-410a-8c4d-a3419e8ac0b5	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 18:47:28.376392+00	
00000000-0000-0000-0000-000000000000	296e5a17-9b57-4fe1-b27c-6d0917b2bb1b	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 18:47:28.3783+00	
00000000-0000-0000-0000-000000000000	f9134328-5931-42c8-ae6a-5252e19544a0	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 19:54:05.127493+00	
00000000-0000-0000-0000-000000000000	e7d97656-69cf-47d2-a86f-ef957070a6d7	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-13 19:54:05.129306+00	
00000000-0000-0000-0000-000000000000	4aceb3cf-f061-417c-9186-0caeef196847	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 12:00:00.145059+00	
00000000-0000-0000-0000-000000000000	662c507f-52c9-484a-9a87-741066eaab7f	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 12:00:00.151988+00	
00000000-0000-0000-0000-000000000000	3483e455-6f57-4ded-87b7-5776b0c5bab6	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 16:38:58.236319+00	
00000000-0000-0000-0000-000000000000	60277f55-15b5-433a-ac89-ac054d61d5c9	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 16:38:58.240614+00	
00000000-0000-0000-0000-000000000000	b92ca8e4-2f76-4dce-aa56-5e1deecb650f	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 19:20:29.190698+00	
00000000-0000-0000-0000-000000000000	79df16fd-c7a8-4f03-84fa-de82b8ea1e61	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 19:20:29.200965+00	
00000000-0000-0000-0000-000000000000	3f42c464-ca8a-4e86-b70d-9df026b8ec77	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 20:21:08.944513+00	
00000000-0000-0000-0000-000000000000	1e5c794b-8364-43c9-be12-165d400304a5	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-14 20:21:08.94822+00	
00000000-0000-0000-0000-000000000000	ee306036-c7e3-45fc-b922-0974ec818987	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 15:57:53.726705+00	
00000000-0000-0000-0000-000000000000	0eb50fa9-670d-4f26-ab82-321a41781dd5	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 15:57:53.745298+00	
00000000-0000-0000-0000-000000000000	d6f85a77-2bac-4bc2-9b81-7912674a4aa0	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 16:07:00.579543+00	
00000000-0000-0000-0000-000000000000	0197d23e-bbca-4922-bb64-3d7d7062db48	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 17:40:09.835563+00	
00000000-0000-0000-0000-000000000000	8b776952-63f3-4f4d-ad13-81514416831d	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 17:40:09.839005+00	
00000000-0000-0000-0000-000000000000	8afb2812-f3f4-4f0f-9659-bef6baaabc39	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 19:08:17.989362+00	
00000000-0000-0000-0000-000000000000	cd446c14-5266-41ee-b416-a3d614f52227	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 19:08:17.991216+00	
00000000-0000-0000-0000-000000000000	f0561ad8-f6fb-4ecb-ba27-cffc3e37895d	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 20:06:48.507466+00	
00000000-0000-0000-0000-000000000000	b5d9e8b2-8757-443f-8cf3-0d99f7b31a76	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-15 20:06:48.510457+00	
00000000-0000-0000-0000-000000000000	a744f54e-4cd0-44a1-a6bc-48847b38ff66	{"action":"user_repeated_signup","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-16 00:15:33.123766+00	
00000000-0000-0000-0000-000000000000	9b1e33aa-6be9-40d8-8806-3d46124ede20	{"action":"user_repeated_signup","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-16 00:16:09.145003+00	
00000000-0000-0000-0000-000000000000	eb04304c-59ac-4401-82bf-ffb2b7ae225f	{"action":"login","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-16 00:17:27.23016+00	
00000000-0000-0000-0000-000000000000	35836a9d-3bd5-4d96-8e9f-352ba1e75eda	{"action":"token_refreshed","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 08:21:11.321509+00	
00000000-0000-0000-0000-000000000000	4feee51d-41a2-478a-a5fc-e4b70a0df266	{"action":"token_revoked","actor_id":"69e25475-81bf-4fc1-8ced-9bb52ee48743","actor_username":"w_rodolfoo@hotmail.com","actor_via_sso":false,"log_type":"token"}	2025-05-16 08:21:11.32587+00	
00000000-0000-0000-0000-000000000000	10b6067b-c724-4aed-b6ab-1914894a85ee	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 11:39:51.075883+00	
00000000-0000-0000-0000-000000000000	7b391d5f-2740-4e2c-90ef-f6af431ba2f8	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 11:39:51.077835+00	
00000000-0000-0000-0000-000000000000	a1b4f2ac-24f1-4995-bc36-168724faf40b	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 15:52:24.355764+00	
00000000-0000-0000-0000-000000000000	233bd24d-6741-4b57-9dff-48ca679f7794	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 15:52:24.357275+00	
00000000-0000-0000-0000-000000000000	eb69d0dd-96b6-4c2a-bc9f-84024570ec22	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 16:51:22.19343+00	
00000000-0000-0000-0000-000000000000	3d2fdb93-f354-4cd3-881a-b509bc96a91a	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 16:51:22.202231+00	
00000000-0000-0000-0000-000000000000	242c5771-fd87-4c5d-9bdd-589598dd6a0e	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 18:54:50.191338+00	
00000000-0000-0000-0000-000000000000	6c7d70a6-3823-402c-87d1-1a0ec51a5f13	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 18:54:50.193725+00	
00000000-0000-0000-0000-000000000000	c9a7e49c-5c43-46ae-aeba-d4922fbfa5d1	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 19:53:24.351107+00	
00000000-0000-0000-0000-000000000000	4d6ecafb-e024-479d-82a9-05c5b3ca1adc	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-16 19:53:24.355472+00	
00000000-0000-0000-0000-000000000000	be4e2e9a-f77a-4f3b-93af-c018d38bc1c4	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 00:16:24.355283+00	
00000000-0000-0000-0000-000000000000	796f576c-6d79-4ee2-a15f-685f02e438ed	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 00:16:24.363527+00	
00000000-0000-0000-0000-000000000000	7050d076-16df-45b7-a687-e7cbf6918597	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 01:15:15.029534+00	
00000000-0000-0000-0000-000000000000	f080e304-0daa-41b4-babe-20f9c1fec3f6	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 01:15:15.032422+00	
00000000-0000-0000-0000-000000000000	43b8a135-9923-4356-9f82-57255b28245f	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 17:40:30.124349+00	
00000000-0000-0000-0000-000000000000	b6035590-2235-4a1a-bbbf-9e0d8213ecea	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 17:40:30.133115+00	
00000000-0000-0000-0000-000000000000	67bf50fa-b0fb-4a2e-b45b-8e4c48d69b12	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-17 17:40:54.510132+00	
00000000-0000-0000-0000-000000000000	a3fc34ef-b9b8-420a-941f-1e5ace8ca5e8	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-18 00:51:57.273314+00	
00000000-0000-0000-0000-000000000000	68fc87e2-e79e-40cf-8715-0ecc447dbe02	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-18 00:51:57.276248+00	
00000000-0000-0000-0000-000000000000	d335e873-5926-46b8-a3ef-6b04f3f00796	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-18 14:55:13.299521+00	
00000000-0000-0000-0000-000000000000	5fbdeca4-7981-4b9e-aee6-703c8ca128f1	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-18 14:55:13.305831+00	
00000000-0000-0000-0000-000000000000	5daafc0c-6449-4e99-bdec-dd2b558726c1	{"action":"user_repeated_signup","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-18 15:50:22.613225+00	
00000000-0000-0000-0000-000000000000	9221db00-e7d8-4d02-92d1-ddd50e94b519	{"action":"user_signedup","actor_id":"8775783c-fada-463f-9225-a274e86fb24c","actor_username":"granuzzilucimara@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-18 15:52:09.956059+00	
00000000-0000-0000-0000-000000000000	08211e6c-1181-4e99-99a8-337481a6031c	{"action":"login","actor_id":"8775783c-fada-463f-9225-a274e86fb24c","actor_username":"granuzzilucimara@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-18 15:52:09.962879+00	
00000000-0000-0000-0000-000000000000	6bf734fe-8be1-45a5-8ca1-e9b6ea04aa81	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 11:53:41.342888+00	
00000000-0000-0000-0000-000000000000	3c8a471d-35a9-44f4-9ffe-285ae8dc4c50	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 11:53:41.350945+00	
00000000-0000-0000-0000-000000000000	858ad5c0-fff1-41f3-93cf-4c37fad66d57	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 12:51:48.521429+00	
00000000-0000-0000-0000-000000000000	9b7be74c-c26f-41ec-bc10-b2b8cb278f35	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 12:51:48.525246+00	
00000000-0000-0000-0000-000000000000	3d77b547-16c8-4afb-a7ed-def0e3e5858e	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 13:50:36.324854+00	
00000000-0000-0000-0000-000000000000	a36ff876-dd1a-46a3-a1d2-ec4e8c6cf576	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 13:50:36.33086+00	
00000000-0000-0000-0000-000000000000	f7257f6e-2fd6-426e-8692-1bd3d136aaf6	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 14:51:13.779421+00	
00000000-0000-0000-0000-000000000000	4ea75ac5-5dfa-4792-b5a6-1cd1697ff6c2	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 14:51:13.780846+00	
00000000-0000-0000-0000-000000000000	a9af02be-e922-41b0-b427-2df9c119bfd9	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 15:49:29.263025+00	
00000000-0000-0000-0000-000000000000	83a45138-aac3-4dd0-b648-dd06ca50114d	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 15:49:29.269372+00	
00000000-0000-0000-0000-000000000000	0fdd528d-9897-492b-90a6-7bcc19dc8fc4	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 16:48:01.064364+00	
00000000-0000-0000-0000-000000000000	3a1f3086-5210-45c0-9d40-389fd5a1c218	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 16:48:01.075705+00	
00000000-0000-0000-0000-000000000000	6f10d039-e372-4221-bc22-b680184ddd52	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:56:55.537663+00	
00000000-0000-0000-0000-000000000000	8ed4e5c6-bd24-47f1-a7c4-88baf697b890	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 17:56:55.539676+00	
00000000-0000-0000-0000-000000000000	66442b3d-5630-4217-8af5-518c94df2d36	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 18:55:37.101089+00	
00000000-0000-0000-0000-000000000000	bd1e102a-9bbf-496c-b12a-59dea9df3b3f	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 18:55:37.102733+00	
00000000-0000-0000-0000-000000000000	bd20a729-962b-4294-bc30-4dca1c7e4b45	{"action":"user_repeated_signup","actor_id":"4cd83d20-2635-46e5-b636-6a731b41544e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-19 19:41:28.252609+00	
00000000-0000-0000-0000-000000000000	14b74a90-8ddf-4de2-9b18-c40eb9896280	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"gabsdecarlo@gmail.com","user_id":"4cd83d20-2635-46e5-b636-6a731b41544e","user_phone":""}}	2025-05-19 19:41:56.012821+00	
00000000-0000-0000-0000-000000000000	348faf8e-e75c-47b5-aa4f-db2ac79c30fd	{"action":"user_signedup","actor_id":"fcb89b39-5751-47d3-a5ad-f125b5a0ed4e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-19 19:42:02.765493+00	
00000000-0000-0000-0000-000000000000	835462b2-fb67-43b2-9dac-798d1da3b12f	{"action":"login","actor_id":"fcb89b39-5751-47d3-a5ad-f125b5a0ed4e","actor_username":"gabsdecarlo@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 19:42:02.770357+00	
00000000-0000-0000-0000-000000000000	808789cd-3885-43ac-b132-357ac923ed44	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"granuzzilucimara@gmail.com","user_id":"8775783c-fada-463f-9225-a274e86fb24c","user_phone":""}}	2025-05-19 19:46:04.425807+00	
00000000-0000-0000-0000-000000000000	d52785f7-185a-42a9-9ba5-5b13c106559e	{"action":"user_repeated_signup","actor_id":"6df9e318-722c-48f7-ada2-99d69f20efc7","actor_username":"thiagohenriquesousa4@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-05-19 19:46:46.213383+00	
00000000-0000-0000-0000-000000000000	ea571f7e-9c19-41b7-bf72-724b03c73dc2	{"action":"user_signedup","actor_id":"05b1dda4-1389-4d2e-8ffb-475aa4ba96a9","actor_username":"thiagohenriquesousa@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-05-19 19:47:01.534137+00	
00000000-0000-0000-0000-000000000000	8c30082e-2b52-4b87-a39c-0dff82b3bab0	{"action":"login","actor_id":"05b1dda4-1389-4d2e-8ffb-475aa4ba96a9","actor_username":"thiagohenriquesousa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-19 19:47:01.537581+00	
00000000-0000-0000-0000-000000000000	f52d1e01-540f-46fc-80f4-252e1f74efa2	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 19:54:15.254555+00	
00000000-0000-0000-0000-000000000000	70f69292-2551-49b2-a8e7-0e87466a1651	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 19:54:15.256742+00	
00000000-0000-0000-0000-000000000000	d9339ddb-2370-4c65-b9bf-587feaf1ccf6	{"action":"token_refreshed","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 20:53:01.361691+00	
00000000-0000-0000-0000-000000000000	a528a6aa-2e0c-4cb7-8f23-c286fa19fe28	{"action":"token_revoked","actor_id":"cf25be2e-36dc-40f9-996b-ea5ab9ba9eff","actor_username":"w.rodolfo@outlook.com.br","actor_via_sso":false,"log_type":"token"}	2025-05-19 20:53:01.369602+00	
\.


--
-- TOC entry 4120 (class 0 OID 17236)
-- Dependencies: 247
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- TOC entry 4121 (class 0 OID 17241)
-- Dependencies: 248
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
69e25475-81bf-4fc1-8ced-9bb52ee48743	69e25475-81bf-4fc1-8ced-9bb52ee48743	{"sub": "69e25475-81bf-4fc1-8ced-9bb52ee48743", "name": "Wellington Rodolfo Souza Silva", "email": "w_rodolfoo@hotmail.com", "business_name": "Rodolfo", "email_verified": false, "phone_verified": false}	email	2025-05-02 23:45:44.79199+00	2025-05-02 23:45:44.792044+00	2025-05-02 23:45:44.792044+00	bfa66391-f7f8-4346-9f9c-45bca2c24424
6df9e318-722c-48f7-ada2-99d69f20efc7	6df9e318-722c-48f7-ada2-99d69f20efc7	{"sub": "6df9e318-722c-48f7-ada2-99d69f20efc7", "name": "Thiago Sousa", "email": "thiagohenriquesousa4@gmail.com", "business_name": "THS", "email_verified": false, "phone_verified": false}	email	2025-05-04 18:47:45.011181+00	2025-05-04 18:47:45.011239+00	2025-05-04 18:47:45.011239+00	52b780ed-2d01-41a1-a233-58a2abfde220
cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	{"sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "name": "Wellington Rodolfo Souza Silva", "email": "w.rodolfo@outlook.com.br", "business_name": "Rodolfo", "email_verified": false, "phone_verified": false}	email	2025-05-06 14:55:50.551673+00	2025-05-06 14:55:50.551726+00	2025-05-06 14:55:50.551726+00	c4f740ed-ae52-42a8-a5d9-84b6f13ba3ad
fcb89b39-5751-47d3-a5ad-f125b5a0ed4e	fcb89b39-5751-47d3-a5ad-f125b5a0ed4e	{"sub": "fcb89b39-5751-47d3-a5ad-f125b5a0ed4e", "name": "Gabriela De Carlo", "email": "gabsdecarlo@gmail.com", "business_name": "Gabs", "email_verified": false, "phone_verified": false}	email	2025-05-19 19:42:02.76276+00	2025-05-19 19:42:02.762821+00	2025-05-19 19:42:02.762821+00	8fa069c2-a238-4c5a-968a-eb5a9a34ff7d
05b1dda4-1389-4d2e-8ffb-475aa4ba96a9	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9	{"sub": "05b1dda4-1389-4d2e-8ffb-475aa4ba96a9", "name": "THIAGO HENRIQUE DE SOUSA", "email": "thiagohenriquesousa@gmail.com", "business_name": "dohoo", "email_verified": false, "phone_verified": false}	email	2025-05-19 19:47:01.531704+00	2025-05-19 19:47:01.531752+00	2025-05-19 19:47:01.531752+00	b800e20c-dfe7-4604-9ea5-d1dccd5c3441
\.


--
-- TOC entry 4122 (class 0 OID 17248)
-- Dependencies: 249
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4123 (class 0 OID 17253)
-- Dependencies: 250
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
d3277abf-4aff-4f16-9fe6-2521c5285a67	2025-05-02 23:49:01.067155+00	2025-05-02 23:49:01.067155+00	password	b624454d-e99b-47be-a932-7da1221a1679
e4a3ada8-1328-4325-bd16-864ac796daaa	2025-05-02 23:51:12.527062+00	2025-05-02 23:51:12.527062+00	password	222d6360-0ac6-49f8-ac2c-54295895b694
5874ab1b-5189-44de-8099-5378bf7cfee0	2025-05-04 00:09:44.99044+00	2025-05-04 00:09:44.99044+00	password	f96ef3bf-1a4e-455f-b02b-e47979d6ca93
180cd880-fe7e-4584-9722-cebf9c6d7a35	2025-05-04 00:20:57.428073+00	2025-05-04 00:20:57.428073+00	password	3b30c7d4-8783-4511-8ab8-94c1909b7abe
840977e9-2a3e-448d-8ee6-130de283c9f2	2025-05-04 18:47:45.028221+00	2025-05-04 18:47:45.028221+00	password	cc475c10-c115-4f0b-b1b6-a7847b43c333
31d63cb9-c736-4d1b-9ecf-4bfc8fd09885	2025-05-05 20:04:15.429438+00	2025-05-05 20:04:15.429438+00	password	49311635-6aa9-4499-8ce4-c740f3053c84
992c5927-35ba-4e69-9ce4-2a19b307103f	2025-05-05 20:05:57.946201+00	2025-05-05 20:05:57.946201+00	password	9abd2619-6a52-4be9-8bf6-418c3eed5ace
4dfe321c-fa31-4dda-85df-eecb37382095	2025-05-06 13:13:07.82747+00	2025-05-06 13:13:07.82747+00	password	37e647fa-a4bc-4bce-a8f0-c7bf118f5851
1e617d53-3444-4cef-b22f-398928e9fe00	2025-05-06 14:55:50.563794+00	2025-05-06 14:55:50.563794+00	password	abdb211b-c594-4023-87bb-cf7320d74e71
8807f7f4-fd1e-45a4-82b0-a0a319adc1c8	2025-05-16 00:17:27.247059+00	2025-05-16 00:17:27.247059+00	password	34d6a387-45fe-4670-a436-a1c6c7fba3b6
68e8aac5-4c54-4144-aee4-0f7b0aca3c0b	2025-05-19 19:42:02.780485+00	2025-05-19 19:42:02.780485+00	password	518673fa-7b68-4f9b-905f-e1a04cccfa30
d86be218-029f-43e3-baad-1c397c2cc378	2025-05-19 19:47:01.544426+00	2025-05-19 19:47:01.544426+00	password	2ef85d9f-2347-4d07-a832-b4933dc5197b
\.


--
-- TOC entry 4124 (class 0 OID 17258)
-- Dependencies: 251
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- TOC entry 4125 (class 0 OID 17263)
-- Dependencies: 252
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- TOC entry 4126 (class 0 OID 17268)
-- Dependencies: 253
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4127 (class 0 OID 17276)
-- Dependencies: 254
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	2	rx3img3exroi	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-02 23:49:01.063641+00	2025-05-02 23:49:01.063641+00	\N	d3277abf-4aff-4f16-9fe6-2521c5285a67
00000000-0000-0000-0000-000000000000	4	gqaexyakrrdj	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-02 23:51:12.525184+00	2025-05-03 00:50:11.568709+00	\N	e4a3ada8-1328-4325-bd16-864ac796daaa
00000000-0000-0000-0000-000000000000	6	7d2bscxkexji	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-03 00:50:11.569941+00	2025-05-03 14:47:35.604825+00	gqaexyakrrdj	e4a3ada8-1328-4325-bd16-864ac796daaa
00000000-0000-0000-0000-000000000000	9	udao7vymjco4	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-03 14:47:35.605932+00	2025-05-03 15:46:10.837575+00	7d2bscxkexji	e4a3ada8-1328-4325-bd16-864ac796daaa
00000000-0000-0000-0000-000000000000	10	i77rm2i3gj7q	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-03 15:46:10.838848+00	2025-05-03 23:59:50.439562+00	udao7vymjco4	e4a3ada8-1328-4325-bd16-864ac796daaa
00000000-0000-0000-0000-000000000000	12	yjv2dq6ii6mr	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-03 23:59:50.440676+00	2025-05-03 23:59:50.440676+00	i77rm2i3gj7q	e4a3ada8-1328-4325-bd16-864ac796daaa
00000000-0000-0000-0000-000000000000	14	nlg4c3f5u7xs	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 00:09:44.987321+00	2025-05-04 01:08:53.235464+00	\N	5874ab1b-5189-44de-8099-5378bf7cfee0
00000000-0000-0000-0000-000000000000	15	vu5idvarxrwr	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 00:20:57.425092+00	2025-05-04 01:19:40.658023+00	\N	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	16	ha4eb2ixhcix	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 01:08:53.237341+00	2025-05-04 15:23:53.638022+00	nlg4c3f5u7xs	5874ab1b-5189-44de-8099-5378bf7cfee0
00000000-0000-0000-0000-000000000000	18	bpane7jqtiqe	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-04 15:23:53.644417+00	2025-05-04 15:23:53.644417+00	ha4eb2ixhcix	5874ab1b-5189-44de-8099-5378bf7cfee0
00000000-0000-0000-0000-000000000000	17	o7i2wyivjaj3	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 01:19:40.659365+00	2025-05-04 15:23:54.45131+00	vu5idvarxrwr	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	19	3kx5ei4gza3y	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 15:23:54.451658+00	2025-05-04 16:22:19.387502+00	o7i2wyivjaj3	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	20	kumwaqz5tmyb	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 16:22:19.388716+00	2025-05-04 17:20:49.246982+00	3kx5ei4gza3y	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	21	3vh6xlnqoyga	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 17:20:49.248169+00	2025-05-04 18:20:02.022866+00	kumwaqz5tmyb	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	22	urbg7arhwagf	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-04 18:20:02.024658+00	2025-05-05 11:37:54.859735+00	3vh6xlnqoyga	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	24	a6mh5fk2aww2	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-05 11:37:54.863453+00	2025-05-05 11:37:54.863453+00	urbg7arhwagf	180cd880-fe7e-4584-9722-cebf9c6d7a35
00000000-0000-0000-0000-000000000000	23	wxznydqsqjde	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-04 18:47:45.025403+00	2025-05-05 11:38:13.943639+00	\N	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	25	e5xyumergait	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 11:38:13.943939+00	2025-05-05 12:36:57.251352+00	wxznydqsqjde	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	26	u7tx3x7hwp4q	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 12:36:57.254388+00	2025-05-05 13:35:56.284266+00	e5xyumergait	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	27	ra6hdvoqpvhv	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 13:35:56.286321+00	2025-05-05 14:34:38.227984+00	u7tx3x7hwp4q	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	28	ctyjdjd6qplh	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 14:34:38.23017+00	2025-05-05 15:33:14.265705+00	ra6hdvoqpvhv	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	29	npxhvl5z5xmm	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 15:33:14.266866+00	2025-05-05 16:31:19.468438+00	ctyjdjd6qplh	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	30	37f7uxdezb64	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 16:31:19.470547+00	2025-05-05 17:29:45.315119+00	npxhvl5z5xmm	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	31	dbsg2ocxmp5n	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 17:29:45.3236+00	2025-05-05 19:41:29.093776+00	37f7uxdezb64	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	34	3rhmjyyeinpq	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-05 20:05:57.944258+00	2025-05-06 00:05:29.914872+00	\N	992c5927-35ba-4e69-9ce4-2a19b307103f
00000000-0000-0000-0000-000000000000	33	yb4s3vf6knt3	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-05 20:04:15.424306+00	2025-05-06 00:05:46.71664+00	\N	31d63cb9-c736-4d1b-9ecf-4bfc8fd09885
00000000-0000-0000-0000-000000000000	32	tevbfkunnids	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-05 19:41:29.096638+00	2025-05-06 00:06:33.890683+00	dbsg2ocxmp5n	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	35	xjz4s6yz624a	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-06 00:05:29.922093+00	2025-05-06 01:04:42.039976+00	3rhmjyyeinpq	992c5927-35ba-4e69-9ce4-2a19b307103f
00000000-0000-0000-0000-000000000000	36	o7hrinfurqk6	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-06 00:05:46.717405+00	2025-05-06 01:04:47.997044+00	yb4s3vf6knt3	31d63cb9-c736-4d1b-9ecf-4bfc8fd09885
00000000-0000-0000-0000-000000000000	39	ggpfdpwk4gr2	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-06 01:04:47.997369+00	2025-05-06 11:40:45.0313+00	o7hrinfurqk6	31d63cb9-c736-4d1b-9ecf-4bfc8fd09885
00000000-0000-0000-0000-000000000000	38	khyi43v4ooah	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-06 01:04:42.041955+00	2025-05-06 11:40:57.699558+00	xjz4s6yz624a	992c5927-35ba-4e69-9ce4-2a19b307103f
00000000-0000-0000-0000-000000000000	41	okf7gyenfeoi	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-06 11:40:57.699898+00	2025-05-06 11:40:57.699898+00	khyi43v4ooah	992c5927-35ba-4e69-9ce4-2a19b307103f
00000000-0000-0000-0000-000000000000	37	ucj57petq3jc	6df9e318-722c-48f7-ada2-99d69f20efc7	t	2025-05-06 00:06:33.89307+00	2025-05-06 13:12:19.742619+00	tevbfkunnids	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	42	pxy64k4tlshu	6df9e318-722c-48f7-ada2-99d69f20efc7	f	2025-05-06 13:12:19.750944+00	2025-05-06 13:12:19.750944+00	ucj57petq3jc	840977e9-2a3e-448d-8ee6-130de283c9f2
00000000-0000-0000-0000-000000000000	43	cpa6hmqjdoep	6df9e318-722c-48f7-ada2-99d69f20efc7	f	2025-05-06 13:13:07.826338+00	2025-05-06 13:13:07.826338+00	\N	4dfe321c-fa31-4dda-85df-eecb37382095
00000000-0000-0000-0000-000000000000	40	r7kezpztxin6	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-06 11:40:45.040262+00	2025-05-06 13:38:05.020179+00	ggpfdpwk4gr2	31d63cb9-c736-4d1b-9ecf-4bfc8fd09885
00000000-0000-0000-0000-000000000000	44	dnftu5rftgtx	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-06 13:38:05.024256+00	2025-05-06 13:38:05.024256+00	r7kezpztxin6	31d63cb9-c736-4d1b-9ecf-4bfc8fd09885
00000000-0000-0000-0000-000000000000	49	yl7ariny56br	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-06 14:55:50.560927+00	2025-05-06 16:56:12.624935+00	\N	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	50	fyphlpwpvlve	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-06 16:56:12.627159+00	2025-05-06 18:25:10.715234+00	yl7ariny56br	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	51	4vljp6kqo6f6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-06 18:25:10.717951+00	2025-05-06 23:50:44.687964+00	fyphlpwpvlve	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	52	l3n772uw6v7p	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-06 23:50:44.69414+00	2025-05-07 00:49:23.90839+00	4vljp6kqo6f6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	53	iucugyoar3kw	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-07 00:49:23.912019+00	2025-05-10 13:21:36.143918+00	l3n772uw6v7p	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	54	on25aydncswr	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-10 13:21:36.159521+00	2025-05-10 14:21:02.585229+00	iucugyoar3kw	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	55	pek4tlcm2qdf	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-10 14:21:02.591823+00	2025-05-10 15:20:01.586689+00	on25aydncswr	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	72	jjr5fuwaxnln	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-14 19:20:29.212592+00	2025-05-14 20:21:08.948783+00	gj56py4xvjf6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	56	huveaq6ttdos	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-10 15:20:01.589521+00	2025-05-10 16:18:40.739029+00	pek4tlcm2qdf	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	73	jizdkpgh57p5	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-14 20:21:08.952242+00	2025-05-15 15:57:53.746529+00	jjr5fuwaxnln	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	57	3gn5tddps2or	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-10 16:18:40.747111+00	2025-05-12 11:58:45.219442+00	huveaq6ttdos	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	58	4otw7cqkklos	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 11:58:45.22998+00	2025-05-12 13:18:50.480434+00	3gn5tddps2or	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	74	xfb44lxbwez6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-15 15:57:53.768449+00	2025-05-15 17:40:09.83955+00	jizdkpgh57p5	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	59	iavflfbs3h5w	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 13:18:50.486401+00	2025-05-12 14:17:18.371535+00	4otw7cqkklos	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	75	rud2lcx6tkpz	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-15 17:40:09.843308+00	2025-05-15 19:08:17.991745+00	xfb44lxbwez6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	60	3iy7wzwmc4k6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 14:17:18.378811+00	2025-05-12 15:15:48.962228+00	iavflfbs3h5w	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	61	lpcxybryfnsm	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 15:15:48.966278+00	2025-05-12 16:14:51.949654+00	3iy7wzwmc4k6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	76	h2h7ftnxn7nb	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-15 19:08:17.993629+00	2025-05-15 20:06:48.511093+00	rud2lcx6tkpz	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	62	do6hxkbrag6e	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 16:14:51.952767+00	2025-05-12 17:23:45.310829+00	lpcxybryfnsm	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	63	6aln5dm7lrv6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 17:23:45.313737+00	2025-05-12 19:38:33.33222+00	do6hxkbrag6e	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	64	53gjvezopdji	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-12 19:38:33.33655+00	2025-05-13 11:48:47.603884+00	6aln5dm7lrv6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	78	mb76zfrxgc6v	69e25475-81bf-4fc1-8ced-9bb52ee48743	t	2025-05-16 00:17:27.241919+00	2025-05-16 08:21:11.327018+00	\N	8807f7f4-fd1e-45a4-82b0-a0a319adc1c8
00000000-0000-0000-0000-000000000000	65	dphzelianqgs	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-13 11:48:47.617306+00	2025-05-13 16:42:03.690046+00	53gjvezopdji	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	79	opyqywcoliec	69e25475-81bf-4fc1-8ced-9bb52ee48743	f	2025-05-16 08:21:11.331633+00	2025-05-16 08:21:11.331633+00	mb76zfrxgc6v	8807f7f4-fd1e-45a4-82b0-a0a319adc1c8
00000000-0000-0000-0000-000000000000	66	2oaxoqpb27cd	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-13 16:42:03.697182+00	2025-05-13 17:41:35.433796+00	dphzelianqgs	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	77	xw7hqen34m3j	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-15 20:06:48.513897+00	2025-05-16 11:39:51.078322+00	h2h7ftnxn7nb	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	67	2wf2a2wuwxut	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-13 17:41:35.438203+00	2025-05-13 18:47:28.379387+00	2oaxoqpb27cd	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	68	c57oypowwxu2	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-13 18:47:28.384054+00	2025-05-13 19:54:05.12979+00	2wf2a2wuwxut	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	80	zjynhucoewys	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-16 11:39:51.084713+00	2025-05-16 15:52:24.357742+00	xw7hqen34m3j	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	69	2glsehxbhcla	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-13 19:54:05.131427+00	2025-05-14 12:00:00.152572+00	c57oypowwxu2	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	70	uvozpi3irlc2	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-14 12:00:00.164554+00	2025-05-14 16:38:58.241241+00	2glsehxbhcla	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	81	dil7u7otfv2p	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-16 15:52:24.360208+00	2025-05-16 16:51:22.202832+00	zjynhucoewys	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	71	gj56py4xvjf6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-14 16:38:58.247299+00	2025-05-14 19:20:29.2015+00	uvozpi3irlc2	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	82	ajc6j4tkjvxp	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-16 16:51:22.214022+00	2025-05-16 18:54:50.194262+00	dil7u7otfv2p	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	83	7dmjtyl3yzwn	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-16 18:54:50.19703+00	2025-05-16 19:53:24.355975+00	ajc6j4tkjvxp	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	84	fr55e7cvgkmp	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-16 19:53:24.35941+00	2025-05-17 00:16:24.364046+00	7dmjtyl3yzwn	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	85	ofg6iij5idct	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-17 00:16:24.368158+00	2025-05-17 01:15:15.03353+00	fr55e7cvgkmp	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	86	uwv2iorctlh7	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-17 01:15:15.035731+00	2025-05-17 17:40:30.133702+00	ofg6iij5idct	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	87	oxeygmqa672j	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-17 17:40:30.140832+00	2025-05-18 00:51:57.27677+00	uwv2iorctlh7	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	88	ftxzje5kchdx	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-18 00:51:57.278506+00	2025-05-18 14:55:13.307693+00	oxeygmqa672j	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	89	mohoa755x4z6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-18 14:55:13.314487+00	2025-05-19 11:53:41.352661+00	ftxzje5kchdx	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	91	mmppvwfjx5w6	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 11:53:41.360801+00	2025-05-19 12:51:48.526925+00	mohoa755x4z6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	92	ey4x6r5uesjc	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 12:51:48.529462+00	2025-05-19 13:50:36.332022+00	mmppvwfjx5w6	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	93	jdbg4xgu4rri	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 13:50:36.33922+00	2025-05-19 14:51:13.781351+00	ey4x6r5uesjc	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	94	cj5djzqmt6tb	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 14:51:13.78278+00	2025-05-19 15:49:29.26991+00	jdbg4xgu4rri	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	95	i5ga7pfyrnar	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 15:49:29.274923+00	2025-05-19 16:48:01.077769+00	cj5djzqmt6tb	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	96	aad5fyskmqkw	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 16:48:01.088799+00	2025-05-19 17:56:55.540156+00	i5ga7pfyrnar	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	97	fjfdqqq4r6am	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 17:56:55.542154+00	2025-05-19 18:55:37.103886+00	aad5fyskmqkw	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	99	kxf5jcm47tfm	fcb89b39-5751-47d3-a5ad-f125b5a0ed4e	f	2025-05-19 19:42:02.774946+00	2025-05-19 19:42:02.774946+00	\N	68e8aac5-4c54-4144-aee4-0f7b0aca3c0b
00000000-0000-0000-0000-000000000000	100	xl546to5yhv2	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9	f	2025-05-19 19:47:01.539587+00	2025-05-19 19:47:01.539587+00	\N	d86be218-029f-43e3-baad-1c397c2cc378
00000000-0000-0000-0000-000000000000	98	gts2vskx2swp	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 18:55:37.106704+00	2025-05-19 19:54:15.257306+00	fjfdqqq4r6am	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	101	7ivm4nnlz6sk	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	t	2025-05-19 19:54:15.260042+00	2025-05-19 20:53:01.371515+00	gts2vskx2swp	1e617d53-3444-4cef-b22f-398928e9fe00
00000000-0000-0000-0000-000000000000	102	pyrwtgsjh2hq	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	f	2025-05-19 20:53:01.378897+00	2025-05-19 20:53:01.378897+00	7ivm4nnlz6sk	1e617d53-3444-4cef-b22f-398928e9fe00
\.


--
-- TOC entry 4129 (class 0 OID 17282)
-- Dependencies: 256
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- TOC entry 4130 (class 0 OID 17290)
-- Dependencies: 257
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- TOC entry 4131 (class 0 OID 17296)
-- Dependencies: 258
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- TOC entry 4132 (class 0 OID 17299)
-- Dependencies: 259
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
d3277abf-4aff-4f16-9fe6-2521c5285a67	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-02 23:49:01.061679+00	2025-05-02 23:49:01.061679+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	179.135.188.240	\N
e4a3ada8-1328-4325-bd16-864ac796daaa	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-02 23:51:12.524059+00	2025-05-03 23:59:50.449643+00	\N	aal1	\N	2025-05-03 23:59:50.449573	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	179.135.188.240	\N
992c5927-35ba-4e69-9ce4-2a19b307103f	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-05 20:05:57.943142+00	2025-05-06 11:40:57.702817+00	\N	aal1	\N	2025-05-06 11:40:57.702738	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	186.209.47.162	\N
840977e9-2a3e-448d-8ee6-130de283c9f2	6df9e318-722c-48f7-ada2-99d69f20efc7	2025-05-04 18:47:45.023631+00	2025-05-06 13:12:19.75891+00	\N	aal1	\N	2025-05-06 13:12:19.758831	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	186.209.47.162	\N
5874ab1b-5189-44de-8099-5378bf7cfee0	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-04 00:09:44.981983+00	2025-05-04 15:23:53.656682+00	\N	aal1	\N	2025-05-04 15:23:53.655999	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	179.135.188.240	\N
4dfe321c-fa31-4dda-85df-eecb37382095	6df9e318-722c-48f7-ada2-99d69f20efc7	2025-05-06 13:13:07.823944+00	2025-05-06 13:13:07.823944+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	186.209.47.162	\N
31d63cb9-c736-4d1b-9ecf-4bfc8fd09885	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-05 20:04:15.418933+00	2025-05-06 13:38:05.027518+00	\N	aal1	\N	2025-05-06 13:38:05.027444	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	186.209.47.162	\N
180cd880-fe7e-4584-9722-cebf9c6d7a35	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-04 00:20:57.424073+00	2025-05-05 11:37:54.869831+00	\N	aal1	\N	2025-05-05 11:37:54.869753	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	186.209.47.162	\N
8807f7f4-fd1e-45a4-82b0-a0a319adc1c8	69e25475-81bf-4fc1-8ced-9bb52ee48743	2025-05-16 00:17:27.23532+00	2025-05-16 08:21:11.344164+00	\N	aal1	\N	2025-05-16 08:21:11.342601	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36	179.130.187.56	\N
68e8aac5-4c54-4144-aee4-0f7b0aca3c0b	fcb89b39-5751-47d3-a5ad-f125b5a0ed4e	2025-05-19 19:42:02.772232+00	2025-05-19 19:42:02.772232+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36	179.130.187.56	\N
d86be218-029f-43e3-baad-1c397c2cc378	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9	2025-05-19 19:47:01.538851+00	2025-05-19 19:47:01.538851+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	186.209.47.162	\N
1e617d53-3444-4cef-b22f-398928e9fe00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	2025-05-06 14:55:50.559998+00	2025-05-19 20:53:01.385145+00	\N	aal1	\N	2025-05-19 20:53:01.385073	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	179.130.187.56	\N
\.


--
-- TOC entry 4133 (class 0 OID 17304)
-- Dependencies: 260
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4134 (class 0 OID 17310)
-- Dependencies: 261
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4135 (class 0 OID 17316)
-- Dependencies: 262
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	6df9e318-722c-48f7-ada2-99d69f20efc7	authenticated	authenticated	thiagohenriquesousa4@gmail.com	$2a$10$IoB11X5iEnuTwVjXnDYAVeKgMvf6kSXpFEL3McQXhMGyl6V09Xrsm	2025-05-04 18:47:45.017312+00	\N		\N		\N			\N	2025-05-06 13:13:07.82317+00	{"provider": "email", "providers": ["email"]}	{"sub": "6df9e318-722c-48f7-ada2-99d69f20efc7", "name": "Thiago Sousa", "email": "thiagohenriquesousa4@gmail.com", "business_name": "THS", "email_verified": true, "phone_verified": false}	\N	2025-05-04 18:47:44.995311+00	2025-05-06 13:13:07.827193+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	69e25475-81bf-4fc1-8ced-9bb52ee48743	authenticated	authenticated	w_rodolfoo@hotmail.com	$2a$10$qW4nGwHnUNq5SC6QUaBjderIWl44gzfVCQXZ8SXjRKhauqnnyTCVe	2025-05-02 23:45:44.798144+00	\N		\N		\N			\N	2025-05-16 00:17:27.23352+00	{"provider": "email", "providers": ["email"]}	{"sub": "69e25475-81bf-4fc1-8ced-9bb52ee48743", "name": "Wellington Rodolfo Souza Silva", "email": "w_rodolfoo@hotmail.com", "business_name": "Rodolfo", "email_verified": true, "phone_verified": false}	\N	2025-05-02 23:45:44.76296+00	2025-05-16 08:21:11.336059+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9	authenticated	authenticated	thiagohenriquesousa@gmail.com	$2a$10$4AJ.SoQbcLuifa4icEoAY./OoHBqHVr5AmzTJJyPxj3zB36mX5riu	2025-05-19 19:47:01.534605+00	\N		\N		\N			\N	2025-05-19 19:47:01.538784+00	{"provider": "email", "providers": ["email"]}	{"sub": "05b1dda4-1389-4d2e-8ffb-475aa4ba96a9", "name": "THIAGO HENRIQUE DE SOUSA", "email": "thiagohenriquesousa@gmail.com", "business_name": "dohoo", "email_verified": true, "phone_verified": false}	\N	2025-05-19 19:47:01.525467+00	2025-05-19 19:47:01.544018+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	authenticated	authenticated	w.rodolfo@outlook.com.br	$2a$10$Bx0KyBMqP9JGO7l4/L9uh.jKW.H2mwnN2NHZmbHAYMtM.ZrPCZq42	2025-05-06 14:55:50.55561+00	\N		\N		\N			\N	2025-05-06 14:55:50.55992+00	{"provider": "email", "providers": ["email"]}	{"sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "name": "Wellington Rodolfo Souza Silva", "email": "w.rodolfo@outlook.com.br", "business_name": "Rodolfo", "email_verified": true, "phone_verified": false}	\N	2025-05-06 14:55:50.545469+00	2025-05-19 20:53:01.382156+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fcb89b39-5751-47d3-a5ad-f125b5a0ed4e	authenticated	authenticated	gabsdecarlo@gmail.com	$2a$10$xhn.YBU3LK/IfGjdlS0twujCFACzgZR34DgCElYx2Kj9sIBK.8d7C	2025-05-19 19:42:02.766007+00	\N		\N		\N			\N	2025-05-19 19:42:02.77155+00	{"provider": "email", "providers": ["email"]}	{"sub": "fcb89b39-5751-47d3-a5ad-f125b5a0ed4e", "name": "Gabriela De Carlo", "email": "gabsdecarlo@gmail.com", "business_name": "Gabs", "email_verified": true, "phone_verified": false}	\N	2025-05-19 19:42:02.743592+00	2025-05-19 19:42:02.780036+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- TOC entry 4136 (class 0 OID 17331)
-- Dependencies: 263
-- Data for Name: ai_configurations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_configurations (id, user_id, model, temperature, max_tokens, training_data, prompt, created_at, provider, working_hours) FROM stdin;
\.


--
-- TOC entry 4137 (class 0 OID 17340)
-- Dependencies: 264
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, client_id, professional_id, specialty_id, calendar_id, start_time, end_time, status, notes, created_at, user_id) FROM stdin;
295df801-1e5b-4990-8f41-a1647a17d129	141a0cea-cdb5-417a-8751-4e608e18f0b7	20f968a2-ff7a-46f2-8835-bb884797261a	be0c1d0b-edc1-400f-a86a-9b5af529459e	\N	2025-05-19 18:45:00+00	2025-05-19 19:30:00+00	confirmed		2025-05-19 14:54:51.196059+00	\N
3b9fe2da-b99d-498c-ab6b-9a62a8382c9d	141a0cea-cdb5-417a-8751-4e608e18f0b7	20f968a2-ff7a-46f2-8835-bb884797261a	be0c1d0b-edc1-400f-a86a-9b5af529459e	\N	2025-05-19 18:45:00+00	2025-05-19 19:30:00+00	confirmed		2025-05-19 14:57:16.917001+00	\N
9390686f-7218-48df-9085-239b4aa9d23e	141a0cea-cdb5-417a-8751-4e608e18f0b7	20f968a2-ff7a-46f2-8835-bb884797261a	be0c1d0b-edc1-400f-a86a-9b5af529459e	\N	2025-05-19 18:45:00+00	2025-05-19 19:30:00+00	confirmed		2025-05-19 15:08:45.783634+00	\N
af52718d-c872-4e15-b7bd-c079ffa6e85d	2b566016-ffeb-4286-9516-25f0693f46e7	b1be4a17-83b2-48be-8608-0db7d49d8370	b6d6bcb0-5e87-49ce-94e0-57007d5e6e50	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 12:20:00+00	2025-05-19 12:40:00+00	pending		2025-05-19 15:23:36.745704+00	\N
ca927f51-ef03-40e9-ba98-2d9455f9c1db	f63e1bb0-a748-45ab-a03c-b94302557691	20f968a2-ff7a-46f2-8835-bb884797261a	80eb5ca1-c48d-42b1-8eb6-3d44eb95eaa1	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 16:40:00+00	2025-05-19 17:20:00+00	pending		2025-05-19 15:26:44.598404+00	\N
88b6c391-4638-4c16-b15d-c022e05e855c	2b566016-ffeb-4286-9516-25f0693f46e7	b1be4a17-83b2-48be-8608-0db7d49d8370	b6d6bcb0-5e87-49ce-94e0-57007d5e6e50	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 12:20:00+00	2025-05-19 12:40:00+00	canceled		2025-05-19 15:20:29.481817+00	\N
60d5e9ad-7a91-4785-a50c-d77fcc3170f0	4130d8e3-3e9b-4cd2-ac27-6bf135490bdc	20f968a2-ff7a-46f2-8835-bb884797261a	be0c1d0b-edc1-400f-a86a-9b5af529459e	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 18:45:00+00	2025-05-19 19:30:00+00	pending		2025-05-19 15:30:08.404791+00	\N
08334448-ed17-4835-b9ca-918d778388d6	2399c365-facf-4c6c-ae64-15dbe5879261	b1be4a17-83b2-48be-8608-0db7d49d8370	be0c1d0b-edc1-400f-a86a-9b5af529459e	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 15:30:00+00	2025-05-19 16:15:00+00	confirmed		2025-05-19 12:26:42.742717+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
28cb00c6-7614-4b07-9dbe-a158a903a8ea	2b566016-ffeb-4286-9516-25f0693f46e7	b1be4a17-83b2-48be-8608-0db7d49d8370	b6d6bcb0-5e87-49ce-94e0-57007d5e6e50	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 19:20:00+00	2025-05-19 19:40:00+00	confirmed		2025-05-19 15:22:38.02764+00	\N
d8fe4d1e-9fab-4686-9d4d-33c49e2b381f	d8983167-3e5e-4415-a9a7-9193a65fbac7	b1be4a17-83b2-48be-8608-0db7d49d8370	80eb5ca1-c48d-42b1-8eb6-3d44eb95eaa1	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-17 10:30:00+00	2025-05-17 11:10:00+00	confirmed		2025-05-17 01:00:52.409836+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
ab65eefa-2949-4901-ab85-9d1a66fa0c90	2b566016-ffeb-4286-9516-25f0693f46e7	b1be4a17-83b2-48be-8608-0db7d49d8370	b6d6bcb0-5e87-49ce-94e0-57007d5e6e50	65adb01c-d410-4f47-aa84-1a844bd72a02	2025-05-19 12:20:00+00	2025-05-19 12:40:00+00	pending	sfsgsafsbd	2025-05-19 15:25:35.891859+00	\N
38571ab3-c774-4d71-a114-8d875d75137e	c743fb88-908c-44b7-9c3c-92ad402c42a4	044744ff-ecbb-4f76-8211-454e6b506366	e4c3fbb7-993e-4fca-bfbe-f1f40c1f6ef2	27de3413-3185-4545-81af-2207ce512622	2025-05-19 17:00:00+00	2025-05-19 17:40:00+00	pending		2025-05-19 19:29:59.990681+00	\N
\.


--
-- TOC entry 4138 (class 0 OID 17348)
-- Dependencies: 265
-- Data for Name: calendars; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendars (id, name, location_id, created_at, owner_id, user_id) FROM stdin;
27de3413-3185-4545-81af-2207ce512622	Dohoo Barber	Vinhedo, São Paulo	2025-05-10 15:51:05.687257+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	\N
65adb01c-d410-4f47-aa84-1a844bd72a02	Clinica Dentista Sorridente	Campinas, São Paulo	2025-05-15 16:48:12.745792+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff	\N
e0050c0d-0385-472b-8618-c7207417a2f9	vet	valinhos	2025-05-19 19:47:39.736249+00	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9	\N
\.


--
-- TOC entry 4139 (class 0 OID 17355)
-- Dependencies: 266
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, name, email, phone, created_at, calendar_id, user_id, owner_id) FROM stdin;
011e54cf-725f-4297-8995-26c74b6b44b8	Maria	maria@gmail.com	19981077884	2025-05-15 16:35:40.481121+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
d8983167-3e5e-4415-a9a7-9193a65fbac7	Marcos Sousa	marcos@gmail.com	41982765883	2025-05-15 20:02:32.806083+00	65adb01c-d410-4f47-aa84-1a844bd72a02	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
c45412bf-35d0-456a-90d4-636f51bcb932	Amanda	amandagabriele@gmail.com	19996577448	2025-05-12 12:31:18.379828+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
ade8995e-99ad-4092-b035-a2a35241c1d7	THIAGO HENRIQUE DE SOUSA	thiagohenriquesousa4@gmail.com	19993430256	2025-05-15 16:33:13.982027+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
2399c365-facf-4c6c-ae64-15dbe5879261	Gabriela De Carlo	gabsdecarlo@gmail.com	19982266198	2025-05-10 16:12:15.334502+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
141a0cea-cdb5-417a-8751-4e608e18f0b7	Carlos	carlos@carlos.com	16446232662	2025-05-19 14:54:50.485749+00	65adb01c-d410-4f47-aa84-1a844bd72a02	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
4130d8e3-3e9b-4cd2-ac27-6bf135490bdc	rrrrrrrrrrttttttttttt	w.rodolfo@outlook.com.br	19982714339	2025-05-19 15:30:08.352669+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
f63e1bb0-a748-45ab-a03c-b94302557691	aaaaaaaaaaaaaaaaaa	ddddddddddddddwwww@fffffff.com	46555555555555	2025-05-19 15:26:44.538656+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
2b566016-ffeb-4286-9516-25f0693f46e7	sdfghjkl	rtyuio@email.com	44444444444444	2025-05-19 15:20:29.354255+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
c743fb88-908c-44b7-9c3c-92ad402c42a4	Joaquim	x@x.com	12345678912	2025-05-19 19:29:59.897072+00	27de3413-3185-4545-81af-2207ce512622	\N	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
\.


--
-- TOC entry 4140 (class 0 OID 17362)
-- Dependencies: 267
-- Data for Name: professional_specialties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professional_specialties (id, professional_id, specialty_id, created_at) FROM stdin;
fffc5b5d-b6b9-4425-83cf-5fd36780c1c6	f916af7d-5522-495d-911a-8fc3b88c9087	d45128b5-9eb4-4523-b577-a3bfafedddfd	2025-05-15 19:28:09.032372+00
34c80e40-4309-4ee1-a0e6-c3a6c7e2ee78	044744ff-ecbb-4f76-8211-454e6b506366	e4c3fbb7-993e-4fca-bfbe-f1f40c1f6ef2	2025-05-15 20:01:24.942065+00
0750e51f-c104-452f-9763-3968546129a6	044744ff-ecbb-4f76-8211-454e6b506366	be0c1d0b-edc1-400f-a86a-9b5af529459e	2025-05-15 20:01:24.942065+00
d5e201c2-1b89-4929-b731-4be10cfb158e	20f968a2-ff7a-46f2-8835-bb884797261a	80eb5ca1-c48d-42b1-8eb6-3d44eb95eaa1	2025-05-15 20:01:39.798596+00
bc5169a3-484d-4179-895d-b79861022fd4	20f968a2-ff7a-46f2-8835-bb884797261a	be0c1d0b-edc1-400f-a86a-9b5af529459e	2025-05-15 20:01:39.798596+00
39d69c24-3da0-4b07-b56b-951a3e230feb	b1be4a17-83b2-48be-8608-0db7d49d8370	b6d6bcb0-5e87-49ce-94e0-57007d5e6e50	2025-05-19 12:58:43.73436+00
6dec9928-c5f9-4722-acbd-34bd980b046c	b1be4a17-83b2-48be-8608-0db7d49d8370	80eb5ca1-c48d-42b1-8eb6-3d44eb95eaa1	2025-05-19 12:58:43.73436+00
f173f2c8-a0cd-48d1-b673-9c8676819a4d	2cf9b41a-cfc2-4703-b68d-4573f0381730	ed1981e5-8b74-4bff-9c56-3824d8b2fa5d	2025-05-19 19:48:56.778336+00
\.


--
-- TOC entry 4141 (class 0 OID 17367)
-- Dependencies: 268
-- Data for Name: professionals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professionals (id, name, specialty_id, calendar_id, email, phone, avatar, bio, created_at, user_id) FROM stdin;
044744ff-ecbb-4f76-8211-454e6b506366	Rodolfo Silva	d45128b5-9eb4-4523-b577-a3bfafedddfd	27de3413-3185-4545-81af-2207ce512622	rodolfo.silva@minhaera.com.br	19982714339	\N	\N	2025-05-10 16:10:05.443108+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
20f968a2-ff7a-46f2-8835-bb884797261a	Silva	\N	65adb01c-d410-4f47-aa84-1a844bd72a02	w.rodolfo@outlook.com.br	19982714339	\N	\N	2025-05-15 19:38:06.233111+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
f916af7d-5522-495d-911a-8fc3b88c9087	Thiago Sousa	0d058c66-c72a-4a8f-871a-57c6ef8e5396	27de3413-3185-4545-81af-2207ce512622	thiagohenriquesousa4@gmail.com	193199500	\N	\N	2025-05-10 16:09:27.506136+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
b1be4a17-83b2-48be-8608-0db7d49d8370	Dra Ana	be0c1d0b-edc1-400f-a86a-9b5af529459e	65adb01c-d410-4f47-aa84-1a844bd72a02	draana@gmail.com	11794456339	\N	\N	2025-05-15 16:50:04.130403+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
2cf9b41a-cfc2-4703-b68d-4573f0381730	THIAGO HENRIQUE DE SOUSA	\N	e0050c0d-0385-472b-8618-c7207417a2f9	thiagohenriquesousa4@gmail.com	19993430256	\N	\N	2025-05-19 19:48:56.704414+00	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9
\.


--
-- TOC entry 4142 (class 0 OID 17374)
-- Dependencies: 269
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialties (id, name, calendar_id, duration, price, description, created_at, user_id) FROM stdin;
d45128b5-9eb4-4523-b577-a3bfafedddfd	Cabelo	27de3413-3185-4545-81af-2207ce512622	45	50.00	Corte de cabelo	2025-05-10 15:51:48.404625+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
e4c3fbb7-993e-4fca-bfbe-f1f40c1f6ef2	Barba	27de3413-3185-4545-81af-2207ce512622	40	30.00	Barba completa	2025-05-10 15:52:19.01645+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
0d058c66-c72a-4a8f-871a-57c6ef8e5396	Combo	27de3413-3185-4545-81af-2207ce512622	70	75.00	Corte de cabelo e barba	2025-05-10 15:52:38.799506+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
be0c1d0b-edc1-400f-a86a-9b5af529459e	Ortodontista	65adb01c-d410-4f47-aa84-1a844bd72a02	45	120.00	Consulta para manutenção de aparelho	2025-05-15 16:48:43.935873+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
80eb5ca1-c48d-42b1-8eb6-3d44eb95eaa1	Obturação	65adb01c-d410-4f47-aa84-1a844bd72a02	40	90.00	Consulta para obturação	2025-05-15 16:49:04.634049+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
b6d6bcb0-5e87-49ce-94e0-57007d5e6e50	Raio - X	65adb01c-d410-4f47-aa84-1a844bd72a02	20	180.00	Raio X Completo	2025-05-15 16:49:32.169543+00	cf25be2e-36dc-40f9-996b-ea5ab9ba9eff
ed1981e5-8b74-4bff-9c56-3824d8b2fa5d	Consulta 	e0050c0d-0385-472b-8618-c7207417a2f9	30	50.00	Consulta basica	2025-05-19 19:48:18.081531+00	05b1dda4-1389-4d2e-8ffb-475aa4ba96a9
\.


--
-- TOC entry 4143 (class 0 OID 17381)
-- Dependencies: 270
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, description, price, features, created_at) FROM stdin;
5d14538d-9f51-41ba-a686-12c6b27af642	Free	Perfect for personal use	0.00	{"analytics": false, "calendars": 1, "professionals": 1, "custom_branding": false, "sms_notifications": false, "email_notifications": true, "appointments_per_month": 50}	2025-05-02 20:34:33.249069+00
13a351d7-08e5-41f0-8658-19e4e40b7254	Business	For growing businesses	29.99	{"analytics": true, "calendars": -1, "professionals": -1, "custom_branding": true, "sms_notifications": true, "email_notifications": true, "appointments_per_month": -1}	2025-05-02 20:34:33.249069+00
\.


--
-- TOC entry 4144 (class 0 OID 17388)
-- Dependencies: 271
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_settings (user_id, timezone, language, notification_preferences, created_at, updated_at, openai_key, deepseek_key, elevenlabs_key) FROM stdin;
2399c365-facf-4c6c-ae64-15dbe5879261	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-10 16:12:15.334502+00	2025-05-10 16:12:15.334502+00	\N	\N	\N
c45412bf-35d0-456a-90d4-636f51bcb932	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-12 12:31:18.379828+00	2025-05-12 12:31:18.379828+00	\N	\N	\N
ade8995e-99ad-4092-b035-a2a35241c1d7	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-15 16:33:13.982027+00	2025-05-15 16:33:13.982027+00	\N	\N	\N
011e54cf-725f-4297-8995-26c74b6b44b8	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-15 16:35:40.481121+00	2025-05-15 16:35:40.481121+00	\N	\N	\N
d8983167-3e5e-4415-a9a7-9193a65fbac7	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-15 20:02:32.806083+00	2025-05-15 20:02:32.806083+00	\N	\N	\N
141a0cea-cdb5-417a-8751-4e608e18f0b7	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-19 14:54:50.485749+00	2025-05-19 14:54:50.485749+00	\N	\N	\N
2b566016-ffeb-4286-9516-25f0693f46e7	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-19 15:20:29.354255+00	2025-05-19 15:20:29.354255+00	\N	\N	\N
f63e1bb0-a748-45ab-a03c-b94302557691	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-19 15:26:44.538656+00	2025-05-19 15:26:44.538656+00	\N	\N	\N
4130d8e3-3e9b-4cd2-ac27-6bf135490bdc	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-19 15:30:08.352669+00	2025-05-19 15:30:08.352669+00	\N	\N	\N
c743fb88-908c-44b7-9c3c-92ad402c42a4	America/Sao_Paulo	pt	{"sms": false, "email": true}	2025-05-19 19:29:59.897072+00	2025-05-19 19:29:59.897072+00	\N	\N	\N
\.


--
-- TOC entry 4145 (class 0 OID 17398)
-- Dependencies: 272
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, created_at) FROM stdin;
d5213287-fcbd-477b-85f4-af54b3d1640c	2399c365-facf-4c6c-ae64-15dbe5879261	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-10 16:12:15.334502+00	2025-06-10 16:12:15.334502+00	2025-05-10 16:12:15.334502+00
473869a8-e833-4bec-a54a-d00a7bbf5ddc	c45412bf-35d0-456a-90d4-636f51bcb932	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-12 12:31:18.379828+00	2025-06-12 12:31:18.379828+00	2025-05-12 12:31:18.379828+00
547036f5-7f6c-4dcb-b119-a228b7fd2bf5	ade8995e-99ad-4092-b035-a2a35241c1d7	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-15 16:33:13.982027+00	2025-06-15 16:33:13.982027+00	2025-05-15 16:33:13.982027+00
8fd68bb5-c6ab-42e2-8f65-cec2e07100bf	011e54cf-725f-4297-8995-26c74b6b44b8	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-15 16:35:40.481121+00	2025-06-15 16:35:40.481121+00	2025-05-15 16:35:40.481121+00
2bc4ebe7-0479-4f0c-b84d-be28e4a98252	d8983167-3e5e-4415-a9a7-9193a65fbac7	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-15 20:02:32.806083+00	2025-06-15 20:02:32.806083+00	2025-05-15 20:02:32.806083+00
5a4f2e0d-a675-4779-8207-13dbd5ccf561	141a0cea-cdb5-417a-8751-4e608e18f0b7	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-19 14:54:50.485749+00	2025-06-19 14:54:50.485749+00	2025-05-19 14:54:50.485749+00
58b2195a-fabd-41ab-bd7b-88f5b8540909	2b566016-ffeb-4286-9516-25f0693f46e7	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-19 15:20:29.354255+00	2025-06-19 15:20:29.354255+00	2025-05-19 15:20:29.354255+00
e4c6dc83-05d9-4fa3-be61-5f83f81e2686	f63e1bb0-a748-45ab-a03c-b94302557691	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-19 15:26:44.538656+00	2025-06-19 15:26:44.538656+00	2025-05-19 15:26:44.538656+00
a184367f-205f-477f-90c4-3950e9c80287	4130d8e3-3e9b-4cd2-ac27-6bf135490bdc	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-19 15:30:08.352669+00	2025-06-19 15:30:08.352669+00	2025-05-19 15:30:08.352669+00
5f5c794c-c974-4efe-8a4a-11949a0b63f8	c743fb88-908c-44b7-9c3c-92ad402c42a4	5d14538d-9f51-41ba-a686-12c6b27af642	active	2025-05-19 19:29:59.897072+00	2025-06-19 19:29:59.897072+00	2025-05-19 19:29:59.897072+00
\.


--
-- TOC entry 4146 (class 0 OID 17406)
-- Dependencies: 273
-- Data for Name: working_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.working_hours (id, professional_id, day_of_week, start_time, end_time, is_working_day, created_at) FROM stdin;
c21e0ef1-8f42-451c-bf11-e9a1087462f6	f916af7d-5522-495d-911a-8fc3b88c9087	1	09:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
4ce5c2ac-6ad7-420d-8c8f-2eec37ac26b9	f916af7d-5522-495d-911a-8fc3b88c9087	4	09:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
7ec01301-0535-48fc-afe0-b5faf08e68e3	f916af7d-5522-495d-911a-8fc3b88c9087	5	09:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
cd3d362a-5abb-4602-9a0c-6515ee7cf19c	044744ff-ecbb-4f76-8211-454e6b506366	2	09:00:00	17:00:00	t	2025-05-10 16:10:05.443108+00
f5d05332-a134-4cea-a71b-895814d34900	044744ff-ecbb-4f76-8211-454e6b506366	3	09:00:00	17:00:00	t	2025-05-10 16:10:05.443108+00
3adccc66-e1fd-498e-853c-85489a638091	044744ff-ecbb-4f76-8211-454e6b506366	4	09:00:00	17:00:00	t	2025-05-10 16:10:05.443108+00
1fcc6b93-691e-41ec-a6fb-18c8dad48387	044744ff-ecbb-4f76-8211-454e6b506366	5	09:00:00	17:00:00	t	2025-05-10 16:10:05.443108+00
0829c363-00a1-4e60-9909-5631bc9fb4ee	044744ff-ecbb-4f76-8211-454e6b506366	0	\N	\N	f	2025-05-10 16:10:05.443108+00
03e496fa-cd65-4af5-87f9-36647672a2fb	044744ff-ecbb-4f76-8211-454e6b506366	6	\N	\N	f	2025-05-10 16:10:05.443108+00
1bbadfcf-b105-4811-a035-66dd0aef4524	f916af7d-5522-495d-911a-8fc3b88c9087	6	09:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
96e25a80-7c47-4384-a033-12cdb9e34933	f916af7d-5522-495d-911a-8fc3b88c9087	3	08:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
ebd2deac-7b4d-4284-a0d6-2831b9c8cf1d	f916af7d-5522-495d-911a-8fc3b88c9087	0	08:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
ff43a52a-dc43-4fb2-ab3a-f97ecf91cbda	b1be4a17-83b2-48be-8608-0db7d49d8370	1	09:00:00	17:00:00	t	2025-05-15 16:50:04.130403+00
99493651-dce1-4521-bb51-932a78759918	b1be4a17-83b2-48be-8608-0db7d49d8370	2	09:00:00	17:00:00	t	2025-05-15 16:50:04.130403+00
9dbcd8e3-94ca-4316-8e8e-569b0a7a812a	b1be4a17-83b2-48be-8608-0db7d49d8370	3	09:00:00	17:00:00	t	2025-05-15 16:50:04.130403+00
b4256d8c-dc28-42ed-9902-e8f7ece719d9	b1be4a17-83b2-48be-8608-0db7d49d8370	4	09:00:00	17:00:00	t	2025-05-15 16:50:04.130403+00
1687536a-428c-4fe4-9c99-669129bd62d6	b1be4a17-83b2-48be-8608-0db7d49d8370	5	09:00:00	17:00:00	t	2025-05-15 16:50:04.130403+00
cd67b1c9-47ab-4836-9607-1a95e78fdaba	b1be4a17-83b2-48be-8608-0db7d49d8370	0	\N	\N	f	2025-05-15 16:50:04.130403+00
27d5e36f-9be0-400e-8362-0537f5edf8a5	b1be4a17-83b2-48be-8608-0db7d49d8370	6	\N	\N	f	2025-05-15 16:50:04.130403+00
a44a2dea-b6dd-405f-906e-615b2630e6d5	f916af7d-5522-495d-911a-8fc3b88c9087	2	08:00:00	17:00:00	t	2025-05-10 16:09:27.506136+00
4d3c3e5f-86ee-45e0-a38b-c1de18bd39ed	20f968a2-ff7a-46f2-8835-bb884797261a	1	09:00:00	17:00:00	t	2025-05-15 19:38:06.233111+00
289732a7-8a59-479e-9ab7-2a3ef832a125	20f968a2-ff7a-46f2-8835-bb884797261a	2	09:00:00	17:00:00	t	2025-05-15 19:38:06.233111+00
0376bd62-f5f2-4d49-87c6-6a6b1a1de190	20f968a2-ff7a-46f2-8835-bb884797261a	3	09:00:00	17:00:00	t	2025-05-15 19:38:06.233111+00
eb64a9eb-0f85-4f3f-bf9e-bc96b7616af9	20f968a2-ff7a-46f2-8835-bb884797261a	4	09:00:00	17:00:00	t	2025-05-15 19:38:06.233111+00
cadb3c68-21c7-4d1e-a7c8-1678d792c0dc	20f968a2-ff7a-46f2-8835-bb884797261a	5	09:00:00	17:00:00	t	2025-05-15 19:38:06.233111+00
968e0d64-bef6-4578-bed2-d0a0f859aae8	20f968a2-ff7a-46f2-8835-bb884797261a	0	\N	\N	f	2025-05-15 19:38:06.233111+00
090c0fde-6d03-4abc-9897-324cf92cb47e	20f968a2-ff7a-46f2-8835-bb884797261a	6	\N	\N	f	2025-05-15 19:38:06.233111+00
6478a21d-aeb0-43ae-aa36-59bd0e40e239	044744ff-ecbb-4f76-8211-454e6b506366	1	08:00:00	17:00:00	t	2025-05-10 16:10:05.443108+00
c5929917-f2f2-4373-b789-d9afb932325f	2cf9b41a-cfc2-4703-b68d-4573f0381730	1	09:00:00	17:00:00	t	2025-05-19 19:48:56.704414+00
39b95eb9-5b55-44b4-99c9-9d5f0e524b15	2cf9b41a-cfc2-4703-b68d-4573f0381730	2	09:00:00	17:00:00	t	2025-05-19 19:48:56.704414+00
cbef0b80-44c8-4266-ae83-bbbc38119dd7	2cf9b41a-cfc2-4703-b68d-4573f0381730	3	09:00:00	17:00:00	t	2025-05-19 19:48:56.704414+00
3855b995-f5c4-48be-9d7d-0ed98a6a0163	2cf9b41a-cfc2-4703-b68d-4573f0381730	4	09:00:00	17:00:00	t	2025-05-19 19:48:56.704414+00
c8084c4a-9f17-4729-a9b8-4dd0a584753e	2cf9b41a-cfc2-4703-b68d-4573f0381730	5	09:00:00	17:00:00	t	2025-05-19 19:48:56.704414+00
2d350e31-bc96-4c38-8884-9fc5b3da615d	2cf9b41a-cfc2-4703-b68d-4573f0381730	0	\N	\N	f	2025-05-19 19:48:56.704414+00
82204efb-0a80-4fae-8977-6aaa8ac38495	2cf9b41a-cfc2-4703-b68d-4573f0381730	6	\N	\N	f	2025-05-19 19:48:56.704414+00
\.


--
-- TOC entry 4147 (class 0 OID 17439)
-- Dependencies: 275
-- Data for Name: messages_2025_05_16; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_16 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4148 (class 0 OID 17448)
-- Dependencies: 276
-- Data for Name: messages_2025_05_17; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_17 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4149 (class 0 OID 17457)
-- Dependencies: 277
-- Data for Name: messages_2025_05_18; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_18 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4150 (class 0 OID 17466)
-- Dependencies: 278
-- Data for Name: messages_2025_05_19; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_19 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4151 (class 0 OID 17475)
-- Dependencies: 279
-- Data for Name: messages_2025_05_20; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_20 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4152 (class 0 OID 17484)
-- Dependencies: 280
-- Data for Name: messages_2025_05_21; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_21 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4162 (class 0 OID 19109)
-- Dependencies: 291
-- Data for Name: messages_2025_05_22; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_05_22 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 4153 (class 0 OID 17493)
-- Dependencies: 281
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-05-01 23:13:09
20211116045059	2025-05-01 23:13:14
20211116050929	2025-05-01 23:13:17
20211116051442	2025-05-01 23:13:20
20211116212300	2025-05-01 23:13:25
20211116213355	2025-05-01 23:13:28
20211116213934	2025-05-01 23:13:31
20211116214523	2025-05-01 23:13:36
20211122062447	2025-05-01 23:13:39
20211124070109	2025-05-01 23:13:42
20211202204204	2025-05-01 23:13:46
20211202204605	2025-05-01 23:13:49
20211210212804	2025-05-01 23:13:59
20211228014915	2025-05-01 23:14:03
20220107221237	2025-05-01 23:14:06
20220228202821	2025-05-01 23:14:08
20220312004840	2025-05-01 23:14:10
20220603231003	2025-05-01 23:14:12
20220603232444	2025-05-01 23:14:13
20220615214548	2025-05-01 23:14:15
20220712093339	2025-05-01 23:14:17
20220908172859	2025-05-01 23:14:18
20220916233421	2025-05-01 23:14:20
20230119133233	2025-05-01 23:14:22
20230128025114	2025-05-01 23:14:24
20230128025212	2025-05-01 23:14:25
20230227211149	2025-05-01 23:14:27
20230228184745	2025-05-01 23:14:28
20230308225145	2025-05-01 23:14:30
20230328144023	2025-05-01 23:14:31
20231018144023	2025-05-01 23:14:33
20231204144023	2025-05-01 23:14:35
20231204144024	2025-05-01 23:14:37
20231204144025	2025-05-01 23:14:39
20240108234812	2025-05-01 23:14:40
20240109165339	2025-05-01 23:14:42
20240227174441	2025-05-01 23:14:44
20240311171622	2025-05-01 23:14:46
20240321100241	2025-05-01 23:14:49
20240401105812	2025-05-01 23:14:52
20240418121054	2025-05-01 23:14:54
20240523004032	2025-05-01 23:14:59
20240618124746	2025-05-01 23:15:00
20240801235015	2025-05-01 23:15:02
20240805133720	2025-05-01 23:15:04
20240827160934	2025-05-01 23:15:06
20240919163303	2025-05-01 23:15:08
20240919163305	2025-05-01 23:15:09
20241019105805	2025-05-01 23:15:11
20241030150047	2025-05-01 23:15:16
20241108114728	2025-05-01 23:15:18
20241121104152	2025-05-01 23:15:20
20241130184212	2025-05-01 23:15:21
20241220035512	2025-05-01 23:15:23
20241220123912	2025-05-01 23:15:25
20241224161212	2025-05-01 23:15:26
20250107150512	2025-05-01 23:15:28
20250110162412	2025-05-01 23:15:30
20250123174212	2025-05-01 23:15:31
20250128220012	2025-05-01 23:15:33
\.


--
-- TOC entry 4154 (class 0 OID 17496)
-- Dependencies: 282
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
201	c4211a54-34f3-11f0-8d10-0a58a9feac02	public.appointments	{}	{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1746543350}], "aud": "authenticated", "exp": 1747691581, "iat": 1747687981, "iss": "https://zqtrmtkbkdzyapdtapss.supabase.co/auth/v1", "sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "role": "authenticated", "email": "w.rodolfo@outlook.com.br", "phone": "", "session_id": "1e617d53-3444-4cef-b22f-398928e9fe00", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "name": "Wellington Rodolfo Souza Silva", "email": "w.rodolfo@outlook.com.br", "business_name": "Rodolfo", "email_verified": true, "phone_verified": false}}	2025-05-19 20:56:42.124136
202	c42124cc-34f3-11f0-96dc-0a58a9feac02	public.appointments	{}	{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1746543350}], "aud": "authenticated", "exp": 1747691581, "iat": 1747687981, "iss": "https://zqtrmtkbkdzyapdtapss.supabase.co/auth/v1", "sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "role": "authenticated", "email": "w.rodolfo@outlook.com.br", "phone": "", "session_id": "1e617d53-3444-4cef-b22f-398928e9fe00", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "name": "Wellington Rodolfo Souza Silva", "email": "w.rodolfo@outlook.com.br", "business_name": "Rodolfo", "email_verified": true, "phone_verified": false}}	2025-05-19 20:56:42.124136
203	c4213110-34f3-11f0-bb13-0a58a9feac02	public.appointments	{}	{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1746543350}], "aud": "authenticated", "exp": 1747691581, "iat": 1747687981, "iss": "https://zqtrmtkbkdzyapdtapss.supabase.co/auth/v1", "sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "role": "authenticated", "email": "w.rodolfo@outlook.com.br", "phone": "", "session_id": "1e617d53-3444-4cef-b22f-398928e9fe00", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"sub": "cf25be2e-36dc-40f9-996b-ea5ab9ba9eff", "name": "Wellington Rodolfo Souza Silva", "email": "w.rodolfo@outlook.com.br", "business_name": "Rodolfo", "email_verified": true, "phone_verified": false}}	2025-05-19 20:56:42.124136
\.


--
-- TOC entry 4156 (class 0 OID 17505)
-- Dependencies: 284
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
\.


--
-- TOC entry 4157 (class 0 OID 17514)
-- Dependencies: 285
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-05-01 23:13:41.271722
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-05-01 23:13:41.27734
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-05-01 23:13:41.280247
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-05-01 23:13:41.296786
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-05-01 23:13:41.320964
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-05-01 23:13:41.323723
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-05-01 23:13:41.327382
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-05-01 23:13:41.330282
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-05-01 23:13:41.333
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-05-01 23:13:41.335976
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-05-01 23:13:41.339237
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-05-01 23:13:41.342942
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-05-01 23:13:41.347433
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-05-01 23:13:41.350288
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-05-01 23:13:41.353361
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-05-01 23:13:41.381648
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-05-01 23:13:41.384612
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-05-01 23:13:41.387713
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-05-01 23:13:41.391438
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-05-01 23:13:41.399125
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-05-01 23:13:41.402119
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-05-01 23:13:41.410634
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-05-01 23:13:41.437142
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-05-01 23:13:41.461411
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-05-01 23:13:41.464479
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-05-01 23:13:41.46726
\.


--
-- TOC entry 4158 (class 0 OID 17518)
-- Dependencies: 286
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- TOC entry 4159 (class 0 OID 17528)
-- Dependencies: 287
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- TOC entry 4160 (class 0 OID 17535)
-- Dependencies: 288
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- TOC entry 4161 (class 0 OID 17543)
-- Dependencies: 289
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250502125308	{"\\\\n\\\\n-- Enable UUID extension\\\\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","\\\\n\\\\n-- Clients table\\\\nCREATE TABLE IF NOT EXISTS clients (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  email text UNIQUE NOT NULL,\\\\n  phone text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE clients ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own data\\"\\\\n  ON clients\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\nCREATE POLICY \\"Clients can update own data\\"\\\\n  ON clients\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\n-- Calendars table\\\\nCREATE TABLE IF NOT EXISTS calendars (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  location_id text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE calendars ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read calendars\\"\\\\n  ON calendars\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify calendars\\"\\\\n  ON calendars\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Specialties table\\\\nCREATE TABLE IF NOT EXISTS specialties (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  duration integer NOT NULL,\\\\n  price decimal(10,2),\\\\n  description text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE specialties ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read specialties\\"\\\\n  ON specialties\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify specialties\\"\\\\n  ON specialties\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Professionals table\\\\nCREATE TABLE IF NOT EXISTS professionals (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  email text,\\\\n  phone text,\\\\n  avatar text,\\\\n  bio text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE professionals ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read professionals\\"\\\\n  ON professionals\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify professionals\\"\\\\n  ON professionals\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Appointments table\\\\nCREATE TABLE IF NOT EXISTS appointments (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  start_time timestamptz NOT NULL,\\\\n  end_time timestamptz NOT NULL,\\\\n  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'canceled')),\\\\n  notes text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE appointments ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own appointments\\"\\\\n  ON appointments\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can create appointments\\"\\\\n  ON appointments\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (client_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Clients can update own appointments\\"\\\\n  ON appointments\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can delete own appointments\\"\\\\n  ON appointments\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\n-- Create indexes for better query performance\\\\nCREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id)","\\\\nCREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id)","\\\\nCREATE INDEX IF NOT EXISTS idx_appointments_calendar_id ON appointments(calendar_id)","\\\\nCREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time)","\\\\nCREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)","\\\\n\\\\nCREATE INDEX IF NOT EXISTS idx_professionals_specialty_id ON professionals(specialty_id)","\\\\nCREATE INDEX IF NOT EXISTS idx_professionals_calendar_id ON professionals(calendar_id)","\\\\n\\\\nCREATE INDEX IF NOT EXISTS idx_specialties_calendar_id ON specialties(calendar_id)",""}	tight_sky
20250502131438	{"\\\\n\\\\n-- Enable UUID extension\\\\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","\\\\n\\\\n-- Drop existing tables if they exist\\\\nDROP TABLE IF EXISTS appointments","\\\\nDROP TABLE IF EXISTS professionals","\\\\nDROP TABLE IF EXISTS specialties","\\\\nDROP TABLE IF EXISTS calendars","\\\\nDROP TABLE IF EXISTS clients","\\\\n\\\\n-- Clients table\\\\nCREATE TABLE clients (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  email text UNIQUE NOT NULL,\\\\n  phone text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE clients ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own data\\"\\\\n  ON clients\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\nCREATE POLICY \\"Clients can update own data\\"\\\\n  ON clients\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\n-- Calendars table\\\\nCREATE TABLE calendars (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  location_id text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE calendars ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read calendars\\"\\\\n  ON calendars\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify calendars\\"\\\\n  ON calendars\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Specialties table\\\\nCREATE TABLE specialties (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  duration integer NOT NULL,\\\\n  price decimal(10,2),\\\\n  description text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE specialties ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read specialties\\"\\\\n  ON specialties\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify specialties\\"\\\\n  ON specialties\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Professionals table\\\\nCREATE TABLE professionals (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  email text,\\\\n  phone text,\\\\n  avatar text,\\\\n  bio text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE professionals ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read professionals\\"\\\\n  ON professionals\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify professionals\\"\\\\n  ON professionals\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Appointments table\\\\nCREATE TABLE appointments (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  start_time timestamptz NOT NULL,\\\\n  end_time timestamptz NOT NULL,\\\\n  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'canceled')),\\\\n  notes text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE appointments ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own appointments\\"\\\\n  ON appointments\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can create appointments\\"\\\\n  ON appointments\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (client_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Clients can update own appointments\\"\\\\n  ON appointments\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can delete own appointments\\"\\\\n  ON appointments\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\n-- Create indexes for better query performance\\\\nCREATE INDEX idx_appointments_client_id ON appointments(client_id)","\\\\nCREATE INDEX idx_appointments_professional_id ON appointments(professional_id)","\\\\nCREATE INDEX idx_appointments_calendar_id ON appointments(calendar_id)","\\\\nCREATE INDEX idx_appointments_start_time ON appointments(start_time)","\\\\nCREATE INDEX idx_appointments_status ON appointments(status)","\\\\n\\\\nCREATE INDEX idx_professionals_specialty_id ON professionals(specialty_id)","\\\\nCREATE INDEX idx_professionals_calendar_id ON professionals(calendar_id)","\\\\n\\\\nCREATE INDEX idx_specialties_calendar_id ON specialties(calendar_id)",""}	divine_darkness
20250502132856	{"\\\\n\\\\n-- Enable UUID extension\\\\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","\\\\n\\\\n-- Drop existing tables if they exist\\\\nDROP TABLE IF EXISTS appointments","\\\\nDROP TABLE IF EXISTS professionals","\\\\nDROP TABLE IF EXISTS specialties","\\\\nDROP TABLE IF EXISTS calendars","\\\\nDROP TABLE IF EXISTS clients","\\\\n\\\\n-- Clients table\\\\nCREATE TABLE clients (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  email text UNIQUE NOT NULL,\\\\n  phone text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE clients ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own data\\"\\\\n  ON clients\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\nCREATE POLICY \\"Clients can update own data\\"\\\\n  ON clients\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\n-- Calendars table\\\\nCREATE TABLE calendars (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  location_id text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE calendars ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read calendars\\"\\\\n  ON calendars\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create calendars\\"\\\\n  ON calendars\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update calendars\\"\\\\n  ON calendars\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete calendars\\"\\\\n  ON calendars\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Specialties table\\\\nCREATE TABLE specialties (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  duration integer NOT NULL,\\\\n  price decimal(10,2),\\\\n  description text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE specialties ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read specialties\\"\\\\n  ON specialties\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify specialties\\"\\\\n  ON specialties\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Professionals table\\\\nCREATE TABLE professionals (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  email text,\\\\n  phone text,\\\\n  avatar text,\\\\n  bio text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE professionals ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read professionals\\"\\\\n  ON professionals\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify professionals\\"\\\\n  ON professionals\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Appointments table\\\\nCREATE TABLE appointments (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  start_time timestamptz NOT NULL,\\\\n  end_time timestamptz NOT NULL,\\\\n  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'canceled')),\\\\n  notes text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE appointments ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own appointments\\"\\\\n  ON appointments\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can create appointments\\"\\\\n  ON appointments\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (client_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Clients can update own appointments\\"\\\\n  ON appointments\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can delete own appointments\\"\\\\n  ON appointments\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\n-- Create indexes for better query performance\\\\nCREATE INDEX idx_appointments_client_id ON appointments(client_id)","\\\\nCREATE INDEX idx_appointments_professional_id ON appointments(professional_id)","\\\\nCREATE INDEX idx_appointments_calendar_id ON appointments(calendar_id)","\\\\nCREATE INDEX idx_appointments_start_time ON appointments(start_time)","\\\\nCREATE INDEX idx_appointments_status ON appointments(status)","\\\\n\\\\nCREATE INDEX idx_professionals_specialty_id ON professionals(specialty_id)","\\\\nCREATE INDEX idx_professionals_calendar_id ON professionals(calendar_id)","\\\\n\\\\nCREATE INDEX idx_specialties_calendar_id ON specialties(calendar_id)",""}	bitter_sound
20250502133009	{"\\\\n\\\\n-- Enable UUID extension\\\\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","\\\\n\\\\n-- Drop existing tables if they exist\\\\nDROP TABLE IF EXISTS appointments","\\\\nDROP TABLE IF EXISTS professionals","\\\\nDROP TABLE IF EXISTS specialties","\\\\nDROP TABLE IF EXISTS calendars","\\\\nDROP TABLE IF EXISTS clients","\\\\n\\\\n-- Clients table\\\\nCREATE TABLE clients (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  email text UNIQUE NOT NULL,\\\\n  phone text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE clients ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own data\\"\\\\n  ON clients\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\nCREATE POLICY \\"Clients can update own data\\"\\\\n  ON clients\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (auth.uid() = id)","\\\\n\\\\n-- Calendars table\\\\nCREATE TABLE calendars (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  location_id text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE calendars ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read calendars\\"\\\\n  ON calendars\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create calendars\\"\\\\n  ON calendars\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update calendars\\"\\\\n  ON calendars\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete calendars\\"\\\\n  ON calendars\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Specialties table\\\\nCREATE TABLE specialties (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  duration integer NOT NULL,\\\\n  price decimal(10,2),\\\\n  description text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE specialties ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read specialties\\"\\\\n  ON specialties\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify specialties\\"\\\\n  ON specialties\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Professionals table\\\\nCREATE TABLE professionals (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  email text,\\\\n  phone text,\\\\n  avatar text,\\\\n  bio text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE professionals ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read professionals\\"\\\\n  ON professionals\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Only admins can modify professionals\\"\\\\n  ON professionals\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Appointments table\\\\nCREATE TABLE appointments (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  start_time timestamptz NOT NULL,\\\\n  end_time timestamptz NOT NULL,\\\\n  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'canceled')),\\\\n  notes text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE appointments ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Clients can read own appointments\\"\\\\n  ON appointments\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can create appointments\\"\\\\n  ON appointments\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (client_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Clients can update own appointments\\"\\\\n  ON appointments\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Clients can delete own appointments\\"\\\\n  ON appointments\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (\\\\n    client_id = auth.uid() OR\\\\n    professional_id = auth.uid() OR\\\\n    auth.jwt() ->> 'role' = 'admin'\\\\n  )","\\\\n\\\\n-- Create indexes for better query performance\\\\nCREATE INDEX idx_appointments_client_id ON appointments(client_id)","\\\\nCREATE INDEX idx_appointments_professional_id ON appointments(professional_id)","\\\\nCREATE INDEX idx_appointments_calendar_id ON appointments(calendar_id)","\\\\nCREATE INDEX idx_appointments_start_time ON appointments(start_time)","\\\\nCREATE INDEX idx_appointments_status ON appointments(status)","\\\\n\\\\nCREATE INDEX idx_professionals_specialty_id ON professionals(specialty_id)","\\\\nCREATE INDEX idx_professionals_calendar_id ON professionals(calendar_id)","\\\\n\\\\nCREATE INDEX idx_specialties_calendar_id ON specialties(calendar_id)",""}	humble_bush
20250502133116	{"-- Enable UUID extension\\\\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","\\\\n\\\\n-- Drop existing tables if they exist\\\\nDROP TABLE IF EXISTS appointments","\\\\nDROP TABLE IF EXISTS professionals","\\\\nDROP TABLE IF EXISTS specialties","\\\\nDROP TABLE IF EXISTS calendars","\\\\nDROP TABLE IF EXISTS clients","\\\\n\\\\n-- Clients table\\\\nCREATE TABLE clients (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  email text UNIQUE NOT NULL,\\\\n  phone text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE clients ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read clients\\"\\\\n  ON clients\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create clients\\"\\\\n  ON clients\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Users can update own data\\"\\\\n  ON clients\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin')","\\\\n\\\\n-- Calendars table\\\\nCREATE TABLE calendars (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  location_id text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE calendars ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read calendars\\"\\\\n  ON calendars\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create calendars\\"\\\\n  ON calendars\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update calendars\\"\\\\n  ON calendars\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete calendars\\"\\\\n  ON calendars\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Specialties table\\\\nCREATE TABLE specialties (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  duration integer NOT NULL,\\\\n  price decimal(10,2),\\\\n  description text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE specialties ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read specialties\\"\\\\n  ON specialties\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create specialties\\"\\\\n  ON specialties\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update specialties\\"\\\\n  ON specialties\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete specialties\\"\\\\n  ON specialties\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Professionals table\\\\nCREATE TABLE professionals (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE SET NULL,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  email text,\\\\n  phone text,\\\\n  avatar text,\\\\n  bio text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE professionals ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read professionals\\"\\\\n  ON professionals\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create professionals\\"\\\\n  ON professionals\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update professionals\\"\\\\n  ON professionals\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete professionals\\"\\\\n  ON professionals\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Appointments table\\\\nCREATE TABLE appointments (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,\\\\n  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,\\\\n  start_time timestamptz NOT NULL,\\\\n  end_time timestamptz NOT NULL,\\\\n  status text NOT NULL CHECK (status IN ('confirmed', 'pending', 'completed', 'canceled')),\\\\n  notes text,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE appointments ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read appointments\\"\\\\n  ON appointments\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create appointments\\"\\\\n  ON appointments\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update appointments\\"\\\\n  ON appointments\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete appointments\\"\\\\n  ON appointments\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Create indexes for better query performance\\\\nCREATE INDEX idx_appointments_client_id ON appointments(client_id)","\\\\nCREATE INDEX idx_appointments_professional_id ON appointments(professional_id)","\\\\nCREATE INDEX idx_appointments_calendar_id ON appointments(calendar_id)","\\\\nCREATE INDEX idx_appointments_start_time ON appointments(start_time)","\\\\nCREATE INDEX idx_appointments_status ON appointments(status)","\\\\n\\\\nCREATE INDEX idx_professionals_specialty_id ON professionals(specialty_id)","\\\\nCREATE INDEX idx_professionals_calendar_id ON professionals(calendar_id)","\\\\n\\\\nCREATE INDEX idx_specialties_calendar_id ON specialties(calendar_id)",""}	sunny_jungle
20250506001436	{"\\\\n\\\\n-- Add ElevenLabs API key to user_settings if it doesn't exist\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'user_settings' \\\\n    AND column_name = 'elevenlabs_key'\\\\n  ) THEN\\\\n    ALTER TABLE user_settings\\\\n    ADD COLUMN elevenlabs_key text","\\\\n  END IF","\\\\nEND $$","\\\\n\\\\n-- Add working_hours to ai_configurations if it doesn't exist\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'ai_configurations' \\\\n    AND column_name = 'working_hours'\\\\n  ) THEN\\\\n    ALTER TABLE ai_configurations\\\\n    ADD COLUMN working_hours jsonb DEFAULT '{\\"is24h\\": false, \\"schedule\\": {}}'::jsonb","\\\\n  END IF","\\\\nEND $$",""}	orange_tooth
20250502133238	{"\\\\n\\\\n-- Drop existing policies\\\\nDROP POLICY IF EXISTS \\"Anyone can read professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Only admins can modify professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can update professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can delete professionals\\" ON professionals","\\\\n\\\\n-- Create new policies\\\\nCREATE POLICY \\"Anyone can read professionals\\"\\\\n  ON professionals\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create professionals\\"\\\\n  ON professionals\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update professionals\\"\\\\n  ON professionals\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete professionals\\"\\\\n  ON professionals\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Ensure indexes exist\\\\nCREATE INDEX IF NOT EXISTS idx_professionals_specialty_id ON professionals(specialty_id)","\\\\nCREATE INDEX IF NOT EXISTS idx_professionals_calendar_id ON professionals(calendar_id)",""}	small_dawn
20250502133442	{"\\\\n\\\\n-- Drop existing policies\\\\nDROP POLICY IF EXISTS \\"Anyone can read specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Only admins can modify specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can update specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can delete specialties\\" ON specialties","\\\\n\\\\n-- Create new policies\\\\nCREATE POLICY \\"Anyone can read specialties\\"\\\\n  ON specialties\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create specialties\\"\\\\n  ON specialties\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can update specialties\\"\\\\n  ON specialties\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\nCREATE POLICY \\"Authenticated users can delete specialties\\"\\\\n  ON specialties\\\\n  FOR DELETE\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Ensure indexes exist\\\\nCREATE INDEX IF NOT EXISTS idx_specialties_calendar_id ON specialties(calendar_id)","\\\\nCREATE INDEX IF NOT EXISTS idx_specialties_name ON specialties(name)",""}	icy_voice
20250502133709	{"\\\\n\\\\n-- Drop existing policies\\\\nDROP POLICY IF EXISTS \\"Anyone can read calendars\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create calendars\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can delete calendars\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can update calendars\\" ON calendars","\\\\n\\\\n-- Create new policies\\\\nCREATE POLICY \\"Enable read access for authenticated users\\"\\\\nON calendars FOR SELECT\\\\nTO authenticated\\\\nUSING (true)","\\\\n\\\\nCREATE POLICY \\"Enable insert access for authenticated users\\"\\\\nON calendars FOR INSERT\\\\nTO authenticated\\\\nWITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Enable update access for authenticated users\\"\\\\nON calendars FOR UPDATE\\\\nTO authenticated\\\\nUSING (auth.uid() IN (\\\\n  SELECT p.id \\\\n  FROM professionals p \\\\n  WHERE p.calendar_id = calendars.id\\\\n))\\\\nWITH CHECK (auth.uid() IN (\\\\n  SELECT p.id \\\\n  FROM professionals p \\\\n  WHERE p.calendar_id = calendars.id\\\\n))","\\\\n\\\\nCREATE POLICY \\"Enable delete access for authenticated users\\"\\\\nON calendars FOR DELETE\\\\nTO authenticated\\\\nUSING (auth.uid() IN (\\\\n  SELECT p.id \\\\n  FROM professionals p \\\\n  WHERE p.calendar_id = calendars.id\\\\n))",""}	silver_sky
20250502203338	{"\\\\n\\\\n-- Create subscription_plans table\\\\nCREATE TABLE subscription_plans (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  name text NOT NULL,\\\\n  description text,\\\\n  price decimal(10,2),\\\\n  features jsonb NOT NULL,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Anyone can read subscription plans\\"\\\\n  ON subscription_plans FOR SELECT\\\\n  TO authenticated\\\\n  USING (true)","\\\\n\\\\n-- Create user_subscriptions table\\\\nCREATE TABLE user_subscriptions (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  user_id uuid REFERENCES clients(id) ON DELETE CASCADE,\\\\n  plan_id uuid REFERENCES subscription_plans(id),\\\\n  status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),\\\\n  current_period_start timestamptz NOT NULL,\\\\n  current_period_end timestamptz NOT NULL,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Users can read own subscriptions\\"\\\\n  ON user_subscriptions FOR SELECT\\\\n  TO authenticated\\\\n  USING (auth.uid() = user_id)","\\\\n\\\\n-- Create user_settings table\\\\nCREATE TABLE user_settings (\\\\n  user_id uuid PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,\\\\n  timezone text DEFAULT 'America/Sao_Paulo',\\\\n  language text DEFAULT 'pt',\\\\n  notification_preferences jsonb DEFAULT '{\\"email\\": true, \\"sms\\": false}'::jsonb,\\\\n  created_at timestamptz DEFAULT now(),\\\\n  updated_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\nALTER TABLE user_settings ENABLE ROW LEVEL SECURITY","\\\\n\\\\nCREATE POLICY \\"Users can read own settings\\"\\\\n  ON user_settings FOR SELECT\\\\n  TO authenticated\\\\n  USING (auth.uid() = user_id)","\\\\n\\\\nCREATE POLICY \\"Users can update own settings\\"\\\\n  ON user_settings FOR UPDATE\\\\n  TO authenticated\\\\n  USING (auth.uid() = user_id)","\\\\n\\\\n-- Add owner_id to calendars\\\\nALTER TABLE calendars \\\\nADD COLUMN owner_id uuid REFERENCES clients(id) ON DELETE CASCADE","\\\\n\\\\n-- Update calendars RLS policies\\\\nDROP POLICY IF EXISTS \\"Anyone can read calendars\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Enable read access for authenticated users\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Enable insert access for authenticated users\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Enable update access for authenticated users\\" ON calendars","\\\\nDROP POLICY IF EXISTS \\"Enable delete access for authenticated users\\" ON calendars","\\\\n\\\\nCREATE POLICY \\"Users can read own calendars\\"\\\\n  ON calendars FOR SELECT\\\\n  TO authenticated\\\\n  USING (owner_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can create calendars\\"\\\\n  ON calendars FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (\\\\n    owner_id = auth.uid() AND\\\\n    EXISTS (\\\\n      SELECT 1 FROM user_subscriptions us\\\\n      WHERE us.user_id = auth.uid()\\\\n      AND us.status = 'active'\\\\n    )\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Users can update own calendars\\"\\\\n  ON calendars FOR UPDATE\\\\n  TO authenticated\\\\n  USING (owner_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can delete own calendars\\"\\\\n  ON calendars FOR DELETE\\\\n  TO authenticated\\\\n  USING (owner_id = auth.uid())","\\\\n\\\\n-- Insert default subscription plans\\\\nINSERT INTO subscription_plans (name, description, price, features) VALUES\\\\n  (\\\\n    'Free',\\\\n    'Perfect for personal use',\\\\n    0,\\\\n    '{\\\\n      \\"calendars\\": 1,\\\\n      \\"professionals\\": 1,\\\\n      \\"appointments_per_month\\": 50,\\\\n      \\"analytics\\": false,\\\\n      \\"custom_branding\\": false,\\\\n      \\"email_notifications\\": true,\\\\n      \\"sms_notifications\\": false\\\\n    }'\\\\n  ),\\\\n  (\\\\n    'Business',\\\\n    'For growing businesses',\\\\n    29.99,\\\\n    '{\\\\n      \\"calendars\\": -1,\\\\n      \\"professionals\\": -1,\\\\n      \\"appointments_per_month\\": -1,\\\\n      \\"analytics\\": true,\\\\n      \\"custom_branding\\": true,\\\\n      \\"email_notifications\\": true,\\\\n      \\"sms_notifications\\": true\\\\n    }'\\\\n  )","\\\\n\\\\n-- Function to create default user settings\\\\nCREATE OR REPLACE FUNCTION create_default_user_settings()\\\\nRETURNS TRIGGER AS $$\\\\nBEGIN\\\\n  INSERT INTO user_settings (user_id)\\\\n  VALUES (NEW.id)","\\\\n  RETURN NEW","\\\\nEND","\\\\n$$ LANGUAGE plpgsql","\\\\n\\\\n-- Trigger to create default user settings on client creation\\\\nCREATE TRIGGER create_user_settings_trigger\\\\nAFTER INSERT ON clients\\\\nFOR EACH ROW\\\\nEXECUTE FUNCTION create_default_user_settings()","\\\\n\\\\n-- Function to create free subscription for new users\\\\nCREATE OR REPLACE FUNCTION create_free_subscription()\\\\nRETURNS TRIGGER AS $$\\\\nBEGIN\\\\n  INSERT INTO user_subscriptions (\\\\n    user_id,\\\\n    plan_id,\\\\n    status,\\\\n    current_period_start,\\\\n    current_period_end\\\\n  )\\\\n  SELECT\\\\n    NEW.id,\\\\n    id,\\\\n    'active',\\\\n    now(),\\\\n    now() + interval '1 month'\\\\n  FROM subscription_plans\\\\n  WHERE name = 'Free'\\\\n  LIMIT 1","\\\\n  RETURN NEW","\\\\nEND","\\\\n$$ LANGUAGE plpgsql","\\\\n\\\\n-- Trigger to create free subscription on client creation\\\\nCREATE TRIGGER create_free_subscription_trigger\\\\nAFTER INSERT ON clients\\\\nFOR EACH ROW\\\\nEXECUTE FUNCTION create_free_subscription()",""}	muddy_river
20250503002457	{"\\\\n\\\\n-- Add calendar_id column\\\\nALTER TABLE clients\\\\nADD COLUMN calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE","\\\\n\\\\n-- Create index for better performance\\\\nCREATE INDEX idx_clients_calendar_id ON clients(calendar_id)","\\\\n\\\\n-- Update RLS policies to include calendar_id checks\\\\nDROP POLICY IF EXISTS \\"Anyone can read clients\\" ON clients","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create clients\\" ON clients","\\\\nDROP POLICY IF EXISTS \\"Users can update own data\\" ON clients","\\\\n\\\\nCREATE POLICY \\"Anyone can read clients in same calendar\\"\\\\n  ON clients\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    calendar_id IN (\\\\n      SELECT c.id FROM calendars c\\\\n      WHERE c.id = clients.calendar_id\\\\n    )\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Authenticated users can create clients\\"\\\\n  ON clients\\\\n  FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (true)","\\\\n\\\\nCREATE POLICY \\"Users can update own data\\"\\\\n  ON clients\\\\n  FOR UPDATE\\\\n  TO authenticated\\\\n  USING (\\\\n    auth.uid() = id OR \\\\n    calendar_id IN (\\\\n      SELECT c.id FROM calendars c\\\\n      WHERE c.id = clients.calendar_id\\\\n    )\\\\n  )",""}	billowing_breeze
20250503150135	{"\\\\n\\\\n-- Add user_id to appointments if not exists\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'appointments' \\\\n    AND column_name = 'user_id'\\\\n  ) THEN\\\\n    ALTER TABLE appointments\\\\n    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE","\\\\n  END IF","\\\\nEND $$","\\\\n\\\\nCREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id)","\\\\n\\\\n-- Add user_id to specialties if not exists\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'specialties' \\\\n    AND column_name = 'user_id'\\\\n  ) THEN\\\\n    ALTER TABLE specialties\\\\n    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE","\\\\n  END IF","\\\\nEND $$","\\\\n\\\\nCREATE INDEX IF NOT EXISTS idx_specialties_user_id ON specialties(user_id)","\\\\n\\\\n-- Add user_id to professionals if not exists\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'professionals' \\\\n    AND column_name = 'user_id'\\\\n  ) THEN\\\\n    ALTER TABLE professionals\\\\n    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE","\\\\n  END IF","\\\\nEND $$","\\\\n\\\\nCREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id)","\\\\n\\\\n-- Update RLS policies for appointments\\\\nDROP POLICY IF EXISTS \\"Anyone can read appointments\\" ON appointments","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create appointments\\" ON appointments","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can update appointments\\" ON appointments","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can delete appointments\\" ON appointments","\\\\n\\\\nCREATE POLICY \\"Users can read own appointments\\"\\\\n  ON appointments FOR SELECT\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can create appointments\\"\\\\n  ON appointments FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can update own appointments\\"\\\\n  ON appointments FOR UPDATE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can delete own appointments\\"\\\\n  ON appointments FOR DELETE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\n-- Update RLS policies for specialties\\\\nDROP POLICY IF EXISTS \\"Anyone can read specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can update specialties\\" ON specialties","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can delete specialties\\" ON specialties","\\\\n\\\\nCREATE POLICY \\"Users can read own specialties\\"\\\\n  ON specialties FOR SELECT\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can create specialties\\"\\\\n  ON specialties FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can update own specialties\\"\\\\n  ON specialties FOR UPDATE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can delete own specialties\\"\\\\n  ON specialties FOR DELETE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\n-- Update RLS policies for professionals\\\\nDROP POLICY IF EXISTS \\"Anyone can read professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can update professionals\\" ON professionals","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can delete professionals\\" ON professionals","\\\\n\\\\nCREATE POLICY \\"Users can read own professionals\\"\\\\n  ON professionals FOR SELECT\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can create professionals\\"\\\\n  ON professionals FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can update own professionals\\"\\\\n  ON professionals FOR UPDATE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can delete own professionals\\"\\\\n  ON professionals FOR DELETE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())",""}	precious_sunset
20250504000705	{"\\\\n\\\\n-- Create working_hours table\\\\nCREATE TABLE working_hours (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),\\\\n  start_time time,\\\\n  end_time time,\\\\n  is_working_day boolean DEFAULT true,\\\\n  created_at timestamptz DEFAULT now(),\\\\n  CONSTRAINT valid_times CHECK (\\\\n    (NOT is_working_day) OR \\\\n    (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)\\\\n  ),\\\\n  UNIQUE (professional_id, day_of_week)\\\\n)","\\\\n\\\\n-- Enable RLS\\\\nALTER TABLE working_hours ENABLE ROW LEVEL SECURITY","\\\\n\\\\n-- Create policies\\\\nCREATE POLICY \\"Users can read working hours\\"\\\\n  ON working_hours FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    EXISTS (\\\\n      SELECT 1 FROM professionals p\\\\n      WHERE p.id = working_hours.professional_id\\\\n      AND p.user_id = auth.uid()\\\\n    )\\\\n  )","\\\\n\\\\nCREATE POLICY \\"Users can manage working hours\\"\\\\n  ON working_hours FOR ALL\\\\n  TO authenticated\\\\n  USING (\\\\n    EXISTS (\\\\n      SELECT 1 FROM professionals p\\\\n      WHERE p.id = working_hours.professional_id\\\\n      AND p.user_id = auth.uid()\\\\n    )\\\\n  )","\\\\n\\\\n-- Create function to initialize default working hours\\\\nCREATE OR REPLACE FUNCTION initialize_working_hours()\\\\nRETURNS TRIGGER AS $$\\\\nBEGIN\\\\n  -- Insert default working hours (Mon-Fri, 9 AM to 5 PM)\\\\n  INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_working_day)\\\\n  VALUES\\\\n    (NEW.id, 0, NULL, NULL, false),  -- Sunday (not working)\\\\n    (NEW.id, 1, '09:00', '17:00', true),  -- Monday\\\\n    (NEW.id, 2, '09:00', '17:00', true),  -- Tuesday\\\\n    (NEW.id, 3, '09:00', '17:00', true),  -- Wednesday\\\\n    (NEW.id, 4, '09:00', '17:00', true),  -- Thursday\\\\n    (NEW.id, 5, '09:00', '17:00', true),  -- Friday\\\\n    (NEW.id, 6, NULL, NULL, false)","  -- Saturday (not working)\\\\n  \\\\n  RETURN NEW","\\\\nEND","\\\\n$$ LANGUAGE plpgsql","\\\\n\\\\n-- Create trigger to initialize working hours for new professionals\\\\nCREATE TRIGGER initialize_working_hours_trigger\\\\nAFTER INSERT ON professionals\\\\nFOR EACH ROW\\\\nEXECUTE FUNCTION initialize_working_hours()",""}	damp_bonus
20250504011231	{"\\\\n\\\\n-- Create the working_hours table\\\\nCREATE TABLE IF NOT EXISTS public.working_hours (\\\\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,\\\\n    day_of_week INTEGER NOT NULL,\\\\n    start_time TIME,\\\\n    end_time TIME,\\\\n    is_working_day BOOLEAN NOT NULL DEFAULT false,\\\\n    created_at TIMESTAMPTZ DEFAULT now(),\\\\n    CONSTRAINT valid_day_of_week CHECK (day_of_week >= 0 AND day_of_week <= 6),\\\\n    CONSTRAINT valid_time_range CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)\\\\n)","\\\\n\\\\n-- Create index on professional_id for faster lookups\\\\nCREATE INDEX IF NOT EXISTS idx_working_hours_professional_id ON public.working_hours(professional_id)","\\\\n\\\\n-- Create index on day_of_week for faster filtering\\\\nCREATE INDEX IF NOT EXISTS idx_working_hours_day_of_week ON public.working_hours(day_of_week)","\\\\n\\\\n-- Enable Row Level Security\\\\nALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY","\\\\n\\\\n-- Policy for selecting working hours\\\\n-- Users can read working hours for professionals in their calendars\\\\nCREATE POLICY \\"Users can read working hours for their calendars\\" ON public.working_hours\\\\n    FOR SELECT TO authenticated\\\\n    USING (\\\\n        EXISTS (\\\\n            SELECT 1 FROM professionals p\\\\n            JOIN calendars c ON c.id = p.calendar_id\\\\n            WHERE p.id = working_hours.professional_id\\\\n            AND c.owner_id = auth.uid()\\\\n        )\\\\n    )","\\\\n\\\\n-- Policy for inserting working hours\\\\nCREATE POLICY \\"Users can create working hours for their professionals\\" ON public.working_hours\\\\n    FOR INSERT TO authenticated\\\\n    WITH CHECK (\\\\n        EXISTS (\\\\n            SELECT 1 FROM professionals p\\\\n            JOIN calendars c ON c.id = p.calendar_id\\\\n            WHERE p.id = working_hours.professional_id\\\\n            AND c.owner_id = auth.uid()\\\\n        )\\\\n    )","\\\\n\\\\n-- Policy for updating working hours\\\\nCREATE POLICY \\"Users can update working hours for their professionals\\" ON public.working_hours\\\\n    FOR UPDATE TO authenticated\\\\n    USING (\\\\n        EXISTS (\\\\n            SELECT 1 FROM professionals p\\\\n            JOIN calendars c ON c.id = p.calendar_id\\\\n            WHERE p.id = working_hours.professional_id\\\\n            AND c.owner_id = auth.uid()\\\\n        )\\\\n    )\\\\n    WITH CHECK (\\\\n        EXISTS (\\\\n            SELECT 1 FROM professionals p\\\\n            JOIN calendars c ON c.id = p.calendar_id\\\\n            WHERE p.id = working_hours.professional_id\\\\n            AND c.owner_id = auth.uid()\\\\n        )\\\\n    )","\\\\n\\\\n-- Policy for deleting working hours\\\\nCREATE POLICY \\"Users can delete working hours for their professionals\\" ON public.working_hours\\\\n    FOR DELETE TO authenticated\\\\n    USING (\\\\n        EXISTS (\\\\n            SELECT 1 FROM professionals p\\\\n            JOIN calendars c ON c.id = p.calendar_id\\\\n            WHERE p.id = working_hours.professional_id\\\\n            AND c.owner_id = auth.uid()\\\\n        )\\\\n    )",""}	humble_glitter
20250504011716	{"\\\\n\\\\n-- Create working_hours table\\\\nCREATE TABLE IF NOT EXISTS public.working_hours (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,\\\\n  day_of_week integer NOT NULL,\\\\n  start_time time without time zone,\\\\n  end_time time without time zone,\\\\n  is_working_day boolean DEFAULT true,\\\\n  created_at timestamptz DEFAULT now(),\\\\n  \\\\n  -- Ensure day_of_week is between 0 and 6 (Sunday to Saturday)\\\\n  CONSTRAINT working_hours_day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6),\\\\n  \\\\n  -- Ensure start_time and end_time are valid when is_working_day is true\\\\n  CONSTRAINT valid_times CHECK (\\\\n    NOT is_working_day OR (\\\\n      start_time IS NOT NULL AND \\\\n      end_time IS NOT NULL AND \\\\n      start_time < end_time\\\\n    )\\\\n  ),\\\\n  \\\\n  -- Ensure unique professional + day combination\\\\n  UNIQUE (professional_id, day_of_week)\\\\n)","\\\\n\\\\n-- Enable Row Level Security\\\\nALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY","\\\\n\\\\n-- Drop existing policies if they exist\\\\nDROP POLICY IF EXISTS \\"Users can manage working hours\\" ON public.working_hours","\\\\nDROP POLICY IF EXISTS \\"Users can read working hours\\" ON public.working_hours","\\\\n\\\\n-- Create policy for users to manage working hours for their professionals\\\\nCREATE POLICY \\"Users can manage working hours\\"\\\\n  ON public.working_hours\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (\\\\n    EXISTS (\\\\n      SELECT 1 FROM professionals p\\\\n      WHERE p.id = working_hours.professional_id\\\\n      AND p.user_id = auth.uid()\\\\n    )\\\\n  )","\\\\n\\\\n-- Create policy for users to read working hours\\\\nCREATE POLICY \\"Users can read working hours\\"\\\\n  ON public.working_hours\\\\n  FOR SELECT\\\\n  TO authenticated\\\\n  USING (\\\\n    EXISTS (\\\\n      SELECT 1 FROM professionals p\\\\n      WHERE p.id = working_hours.professional_id\\\\n      AND p.user_id = auth.uid()\\\\n    )\\\\n  )","\\\\n\\\\n-- Drop existing function if it exists\\\\nDROP FUNCTION IF EXISTS initialize_working_hours() CASCADE","\\\\n\\\\n-- Create trigger function to initialize working hours for new professionals\\\\nCREATE OR REPLACE FUNCTION initialize_working_hours()\\\\nRETURNS TRIGGER AS $$\\\\nBEGIN\\\\n  -- Create default working hours for weekdays (Monday-Friday)\\\\n  FOR day IN 1..5 LOOP\\\\n    INSERT INTO working_hours (professional_id, day_of_week, start_time, end_time, is_working_day)\\\\n    VALUES (NEW.id, day, '09:00', '17:00', true)","\\\\n  END LOOP","\\\\n  \\\\n  -- Create weekend entries (Saturday-Sunday) as non-working days\\\\n  INSERT INTO working_hours (professional_id, day_of_week, is_working_day)\\\\n  VALUES \\\\n    (NEW.id, 0, false), -- Sunday\\\\n    (NEW.id, 6, false)"," -- Saturday\\\\n  \\\\n  RETURN NEW","\\\\nEND","\\\\n$$ LANGUAGE plpgsql","\\\\n\\\\n-- Create trigger to initialize working hours when a new professional is created\\\\nCREATE TRIGGER initialize_working_hours_trigger\\\\n  AFTER INSERT ON professionals\\\\n  FOR EACH ROW\\\\n  EXECUTE FUNCTION initialize_working_hours()","\\\\n\\\\n-- Add comment to the table\\\\nCOMMENT ON TABLE public.working_hours IS 'Stores working hours for professionals'",""}	ancient_shrine
20250505200651	{"\\\\n\\\\n-- Add user_id column if it doesn't exist\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'clients' \\\\n    AND column_name = 'user_id'\\\\n  ) THEN\\\\n    ALTER TABLE clients\\\\n    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE","\\\\n  END IF","\\\\nEND $$","\\\\n\\\\n-- Create index for user_id\\\\nCREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id)","\\\\n\\\\n-- Update RLS policies\\\\nDROP POLICY IF EXISTS \\"Anyone can read clients in same calendar\\" ON clients","\\\\nDROP POLICY IF EXISTS \\"Authenticated users can create clients\\" ON clients","\\\\nDROP POLICY IF EXISTS \\"Users can update own data\\" ON clients","\\\\n\\\\nCREATE POLICY \\"Users can read own clients\\"\\\\n  ON clients FOR SELECT\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can create clients\\"\\\\n  ON clients FOR INSERT\\\\n  TO authenticated\\\\n  WITH CHECK (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can update own clients\\"\\\\n  ON clients FOR UPDATE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())","\\\\n\\\\nCREATE POLICY \\"Users can delete own clients\\"\\\\n  ON clients FOR DELETE\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())",""}	curly_lantern
20250505201224	{"\\\\n\\\\n-- Create ai_configurations table\\\\nCREATE TABLE ai_configurations (\\\\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\\\\n  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,\\\\n  model text NOT NULL,\\\\n  temperature numeric NOT NULL,\\\\n  max_tokens integer NOT NULL,\\\\n  training_data text NOT NULL,\\\\n  prompt text NOT NULL,\\\\n  created_at timestamptz DEFAULT now()\\\\n)","\\\\n\\\\n-- Enable RLS\\\\nALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY","\\\\n\\\\n-- Create policies\\\\nCREATE POLICY \\"Users can manage own configurations\\"\\\\n  ON ai_configurations\\\\n  FOR ALL\\\\n  TO authenticated\\\\n  USING (user_id = auth.uid())\\\\n  WITH CHECK (user_id = auth.uid())","\\\\n\\\\n-- Create index for user_id\\\\nCREATE INDEX idx_ai_configurations_user_id ON ai_configurations(user_id)",""}	odd_field
20250505202205	{"-- Add provider column to ai_configurations\\\\nALTER TABLE ai_configurations \\\\nADD COLUMN provider text NOT NULL DEFAULT 'openai'","\\\\n\\\\n-- Update existing configurations\\\\nUPDATE ai_configurations \\\\nSET provider = 'openai' \\\\nWHERE provider IS NULL",""}	wispy_river
20250505202609	{"-- Add API key columns to user_settings\\\\nALTER TABLE user_settings\\\\nADD COLUMN openai_key text,\\\\nADD COLUMN deepseek_key text",""}	twilight_sky
20250506000947	{""}	graceful_limit
20250506000953	{""}	spring_lodge
20250506001045	{"\\\\n\\\\n-- Add ElevenLabs API key column to user_settings\\\\nDO $$ \\\\nBEGIN \\\\n  IF NOT EXISTS (\\\\n    SELECT 1 FROM information_schema.columns \\\\n    WHERE table_name = 'user_settings' \\\\n    AND column_name = 'elevenlabs_key'\\\\n  ) THEN\\\\n    ALTER TABLE user_settings\\\\n    ADD COLUMN elevenlabs_key text","\\\\n  END IF","\\\\nEND $$",""}	scarlet_darkness
\.


--
-- TOC entry 4163 (class 0 OID 19141)
-- Dependencies: 292
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- TOC entry 3582 (class 0 OID 17084)
-- Dependencies: 241
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4205 (class 0 OID 0)
-- Dependencies: 255
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 102, true);


--
-- TOC entry 4206 (class 0 OID 0)
-- Dependencies: 283
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 203, true);


--
-- TOC entry 3720 (class 2606 OID 17550)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 3704 (class 2606 OID 17552)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 3708 (class 2606 OID 17554)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 3713 (class 2606 OID 17556)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 3715 (class 2606 OID 17558)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 3718 (class 2606 OID 17560)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 3722 (class 2606 OID 17562)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 3725 (class 2606 OID 17564)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 3728 (class 2606 OID 17566)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 3730 (class 2606 OID 17568)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 3735 (class 2606 OID 17570)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3743 (class 2606 OID 17572)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 17574)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 3749 (class 2606 OID 17576)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 3751 (class 2606 OID 17578)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 17580)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 3759 (class 2606 OID 17582)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 3762 (class 2606 OID 17584)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3767 (class 2606 OID 17586)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 3770 (class 2606 OID 17588)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 3782 (class 2606 OID 17590)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 3784 (class 2606 OID 17592)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3786 (class 2606 OID 17594)
-- Name: ai_configurations ai_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_pkey PRIMARY KEY (id);


--
-- TOC entry 3789 (class 2606 OID 17596)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 3797 (class 2606 OID 17598)
-- Name: calendars calendars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendars
    ADD CONSTRAINT calendars_pkey PRIMARY KEY (id);


--
-- TOC entry 3799 (class 2606 OID 17600)
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- TOC entry 3801 (class 2606 OID 17602)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 3805 (class 2606 OID 17604)
-- Name: professional_specialties professional_specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_specialties
    ADD CONSTRAINT professional_specialties_pkey PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 17606)
-- Name: professionals professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professionals
    ADD CONSTRAINT professionals_pkey PRIMARY KEY (id);


--
-- TOC entry 3815 (class 2606 OID 17608)
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (id);


--
-- TOC entry 3817 (class 2606 OID 17610)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3819 (class 2606 OID 17612)
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3821 (class 2606 OID 17614)
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 3825 (class 2606 OID 17616)
-- Name: working_hours working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_pkey PRIMARY KEY (id);


--
-- TOC entry 3827 (class 2606 OID 17618)
-- Name: working_hours working_hours_professional_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_professional_id_day_of_week_key UNIQUE (professional_id, day_of_week);


--
-- TOC entry 3829 (class 2606 OID 17620)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3831 (class 2606 OID 17626)
-- Name: messages_2025_05_16 messages_2025_05_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_16
    ADD CONSTRAINT messages_2025_05_16_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3833 (class 2606 OID 17628)
-- Name: messages_2025_05_17 messages_2025_05_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_17
    ADD CONSTRAINT messages_2025_05_17_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3835 (class 2606 OID 17630)
-- Name: messages_2025_05_18 messages_2025_05_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_18
    ADD CONSTRAINT messages_2025_05_18_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3837 (class 2606 OID 17632)
-- Name: messages_2025_05_19 messages_2025_05_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_19
    ADD CONSTRAINT messages_2025_05_19_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3839 (class 2606 OID 17634)
-- Name: messages_2025_05_20 messages_2025_05_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_20
    ADD CONSTRAINT messages_2025_05_20_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3841 (class 2606 OID 17636)
-- Name: messages_2025_05_21 messages_2025_05_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_21
    ADD CONSTRAINT messages_2025_05_21_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3868 (class 2606 OID 19117)
-- Name: messages_2025_05_22 messages_2025_05_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_05_22
    ADD CONSTRAINT messages_2025_05_22_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 3846 (class 2606 OID 17638)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 3843 (class 2606 OID 17640)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 3850 (class 2606 OID 17642)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 3852 (class 2606 OID 17644)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 3854 (class 2606 OID 17646)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3859 (class 2606 OID 17648)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 3864 (class 2606 OID 17650)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 3862 (class 2606 OID 17652)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 3866 (class 2606 OID 17654)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 3870 (class 2606 OID 19147)
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- TOC entry 3705 (class 1259 OID 17655)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 3772 (class 1259 OID 17656)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3773 (class 1259 OID 17657)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3774 (class 1259 OID 17658)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3726 (class 1259 OID 17659)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 3706 (class 1259 OID 17660)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 3711 (class 1259 OID 17661)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 4207 (class 0 OID 0)
-- Dependencies: 3711
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 3716 (class 1259 OID 17662)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 3709 (class 1259 OID 17663)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 3710 (class 1259 OID 17664)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 3723 (class 1259 OID 17665)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 3731 (class 1259 OID 17666)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 3732 (class 1259 OID 17667)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 3736 (class 1259 OID 17668)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 3737 (class 1259 OID 17669)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 3738 (class 1259 OID 17670)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 3775 (class 1259 OID 17671)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3776 (class 1259 OID 17672)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3739 (class 1259 OID 17673)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 3740 (class 1259 OID 17674)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 3741 (class 1259 OID 17675)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 3744 (class 1259 OID 17676)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 3747 (class 1259 OID 17677)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 3752 (class 1259 OID 17678)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 3753 (class 1259 OID 17679)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 3754 (class 1259 OID 17680)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 3757 (class 1259 OID 17681)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 3760 (class 1259 OID 17682)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 3763 (class 1259 OID 17683)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 3765 (class 1259 OID 17684)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 3768 (class 1259 OID 17685)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 3771 (class 1259 OID 17686)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 3733 (class 1259 OID 17687)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 3764 (class 1259 OID 17688)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 3777 (class 1259 OID 17689)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 4208 (class 0 OID 0)
-- Dependencies: 3777
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 3778 (class 1259 OID 17690)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 3779 (class 1259 OID 17691)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 3780 (class 1259 OID 17692)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 3787 (class 1259 OID 17693)
-- Name: idx_ai_configurations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_configurations_user_id ON public.ai_configurations USING btree (user_id);


--
-- TOC entry 3790 (class 1259 OID 17694)
-- Name: idx_appointments_calendar_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_calendar_id ON public.appointments USING btree (calendar_id);


--
-- TOC entry 3791 (class 1259 OID 17695)
-- Name: idx_appointments_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_client_id ON public.appointments USING btree (client_id);


--
-- TOC entry 3792 (class 1259 OID 17696)
-- Name: idx_appointments_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_professional_id ON public.appointments USING btree (professional_id);


--
-- TOC entry 3793 (class 1259 OID 17697)
-- Name: idx_appointments_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_start_time ON public.appointments USING btree (start_time);


--
-- TOC entry 3794 (class 1259 OID 17698)
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- TOC entry 3795 (class 1259 OID 17699)
-- Name: idx_appointments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_user_id ON public.appointments USING btree (user_id);


--
-- TOC entry 3802 (class 1259 OID 17700)
-- Name: idx_clients_calendar_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_calendar_id ON public.clients USING btree (calendar_id);


--
-- TOC entry 3803 (class 1259 OID 17701)
-- Name: idx_clients_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id);


--
-- TOC entry 3806 (class 1259 OID 17702)
-- Name: idx_professionals_calendar_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professionals_calendar_id ON public.professionals USING btree (calendar_id);


--
-- TOC entry 3807 (class 1259 OID 17703)
-- Name: idx_professionals_specialty_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professionals_specialty_id ON public.professionals USING btree (specialty_id);


--
-- TOC entry 3808 (class 1259 OID 17704)
-- Name: idx_professionals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professionals_user_id ON public.professionals USING btree (user_id);


--
-- TOC entry 3811 (class 1259 OID 17705)
-- Name: idx_specialties_calendar_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialties_calendar_id ON public.specialties USING btree (calendar_id);


--
-- TOC entry 3812 (class 1259 OID 17706)
-- Name: idx_specialties_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialties_name ON public.specialties USING btree (name);


--
-- TOC entry 3813 (class 1259 OID 17707)
-- Name: idx_specialties_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialties_user_id ON public.specialties USING btree (user_id);


--
-- TOC entry 3822 (class 1259 OID 17708)
-- Name: idx_working_hours_day_of_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_working_hours_day_of_week ON public.working_hours USING btree (day_of_week);


--
-- TOC entry 3823 (class 1259 OID 17709)
-- Name: idx_working_hours_professional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_working_hours_professional_id ON public.working_hours USING btree (professional_id);


--
-- TOC entry 3844 (class 1259 OID 17710)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 3847 (class 1259 OID 17711)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 3848 (class 1259 OID 17712)
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 3855 (class 1259 OID 17713)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 3860 (class 1259 OID 17714)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 3856 (class 1259 OID 17715)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 3857 (class 1259 OID 17716)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 3871 (class 0 OID 0)
-- Name: messages_2025_05_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_16_pkey;


--
-- TOC entry 3872 (class 0 OID 0)
-- Name: messages_2025_05_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_17_pkey;


--
-- TOC entry 3873 (class 0 OID 0)
-- Name: messages_2025_05_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_18_pkey;


--
-- TOC entry 3874 (class 0 OID 0)
-- Name: messages_2025_05_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_19_pkey;


--
-- TOC entry 3875 (class 0 OID 0)
-- Name: messages_2025_05_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_20_pkey;


--
-- TOC entry 3876 (class 0 OID 0)
-- Name: messages_2025_05_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_21_pkey;


--
-- TOC entry 3877 (class 0 OID 0)
-- Name: messages_2025_05_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_05_22_pkey;


--
-- TOC entry 3910 (class 2620 OID 17717)
-- Name: clients create_free_subscription_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER create_free_subscription_trigger AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.create_free_subscription();


--
-- TOC entry 3911 (class 2620 OID 17718)
-- Name: clients create_user_settings_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER create_user_settings_trigger AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.create_default_user_settings();


--
-- TOC entry 3912 (class 2620 OID 17719)
-- Name: professionals initialize_working_hours_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER initialize_working_hours_trigger AFTER INSERT ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.initialize_working_hours();


--
-- TOC entry 3913 (class 2620 OID 17720)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 3914 (class 2620 OID 17721)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 3878 (class 2606 OID 17722)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3879 (class 2606 OID 17727)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3880 (class 2606 OID 17732)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 3881 (class 2606 OID 17737)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3882 (class 2606 OID 17742)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3883 (class 2606 OID 17747)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 3884 (class 2606 OID 17752)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 3885 (class 2606 OID 17757)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 3886 (class 2606 OID 17762)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 3887 (class 2606 OID 17767)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3888 (class 2606 OID 17772)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 3889 (class 2606 OID 17777)
-- Name: ai_configurations ai_configurations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3890 (class 2606 OID 17782)
-- Name: appointments appointments_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.calendars(id) ON DELETE CASCADE;


--
-- TOC entry 3891 (class 2606 OID 17787)
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 3892 (class 2606 OID 17792)
-- Name: appointments appointments_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professionals(id) ON DELETE SET NULL;


--
-- TOC entry 3893 (class 2606 OID 17797)
-- Name: appointments appointments_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id) ON DELETE CASCADE;


--
-- TOC entry 3894 (class 2606 OID 17802)
-- Name: clients clients_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.calendars(id) ON DELETE CASCADE;


--
-- TOC entry 3895 (class 2606 OID 17807)
-- Name: clients clients_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id);


--
-- TOC entry 3896 (class 2606 OID 17812)
-- Name: professional_specialties professional_specialties_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_specialties
    ADD CONSTRAINT professional_specialties_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professionals(id) ON DELETE CASCADE;


--
-- TOC entry 3897 (class 2606 OID 17817)
-- Name: professional_specialties professional_specialties_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_specialties
    ADD CONSTRAINT professional_specialties_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id) ON DELETE CASCADE;


--
-- TOC entry 3898 (class 2606 OID 17822)
-- Name: professionals professionals_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professionals
    ADD CONSTRAINT professionals_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.calendars(id) ON DELETE CASCADE;


--
-- TOC entry 3899 (class 2606 OID 17827)
-- Name: professionals professionals_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professionals
    ADD CONSTRAINT professionals_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(id) ON DELETE SET NULL;


--
-- TOC entry 3900 (class 2606 OID 17832)
-- Name: professionals professionals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professionals
    ADD CONSTRAINT professionals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 3901 (class 2606 OID 17837)
-- Name: specialties specialties_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.calendars(id) ON DELETE CASCADE;


--
-- TOC entry 3902 (class 2606 OID 17842)
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 3903 (class 2606 OID 17847)
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- TOC entry 3904 (class 2606 OID 17852)
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 3905 (class 2606 OID 17857)
-- Name: working_hours working_hours_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professionals(id) ON DELETE CASCADE;


--
-- TOC entry 3906 (class 2606 OID 17862)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 3907 (class 2606 OID 17867)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 3908 (class 2606 OID 17872)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 3909 (class 2606 OID 17877)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 4060 (class 0 OID 17230)
-- Dependencies: 246
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4061 (class 0 OID 17236)
-- Dependencies: 247
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4062 (class 0 OID 17241)
-- Dependencies: 248
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4063 (class 0 OID 17248)
-- Dependencies: 249
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4064 (class 0 OID 17253)
-- Dependencies: 250
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4065 (class 0 OID 17258)
-- Dependencies: 251
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4066 (class 0 OID 17263)
-- Dependencies: 252
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4067 (class 0 OID 17268)
-- Dependencies: 253
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4068 (class 0 OID 17276)
-- Dependencies: 254
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4069 (class 0 OID 17282)
-- Dependencies: 256
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4070 (class 0 OID 17290)
-- Dependencies: 257
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4071 (class 0 OID 17296)
-- Dependencies: 258
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4072 (class 0 OID 17299)
-- Dependencies: 259
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4073 (class 0 OID 17304)
-- Dependencies: 260
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4074 (class 0 OID 17310)
-- Dependencies: 261
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4075 (class 0 OID 17316)
-- Dependencies: 262
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4084 (class 3256 OID 17882)
-- Name: subscription_plans Anyone can read subscription plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4085 (class 3256 OID 17883)
-- Name: working_hours Profissionais gerenciam próprios horários; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profissionais gerenciam próprios horários" ON public.working_hours USING ((auth.uid() = ( SELECT professionals.user_id
   FROM public.professionals
  WHERE (professionals.id = working_hours.professional_id))));


--
-- TOC entry 4086 (class 3256 OID 17884)
-- Name: appointments Users can create appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4087 (class 3256 OID 17885)
-- Name: calendars Users can create calendars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create calendars" ON public.calendars FOR INSERT TO authenticated WITH CHECK (((owner_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.user_subscriptions us
  WHERE ((us.user_id = auth.uid()) AND (us.status = 'active'::text))))));


--
-- TOC entry 4088 (class 3256 OID 17886)
-- Name: clients Users can create clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create clients" ON public.clients FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4089 (class 3256 OID 17887)
-- Name: professionals Users can create professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create professionals" ON public.professionals FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4090 (class 3256 OID 17888)
-- Name: specialties Users can create specialties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create specialties" ON public.specialties FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4091 (class 3256 OID 17889)
-- Name: working_hours Users can create working hours for their professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create working hours for their professionals" ON public.working_hours FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.professionals p
     JOIN public.calendars c ON ((c.id = p.calendar_id)))
  WHERE ((p.id = working_hours.professional_id) AND (c.owner_id = auth.uid())))));


--
-- TOC entry 4092 (class 3256 OID 17890)
-- Name: appointments Users can delete own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own appointments" ON public.appointments FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4093 (class 3256 OID 17891)
-- Name: calendars Users can delete own calendars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own calendars" ON public.calendars FOR DELETE TO authenticated USING ((owner_id = auth.uid()));


--
-- TOC entry 4094 (class 3256 OID 17892)
-- Name: clients Users can delete own clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4095 (class 3256 OID 17893)
-- Name: professionals Users can delete own professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own professionals" ON public.professionals FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4096 (class 3256 OID 17894)
-- Name: specialties Users can delete own specialties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own specialties" ON public.specialties FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4097 (class 3256 OID 17895)
-- Name: working_hours Users can delete working hours for their professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete working hours for their professionals" ON public.working_hours FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.professionals p
     JOIN public.calendars c ON ((c.id = p.calendar_id)))
  WHERE ((p.id = working_hours.professional_id) AND (c.owner_id = auth.uid())))));


--
-- TOC entry 4098 (class 3256 OID 17896)
-- Name: ai_configurations Users can manage own configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own configurations" ON public.ai_configurations TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4099 (class 3256 OID 17897)
-- Name: working_hours Users can manage working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage working hours" ON public.working_hours TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.professionals p
  WHERE ((p.id = working_hours.professional_id) AND (p.user_id = auth.uid())))));


--
-- TOC entry 4100 (class 3256 OID 17898)
-- Name: calendars Users can read own calendars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own calendars" ON public.calendars FOR SELECT TO authenticated USING ((owner_id = auth.uid()));


--
-- TOC entry 4101 (class 3256 OID 17899)
-- Name: clients Users can read own clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own clients" ON public.clients FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4102 (class 3256 OID 17900)
-- Name: professionals Users can read own professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own professionals" ON public.professionals FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4103 (class 3256 OID 17901)
-- Name: user_settings Users can read own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own settings" ON public.user_settings FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 4104 (class 3256 OID 17902)
-- Name: specialties Users can read own specialties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own specialties" ON public.specialties FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4105 (class 3256 OID 17903)
-- Name: user_subscriptions Users can read own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 4106 (class 3256 OID 17904)
-- Name: working_hours Users can read working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read working hours" ON public.working_hours FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.professionals p
  WHERE ((p.id = working_hours.professional_id) AND (p.user_id = auth.uid())))));


--
-- TOC entry 4107 (class 3256 OID 17905)
-- Name: working_hours Users can read working hours for their calendars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read working hours for their calendars" ON public.working_hours FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.professionals p
     JOIN public.calendars c ON ((c.id = p.calendar_id)))
  WHERE ((p.id = working_hours.professional_id) AND (c.owner_id = auth.uid())))));


--
-- TOC entry 4108 (class 3256 OID 17906)
-- Name: appointments Users can update own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4109 (class 3256 OID 17907)
-- Name: calendars Users can update own calendars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own calendars" ON public.calendars FOR UPDATE TO authenticated USING ((owner_id = auth.uid()));


--
-- TOC entry 4110 (class 3256 OID 17908)
-- Name: clients Users can update own clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4111 (class 3256 OID 17909)
-- Name: professionals Users can update own professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own professionals" ON public.professionals FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4112 (class 3256 OID 17910)
-- Name: user_settings Users can update own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 4113 (class 3256 OID 17911)
-- Name: specialties Users can update own specialties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own specialties" ON public.specialties FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4114 (class 3256 OID 17912)
-- Name: working_hours Users can update working hours for their professionals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update working hours for their professionals" ON public.working_hours FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.professionals p
     JOIN public.calendars c ON ((c.id = p.calendar_id)))
  WHERE ((p.id = working_hours.professional_id) AND (c.owner_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.professionals p
     JOIN public.calendars c ON ((c.id = p.calendar_id)))
  WHERE ((p.id = working_hours.professional_id) AND (c.owner_id = auth.uid())))));


--
-- TOC entry 4076 (class 0 OID 17331)
-- Dependencies: 263
-- Name: ai_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4077 (class 0 OID 17406)
-- Dependencies: 273
-- Name: working_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4078 (class 0 OID 17414)
-- Dependencies: 274
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4079 (class 0 OID 17505)
-- Dependencies: 284
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4080 (class 0 OID 17514)
-- Dependencies: 285
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4081 (class 0 OID 17518)
-- Dependencies: 286
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4082 (class 0 OID 17528)
-- Dependencies: 287
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4083 (class 0 OID 17535)
-- Dependencies: 288
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4116 (class 6104 OID 17914)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 4115 (class 6104 OID 17915)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 4118 (class 6106 OID 19133)
-- Name: supabase_realtime appointments; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.appointments;


--
-- TOC entry 4117 (class 6106 OID 17916)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 3575 (class 3466 OID 17958)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- TOC entry 3580 (class 3466 OID 17996)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- TOC entry 3574 (class 3466 OID 17957)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- TOC entry 3581 (class 3466 OID 17997)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- TOC entry 3576 (class 3466 OID 17959)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- TOC entry 3577 (class 3466 OID 17960)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


-- Completed on 2025-05-19 17:58:24

--
-- PostgreSQL database dump complete
--

