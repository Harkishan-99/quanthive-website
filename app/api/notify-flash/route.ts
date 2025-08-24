import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const webhook = process.env.SLACK_NOTIFY_WEBHOOK;
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    const slackRes = await fetch(
      webhook,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${email} has requested notification about Flash` }),
      }
    );
    if (!slackRes.ok) throw new Error('Slack webhook failed');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
