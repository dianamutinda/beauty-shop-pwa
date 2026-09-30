import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Browser preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return new Response(
      JSON.stringify({
        error: 'Server configuration is incomplete',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Server-side client using the service role.
  // This key must never be exposed to the browser.
  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey
  )

  // Client using the caller's access token.
  // This verifies which authenticated user called the function.
  const callerClient = createClient(
    supabaseUrl,
    anonKey,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser()

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Get the caller's profile using the server client.
  const {
    data: callerProfile,
    error: profileLookupError,
  } = await supabaseAdmin
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (
    profileLookupError ||
    !callerProfile ||
    callerProfile.role !== 'owner'
  ) {
    return new Response(
      JSON.stringify({
        error: 'Only owners can add workers',
      }),
      {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  let body

  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Invalid request body',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  const name = body?.name?.trim()
  const phone = body?.phone?.trim()
  const email = body?.email?.trim()
  const password = body?.password

  if (!name || !email || !password) {
    return new Response(
      JSON.stringify({
        error: 'Name, email, and password are required',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  if (password.length < 6) {
    return new Response(
      JSON.stringify({
        error: 'Password must be at least 6 characters',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Create the worker's real Supabase Auth account.
  const {
    data: newUser,
    error: createError,
  } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !newUser.user) {
    return new Response(
      JSON.stringify({
        error:
          createError?.message ||
          'Could not create worker account',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Create the worker's application profile.
  // The worker gets the same shop as the owner who created them.
  const {
    error: profileError,
  } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUser.user.id,
      shop_id: callerProfile.shop_id,
      role: 'worker',
      display_name: name,
      phone: phone || null,
      active: true,
    })

  // If the profile cannot be created, remove the Auth account
  // so we don't leave an incomplete worker behind.
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(
      newUser.user.id
    )

    return new Response(
      JSON.stringify({
        error: profileError.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  return new Response(
    JSON.stringify({
      id: newUser.user.id,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
})