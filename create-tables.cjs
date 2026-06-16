async function run() {
  const MGMT = 'YOUR_SUPABASE_MGMT_TOKEN';
  const REF = 'zheqdrblwlhvzxrdaifo';
  const url = 'https://api.supabase.com/v1/projects/' + REF + '/database/query';

  async function q(sql, label) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + MGMT }, body: JSON.stringify({ query: sql }) });
    const t = await r.text();
    console.log(label + ':', r.status, r.status !== 201 ? t.substring(0, 80) : 'OK');
    return r.status;
  }

  await q("CREATE TABLE IF NOT EXISTS public.shops (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, owner_id UUID, name TEXT NOT NULL DEFAULT 'Meu Salao', slug TEXT UNIQUE, address TEXT, phone TEXT, whatsapp TEXT, instagram TEXT, pix_key TEXT, opening_time TIME DEFAULT '09:00', closing_time TIME DEFAULT '19:00', lunch_start TIME, lunch_end TIME, slot_duration INT DEFAULT 30, active BOOLEAN DEFAULT true, is_default BOOLEAN DEFAULT false, hotmart_monthly TEXT DEFAULT '', hotmart_annual TEXT DEFAULT '', plan_monthly_text TEXT DEFAULT '', plan_annual_text TEXT DEFAULT '', plan_monthly_price TEXT DEFAULT '', plan_annual_price TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT now());", 'shops');

  await q("CREATE TABLE IF NOT EXISTS public.services (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, name TEXT NOT NULL, price NUMERIC DEFAULT 0, duration_minutes INT DEFAULT 30, category TEXT DEFAULT 'Manicure', icon TEXT DEFAULT '', active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());", 'services');

  await q("CREATE TABLE IF NOT EXISTS public.barbers (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, name TEXT NOT NULL, specialty TEXT DEFAULT '', avatar_emoji TEXT DEFAULT '', rating NUMERIC DEFAULT 5.0, reviews_count INT DEFAULT 0, active BOOLEAN DEFAULT true, commission_pct NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());", 'professionals');

  await q("CREATE TABLE IF NOT EXISTS public.appointments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, barber_id UUID, barber_name TEXT, client_name TEXT, client_phone TEXT, service_name TEXT, service_price NUMERIC DEFAULT 0, services_json JSONB, total_duration_minutes INT DEFAULT 30, appointment_date DATE, appointment_time TIME, status TEXT DEFAULT 'pending', payment_method TEXT, payment_status TEXT DEFAULT 'pending', package_group_id TEXT, package_ref TEXT, package_session_num INT, package_total_sessions INT, reminder_sent BOOLEAN DEFAULT false, commission_pct NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());", 'appointments');

  await q("CREATE TABLE IF NOT EXISTS public.packages (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, name TEXT NOT NULL, price NUMERIC DEFAULT 0, items INT DEFAULT 1, frequencia TEXT DEFAULT 'Semanal', validade TEXT DEFAULT 'Mensal', popular BOOLEAN DEFAULT false, active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());", 'packages');

  await q("CREATE TABLE IF NOT EXISTS public.promotions (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, name TEXT NOT NULL, description TEXT, emoji TEXT DEFAULT '', original_price NUMERIC DEFAULT 0, promo_price NUMERIC DEFAULT 0, valid_until DATE, active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now());", 'promotions');

  await q("CREATE TABLE IF NOT EXISTS public.barber_users (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, barber_id UUID, user_id UUID, created_at TIMESTAMPTZ DEFAULT now());", 'barber_users');

  await q("CREATE TABLE IF NOT EXISTS public.settings (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, shop_id UUID, key TEXT, value TEXT, created_at TIMESTAMPTZ DEFAULT now());", 'settings');

  // RLS + policies
  const tables = ['shops','services','barbers','appointments','packages','promotions','barber_users','settings'];
  for (const t of tables) {
    await q('ALTER TABLE public.' + t + ' ENABLE ROW LEVEL SECURITY;', 'RLS ' + t);
    await q('CREATE POLICY "' + t + '_all" ON public.' + t + ' FOR ALL USING (true) WITH CHECK (true);', 'Policy ' + t);
  }
}
run();
