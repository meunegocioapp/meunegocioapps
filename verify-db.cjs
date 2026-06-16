async function run() {
  const MGMT = 'YOUR_SUPABASE_MGMT_TOKEN';
  const REF = 'zheqdrblwlhvzxrdaifo';
  const url = 'https://api.supabase.com/v1/projects/' + REF + '/database/query';
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + MGMT },
    body: JSON.stringify({ query: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" })
  });
  const data = await r.json();
  console.log('Tables:', JSON.stringify(data));
}
run();
