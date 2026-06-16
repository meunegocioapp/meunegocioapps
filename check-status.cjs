async function run() {
  const MGMT = 'YOUR_SUPABASE_MGMT_TOKEN';
  const REF = 'zheqdrblwlhvzxrdaifo';
  const r = await fetch('https://api.supabase.com/v1/projects/' + REF, {
    headers: { 'Authorization': 'Bearer ' + MGMT }
  });
  const data = await r.json();
  console.log('Project status:', data.status);
  console.log('Region:', data.region);
  console.log('Name:', data.name);
}
run();
