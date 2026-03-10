module.exports = async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_KEY;
  const pubKey = 'sb_publishable_9ommASfWPuoSqf52jp4RhQ_YVi_mqyQ';

  const results = {};

  // Test 1: secret key solo
  try {
    const r = await fetch(`${url}/rest/v1/reservas?limit=1`, {
      headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
    });
    results.test1_secret = { status: r.status, body: (await r.text()).slice(0, 150) };
  } catch(e) { results.test1_secret = { error: e.message }; }

  // Test 2: publishable key
  try {
    const r = await fetch(`${url}/rest/v1/reservas?limit=1`, {
      headers: { apikey: pubKey, Authorization: `Bearer ${secretKey}` }
    });
    results.test2_pub_apikey = { status: r.status, body: (await r.text()).slice(0, 150) };
  } catch(e) { results.test2_pub_apikey = { error: e.message }; }

  // Test 3: solo publishable
  try {
    const r = await fetch(`${url}/rest/v1/reservas?limit=1`, {
      headers: { apikey: pubKey, Authorization: `Bearer ${pubKey}` }
    });
    results.test3_pub_only = { status: r.status, body: (await r.text()).slice(0, 150) };
  } catch(e) { results.test3_pub_only = { error: e.message }; }

  res.status(200).json(results);
};
