const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Método no permitido' });

  if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { id, estado } = req.body;

  if (!id || !estado) return res.status(400).json({ error: 'Faltan datos' });
  if (!['pendiente', 'confirmada', 'cancelada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const { error } = await supabase.from('reservas').update({ estado }).eq('id', id);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar' });
  }

  return res.status(200).json({ success: true });
};
