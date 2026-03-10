module.exports = async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  const result = {
    node: process.version,
    hasFetch: typeof fetch !== 'undefined',
    hasUrl: !!url,
    hasKey: !!key,
    urlPreview: url ? url.slice(0, 40) : 'NOT SET'
  };

  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/reservas?limit=1`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      });
      const text = await r.text();
      result.supabaseStatus = r.status;
      result.supabaseResponse = text.slice(0, 200);
    } catch (e) {
      result.supabaseError = e.message;
    }
  }

  res.status(200).json(result);
};
