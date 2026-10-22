// Contact form endpoint (Vercel Function). Validates the message and emails it
// to me through Resend, with the visitor's address as reply-to so a normal
// "reply" answers them.
//
// Environment (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required
//   CONTACT_TO      where messages go; must be the Resend account's email
//                   until a domain is verified there
//   CONTACT_FROM    optional sender; defaults to Resend's shared test address

declare const process: { env: Record<string, string | undefined> }

const LIMITS = { email: 254, subject: 150, message: 5000 }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_FILL_MS = 3000 // faster than this is a bot, not a person typing

type Payload = { email?: unknown; subject?: unknown; message?: unknown; website?: unknown; elapsed?: unknown }

export async function POST(request: Request) {
  let body: Payload
  try {
    body = await request.json()
  } catch {
    return fail(400, 'invalid request')
  }

  // Bots: the hidden "website" field is invisible to people, and real
  // visitors take more than a few seconds to write something. Pretend
  // success so they don't retry.
  if (body.website || typeof body.elapsed !== 'number' || body.elapsed < MIN_FILL_MS) {
    return Response.json({ ok: true })
  }

  const email = clean(body.email, LIMITS.email)
  const subject = clean(body.subject, LIMITS.subject).replace(/[\r\n]+/g, ' ')
  const message = clean(body.message, LIMITS.message)
  if (!EMAIL.test(email)) return fail(400, 'please enter a valid email')
  if (!message) return fail(400, 'please write a message')

  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  if (!key || !to) {
    // shows in Vercel → Deployment → Logs; visitors only see the generic error
    console.error('contact form missing env:', [!key && 'RESEND_API_KEY', !to && 'CONTACT_TO'].filter(Boolean).join(', '))
    // TEMP diagnostics: names only, never values
    console.error('contact env check:', {
      vercelEnv: process.env.VERCEL_ENV,
      branch: process.env.VERCEL_GIT_COMMIT_REF,
      similar: Object.keys(process.env).filter((k) => /resend|contact/i.test(k)),
    })
    return fail(500, 'contact form is not configured')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
      to,
      reply_to: email,
      subject: `[portfolio] ${subject || 'new message'}`,
      // plain text only, so nothing the visitor types is rendered as HTML
      text: `From: ${email}\n\n${message}`,
    }),
  })
  if (!res.ok) {
    console.error('resend failed', res.status, await res.text())
    return fail(502, 'could not send right now')
  }
  return Response.json({ ok: true })
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status })
}
