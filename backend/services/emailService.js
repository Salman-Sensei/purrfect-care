const { Resend } = require('resend');
const User       = require('../models/User');
const Task       = require('../models/Task');
const VetRecord  = require('../models/VetRecord');
const Cat        = require('../models/Cat');

const resend = new Resend(process.env.RESEND_API_KEY);

// ── HTML email template ───────────────────────────────────────────────────────
function buildEmailHTML({ userName, tasks, upcomingVets, date }) {
  const dateStr = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const taskRows = tasks.length === 0
    ? `<tr><td style="padding:12px 0;color:#94a3b8;font-style:italic;font-size:14px;">No tasks scheduled for today 🎉</td></tr>`
    : tasks.map(t => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:20px;">${t.emoji || '✅'}</span>
              <div>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">${t.title}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">🐱 ${t.catId?.name || 'Your cat'}</p>
              </div>
            </div>
          </td>
        </tr>`).join('')

  const vetRows = upcomingVets.length === 0
    ? `<tr><td style="padding:12px 0;color:#94a3b8;font-style:italic;font-size:14px;">No upcoming vet appointments 👍</td></tr>`
    : upcomingVets.map(v => {
        const daysUntil = Math.ceil((new Date(v.nextVisitDate) - new Date()) / 86400000)
        const urgency   = daysUntil <= 3 ? '#ef4444' : daysUntil <= 7 ? '#f97316' : '#10b981'
        return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">🏥 ${v.type.charAt(0).toUpperCase() + v.type.slice(1)}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">🐱 ${v.catId?.name || 'Your cat'}${v.clinic ? ` · ${v.clinic}` : ''}</p>
              </div>
              <span style="font-size:12px;font-weight:700;color:${urgency};white-space:nowrap;">
                ${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
              </span>
            </div>
          </td>
        </tr>`
      }).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:20px;padding:28px 32px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:28px;">🐾</p>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:white;">Good morning, ${userName}!</h1>
      <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">${dateStr}</p>
    </div>

    <!-- Tasks -->
    <div style="background:white;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:800;color:#1e293b;display:flex;align-items:center;gap:8px;">
        ✅ Today's Tasks
        <span style="font-size:12px;font-weight:600;background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:20px;">${tasks.length}</span>
      </h2>
      <table style="width:100%;border-collapse:collapse;">${taskRows}</table>
    </div>

    <!-- Upcoming Vets -->
    <div style="background:white;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h2 style="margin:0 0 16px;font-size:16px;font-weight:800;color:#1e293b;display:flex;align-items:center;gap:8px;">
        📅 Upcoming Vet Visits
        <span style="font-size:12px;font-weight:600;background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:20px;">${upcomingVets.length}</span>
      </h2>
      <table style="width:100%;border-collapse:collapse;">${vetRows}</table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Open Purrfect Care 🐾
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">
        You're receiving this because you have email notifications enabled.<br>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
          style="color:#6366f1;text-decoration:none;">Manage notification settings</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── Send digest for a single user ─────────────────────────────────────────────
async function sendDailyDigest(userId, userEmail, userName) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Today's tasks
  const tasks = await Task.find({
    userId,
    date: { $gte: today, $lt: tomorrow },
  }).populate('catId', 'name').lean()

  // Upcoming vet visits in next 30 days
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)
  const upcomingVets = await VetRecord.find({
    userId,
    nextVisitDate: { $gte: today, $lte: in30 },
  }).populate('catId', 'name').sort({ nextVisitDate: 1 }).lean()

  // Skip if nothing to report
  if (tasks.length === 0 && upcomingVets.length === 0) return { skipped: true }

  const html = buildEmailHTML({ userName, tasks, upcomingVets, date: today })

  const { data, error } = await resend.emails.send({
    from: 'Purrfect Care <onboarding@resend.dev>',
    to:   userEmail,
    subject: `🐾 ${userName.split(' ')[0]}'s Daily Cat Care Summary — ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    html,
  })

  if (error) throw new Error(error.message)
  return { sent: true, id: data.id, taskCount: tasks.length, vetCount: upcomingVets.length }
}

// ── Send digest to all opted-in users ────────────────────────────────────────
async function sendDailyDigestToAll() {
  const users = await User.find({ emailNotifications: true }).lean()
  console.log(`📧 Sending daily digest to ${users.length} user(s)...`)

  const results = await Promise.allSettled(
    users.map(u => sendDailyDigest(u._id, u.email, u.name))
  )

  const sent    = results.filter(r => r.status === 'fulfilled' && r.value?.sent).length
  const skipped = results.filter(r => r.status === 'fulfilled' && r.value?.skipped).length
  const failed  = results.filter(r => r.status === 'rejected').length

  console.log(`📧 Digest complete — sent: ${sent}, skipped: ${skipped}, failed: ${failed}`)
  return { sent, skipped, failed }
}

module.exports = { sendDailyDigest, sendDailyDigestToAll }
