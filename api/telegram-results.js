export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      candidateId = 'N/A',
      score = 0,
      totalQuestions = 0,
      bandScore = 0,
      timeSpent = '0:00',
      answers = {},
      submittedAt = new Date().toISOString(),
      source = 'reading-mock-pro'
    } = body;

    const compactAnswers = Object.keys(answers)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => {
        const raw = answers[key];
        const value = Array.isArray(raw) ? raw.join('/') : (raw ?? '-');
        return `Q${key}:${value || '-'}`;
      })
      .join(' | ');

    const message = [
      '📘 Reading Mock Submission',
      `Candidate ID: ${candidateId}`,
      `Score: ${score}/${totalQuestions}`,
      `Band: ${bandScore}`,
      `Time: ${timeSpent}`,
      `Submitted: ${submittedAt}`,
      `Source: ${source}`,
      '',
      'Answers:',
      compactAnswers || 'No answers captured.'
    ].join('\n');

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok || !telegramData.ok) {
      return res.status(502).json({ ok: false, error: 'Telegram API error', details: telegramData });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Internal server error', details: error?.message || String(error) });
  }
}
