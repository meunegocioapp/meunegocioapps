async function run() {
  const MGMT = 'YOUR_SUPABASE_MGMT_TOKEN';
  const REF = 'zheqdrblwlhvzxrdaifo';
  const url = 'https://api.supabase.com/v1/projects/' + REF + '/database/query';

  async function query(sql) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + MGMT },
      body: JSON.stringify({ query: sql })
    });
    return r.status;
  }

  console.log('Creating ManiPro schema...');

  // Shops (saloes)
  let s = await query(`
    CREATE TABLE IF NOT EXISTS public.shops (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      owner_id UUID REFERENCES auth.users(id),
      name TEXT NOT NULL DEFAULT 'Meu Salao',
      slug TEXT UNIQUE,
      address TEXT,
      phone TEXT,
      whatsapp TEXT,
      instagram TEXT,
      pix_key TEXT,
      opening_time TIME DEFAULT '09:00',
      closing_time TIME DEFAULT '19:00',
      lunch_start TIME,
      lunch_end TIME,
      slot_duration INT DEFAULT 30,
      active BOOLEAN DEFAULT true,
      is_default BOOLEAN DEFAULT false,
      hotmart_monthly TEXT DEFAULT '',
      hotmart_annual TEXT DEFAULT '',
      plan_monthly_text TEXT DEFAULT '',
      plan_annual_text TEXT DEFAULT '',
      plan_monthly_price TEXT DEFAULT '',
      plan_annual_price TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  shops:', s);

  // Services
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.services (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      name TEXT NOT NULL,
      price NUMERIC DEFAULT 0,
      duration_minutes INT DEFAULT 30,
      category TEXT DEFAULT 'Manicure',
      icon TEXT DEFAULT '',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  services:', s);

  // Professionals (manicures/pedicures)
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.barbers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      name TEXT NOT NULL,
      specialty TEXT DEFAULT '',
      avatar_emoji TEXT DEFAULT '',
      rating NUMERIC DEFAULT 5.0,
      reviews_count INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      commission_pct NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  barbers (professionals):', s);

  // Appointments
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.appointments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      barber_id UUID REFERENCES public.barbers(id),
      barber_name TEXT,
      client_name TEXT,
      client_phone TEXT,
      service_name TEXT,
      service_price NUMERIC DEFAULT 0,
      services_json JSONB,
      total_duration_minutes INT DEFAULT 30,
      appointment_date DATE,
      appointment_time TIME,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      package_group_id TEXT,
      package_ref TEXT,
      package_session_num INT,
      package_total_sessions INT,
      reminder_sent BOOLEAN DEFAULT false,
      commission_pct NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  appointments:', s);

  // Packages
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.packages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      name TEXT NOT NULL,
      price NUMERIC DEFAULT 0,
      items INT DEFAULT 1,
      frequencia TEXT DEFAULT 'Semanal',
      validade TEXT DEFAULT 'Mensal',
      popular BOOLEAN DEFAULT false,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  packages:', s);

  // Promotions
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.promotions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      name TEXT NOT NULL,
      description TEXT,
      emoji TEXT DEFAULT '',
      original_price NUMERIC DEFAULT 0,
      promo_price NUMERIC DEFAULT 0,
      valid_until DATE,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  promotions:', s);

  // Barber users (professional login access)
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.barber_users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      barber_id UUID REFERENCES public.barbers(id),
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  barber_users:', s);

  // Settings
  s = await query(`
    CREATE TABLE IF NOT EXISTS public.settings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      shop_id UUID REFERENCES public.shops(id),
      key TEXT,
      value TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('  settings:', s);

  // RLS policies
  s = await query(`ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.barber_users ENABLE ROW LEVEL SECURITY;`);
  s = await query(`ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;`);

  // Allow all for authenticated and anon (same as BarberOS)
  const tables = ['shops','services','barbers','appointments','packages','promotions','barber_users','settings'];
  for (const t of tables) {
    await query(`DROP POLICY IF EXISTS "${t}_all" ON public.${t};`);
    await query(`CREATE POLICY "${t}_all" ON public.${t} FOR ALL USING (true) WITH CHECK (true);`);
  }
  console.log('  RLS policies: OK');

  // Create admin user
  console.log('\nCreating admin user...');
  const SB_URL = 'https://zheqdrblwlhvzxrdaifo.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZXFkcmJsd2xodnp4cmRhaWZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU5MjQxOCwiZXhwIjoyMDk3MTY4NDE4fQ.vaJl2or23kjcvDniYF9qDoF8R414X-uFlkf-EsmCJus';
  const r = await fetch(SB_URL + '/auth/v1/admin/users', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + SB_KEY, 'apikey': SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'covalsqui.arrabal1@gmail.com', password: 'cov123', email_confirm: true })
  });
  const user = await r.json();
  console.log('  Admin user:', user.id || user.msg);

  // Create default shop
  if (user.id) {
    await query(`INSERT INTO public.shops (owner_id, name, slug, is_default, active) VALUES ('${user.id}', 'Meu Salao', 'meu-salao', true, true);`);
    console.log('  Default shop created: Meu Salao');
  }

  console.log('\nDone! ManiPro database ready.');
}
run().catch(e => console.log('Error:', e.message));
