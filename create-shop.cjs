async function run() {
  const MGMT = 'YOUR_SUPABASE_MGMT_TOKEN';
  const REF = 'zheqdrblwlhvzxrdaifo';
  const url = 'https://api.supabase.com/v1/projects/' + REF + '/database/query';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + MGMT },
    body: JSON.stringify({ query: "INSERT INTO public.shops (owner_id, name, slug, is_default, active) VALUES ('132878a0-aec9-40df-b537-efc3161a5080', 'Meu Salao', 'meu-salao', true, true) ON CONFLICT (slug) DO NOTHING;" })
  });
  console.log('Shop:', r.status);
}
run();
