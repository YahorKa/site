// Приём заявки с сайта и отправка в Telegram-группу.
//
// Переменные окружения (Netlify → Site configuration → Environment variables):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id группы/канала (начинается с -100...)
//
// Форма на /zayavka отправляет POST сюда, в ответ — редирект на /spasibo.

const REQUIRED = ['parent_name', 'child_name', 'child_age', 'direction', 'phone'];

function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  let local = digits.startsWith('375') ? digits.slice(3) : digits;
  if (local.startsWith('80')) local = local.slice(2);
  local = local.slice(0, 9);
  const formatted =
    local.length === 9
      ? `${local.slice(0, 2)} ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7, 9)}`
      : local;
  return `+375 ${formatted}`;
}

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseBody(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';

  const type = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
  if (type.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

function redirect(location) {
  return {
    statusCode: 303,
    headers: { Location: location, 'Cache-Control': 'no-store' },
    body: '',
  };
}

function formatMessage(data) {
  const lines = [
    '🎨 <b>Новая заявка на занятие</b>',
    '',
    `<b>Родитель:</b> ${esc(data.parent_name)}`,
    `<b>Ученик:</b> ${esc(data.child_name)}, ${esc(data.child_age)} лет`,
    `<b>Направление:</b> ${esc(data.direction)}`,
    `<b>Телефон:</b> ${esc(normalizePhone(data.phone) || data.phone)}`,
  ];

  if (data.comment && String(data.comment).trim()) {
    lines.push(`<b>Комментарий:</b> ${esc(String(data.comment).trim())}`);
  }

  const now = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Minsk',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push('', `<i>${now} (Минск)</i>`);

  return lines.join('\n');
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = parseBody(event);

  // Ловушка для ботов: поле скрыто, люди его не заполняют.
  if (data['bot-field']) {
    return redirect('/spasibo');
  }

  const missing = REQUIRED.filter((key) => !String(data[key] ?? '').trim());
  if (missing.length) {
    console.warn('zayavka: не хватает полей', missing.join(', '));
    return redirect('/oshibka');
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('zayavka: не заданы TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID');
    return redirect('/oshibka');
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatMessage(data),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const result = await res.json();
    if (!res.ok || !result.ok) {
      console.error('zayavka: telegram error', JSON.stringify(result));
      return redirect('/oshibka');
    }

    return redirect('/spasibo');
  } catch (err) {
    console.error('zayavka: fetch failed', err?.message);
    return redirect('/oshibka');
  }
}
