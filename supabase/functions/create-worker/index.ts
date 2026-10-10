import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  // Browser preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return json({ error: 'Not authorized' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: 'Server configuration is incomplete' }, 500)
  }

  // Server-side client using the service role.
  // This key must never be exposed to the browser.
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  // Client using the caller's access token.
  // This verifies which authenticated user called the function.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser()

  if (userError || !user) {
    return json({ error: 'Not authorized' }, 401)
  }

  // Get the caller's profile using the server client.
  // The admin client skips RLS, so role and active are checked here.
  const { data: callerProfile, error: profileLookupError } =
    await supabaseAdmin
      .from('profiles')
      .select('role, shop_id, active')
      .eq('id', user.id)
      .single()

  if (
    profileLookupError ||
    !callerProfile ||
    callerProfile.role !== 'owner' ||
    callerProfile.active === false
  ) {
    return json({ error: 'Only owners can add workers' }, 403)
  }

  let body

  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const name = body?.name?.trim()
  const phone = body?.phone?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!name || !email || !password) {
    return json({ error: 'Name, email, and password are required' }, 400)
  }

  if (password.length < 6) {
    return json({ error: 'Password must be at least 6 characters' }, 400)
  }

  // Reject a duplicate phone before creating any auth account.
  if (phone) {
    const { data: existingPhone } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('shop_id', callerProfile.shop_id)
      .eq('phone', phone)
      .maybeSingle()

    if (existingPhone) {
      return json(
        {
          error:
            'A worker with this phone number already exists in your shop.',
        },
        409
      )
    }
  }

  // Create the worker's real Supabase Auth account.
  const { data: newUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

  if (createError || !newUser.user) {
    return json(
      { error: createError?.message || 'Could not create worker account' },
      400
    )
  }

  // Create the worker's application profile.
  // The worker gets the same shop as the owner who created them.
  const { error: profileError } = await supabaseAdmin
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
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
    return json({ error: profileError.message }, 400)
  }

  return json({ id: newUser.user.id }, 200)
})