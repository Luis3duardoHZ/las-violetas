const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { nombre, telefono, email, servicio, fecha, hora, mensaje } = req.body;

  if (!nombre || !telefono || !servicio || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const { error } = await supabase.from('reservas').insert([{
    nombre, telefono, email: email || null, servicio, fecha, hora,
    mensaje: mensaje || null, estado: 'pendiente'
  }]);

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Error al guardar la reserva' });
  }

  try {
    await Promise.all([
      enviarEmailDoctor({ nombre, telefono, email, servicio, fecha, hora, mensaje }),
      email ? enviarEmailPaciente({ nombre, email, servicio, fecha, hora }) : Promise.resolve()
    ]);
  } catch (e) {
    console.error('Email error:', e.message);
  }

  return res.status(200).json({ success: true });
};

async function enviarEmail(destinatario, asunto, html) {
  const r = await fetch('https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`
    },
    body: JSON.stringify({
      from: { email: process.env.FROM_EMAIL, name: 'Clínica Las Violetas' },
      to: [{ email: destinatario }],
      subject: asunto,
      html
    })
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`MailerSend ${r.status}: ${txt}`);
  }
}

async function enviarEmailDoctor({ nombre, telefono, email, servicio, fecha, hora, mensaje }) {
  return enviarEmail(
    process.env.DOCTOR_EMAIL,
    `Nueva reserva: ${nombre} — ${servicio}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB"><div style="background:#7C3AED;padding:28px"><h1 style="color:white;margin:0;font-size:20px">✦ Nueva Reserva · Las Violetas</h1></div><div style="padding:32px;background:#F9FAFB"><table style="width:100%;border-collapse:collapse;font-size:15px"><tr style="border-bottom:1px solid #E5E7EB"><td style="padding:12px 0;color:#6B7280;width:130px">Paciente</td><td style="padding:12px 0;font-weight:600;color:#1F2937">${nombre}</td></tr><tr style="border-bottom:1px solid #E5E7EB"><td style="padding:12px 0;color:#6B7280">Teléfono</td><td style="padding:12px 0;font-weight:600;color:#1F2937">${telefono}</td></tr><tr style="border-bottom:1px solid #E5E7EB"><td style="padding:12px 0;color:#6B7280">Email</td><td style="padding:12px 0;color:#1F2937">${email || '—'}</td></tr><tr style="border-bottom:1px solid #E5E7EB"><td style="padding:12px 0;color:#6B7280">Servicio</td><td style="padding:12px 0;font-weight:700;color:#7C3AED">${servicio}</td></tr><tr style="border-bottom:1px solid #E5E7EB"><td style="padding:12px 0;color:#6B7280">Fecha</td><td style="padding:12px 0;font-weight:600;color:#1F2937">${fecha}</td></tr><tr style="border-bottom:1px solid #E5E7EB"><td style="padding:12px 0;color:#6B7280">Hora</td><td style="padding:12px 0;font-weight:600;color:#1F2937">${hora}</td></tr>${mensaje ? `<tr><td style="padding:12px 0;color:#6B7280;vertical-align:top">Mensaje</td><td style="padding:12px 0;color:#4B5563">${mensaje}</td></tr>` : ''}</table></div></div>`
  );
}

async function enviarEmailPaciente({ nombre, email, servicio, fecha, hora }) {
  return enviarEmail(
    email,
    '¡Tu solicitud fue recibida! 🦷 Clínica Las Violetas',
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB"><div style="background:#7C3AED;padding:36px;text-align:center"><h1 style="color:white;margin:0;font-size:28px">✦ Las Violetas</h1><p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px">Clínica Dental · Dra. Rosangele Herrera</p></div><div style="padding:40px;background:#F9FAFB;text-align:center"><div style="font-size:56px;margin-bottom:20px">🦷</div><h2 style="color:#1F2937;margin:0 0 12px">¡Hola, ${nombre}!</h2><p style="color:#4B5563;line-height:1.7;margin:0 0 32px">Recibimos tu solicitud de cita. Te contactaremos pronto para confirmarte el horario.</p><div style="background:white;border-radius:12px;padding:24px;border:1px solid #E5E7EB;text-align:left;margin-bottom:28px"><p style="margin:0 0 16px;font-weight:700;color:#7C3AED;font-size:14px">Resumen de tu cita</p><p style="margin:8px 0;color:#1F2937"><strong>Servicio:</strong> ${servicio}</p><p style="margin:8px 0;color:#1F2937"><strong>Fecha:</strong> ${fecha}</p><p style="margin:8px 0;color:#1F2937"><strong>Hora:</strong> ${hora}</p></div><p style="color:#9CA3AF;font-size:13px">¿Dudas? WhatsApp <strong style="color:#1F2937">+58 414-000-0000</strong></p></div></div>`
  );
}
