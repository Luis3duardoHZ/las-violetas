module.exports = async function handler(req, res) {
  res.status(200).json({
    ok: true,
    node: process.version,
    hasFetch: typeof fetch !== 'undefined',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_KEY,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    supabaseUrlPreview: (process.env.SUPABASE_URL || '').slice(0, 30)
  });
};
