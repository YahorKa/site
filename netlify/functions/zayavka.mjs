// Приём заявки с сайта и отправка в Telegram-группу.
//
// Переменные окружения (Netlify → Site configuration → Environment variables):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — id группы/канала (начинается с -100...)
//
// Форма на /zayavka отправляет POST сюда, в ответ — редирект на /spasibo.

const REQUIRED_CHILD = ['parent_name', 'child_name', 'child_age', 'direction', 'phone'];
const REQUIRED_ADULT = ['child_name', 'direction', 'phone'];

// Беларусь: 9 цифр, код оператора 25 / 29 / 33 / 44
const BY_CODES = ['25', '29', '33', '44'];

function localPhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('375')) digits = digits.slice(3);
  else if (digits.startsWith('80')) digits = digits.slice(2);
  return digits;
}

function isValidPhone(value) {
  const digits = localPhone(value);
  return /^\d{9}$/.test(digits) && BY_CODES.includes(digits.slice(0, 2));
}

function normalizePhone(value) {
  const digits = localPhone(value);
  if (!digits) return '';
  const formatted =
    digits.length === 9
      ? `${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`
      : digits;
  return `+375 ${formatted}`;
}

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// «7 лет», «34 года», «21 год»
function years(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '';
  const mod10 = num % 10;
  const mod100 = num % 100;
  if (mod10 === 1 && mod100 !== 11) return `${num} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${num} года`;
  return `${num} лет`;
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
  const adult = data.student_type === 'adult';
  const age = String(data.child_age ?? '').trim();

  const lines = [
    adult ? '🎨 <b>Новая заявка — взрослая группа</b>' : '🎨 <b>Новая заявка на занятие</b>',
    '',
  ];

  if (adult) {
    lines.push(`<b>Ученик:</b> ${esc(data.child_name)}${age ? `, ${years(age)}` : ''}`);
  } else {
    lines.push(`<b>Родитель:</b> ${esc(data.parent_name)}`);
    lines.push(`<b>Ученик:</b> ${esc(data.child_name)}, ${years(data.child_age)}`);
  }

  lines.push(
    `<b>Направление:</b> ${esc(data.direction)}`,
    `<b>Телефон:</b> ${esc(normalizePhone(data.phone) || data.phone)}`,
  );

  if (data.comment && String(data.comment).trim()) {
    lines.push(`<b>Комментарий:</b> ${esc(String(data.comment).trim())}`);
  }

  // Шпаргалка для педагога: что сказать при знакомстве
  const child = String(data.child_name ?? '').trim() || 'ученик';
  const parent = String(data.parent_name ?? '').trim() || child;

  lines.push(
    '',
    '💬 <b>Что сказать при звонке</b>',
    `— Здравствуйте, ${esc(adult ? child : parent)}! Это Анастасия, преподаватель изостудии Izo Studio.`,
    adult
      ? `— Вы оставляли заявку на занятия для взрослых — ${esc(data.direction)}.`
      : `— Вы оставляли заявку: ${esc(child)}${age ? `, ${years(age)}` : ''} — ${esc(data.direction)}.`,
    '— У нас есть утренняя и вечерняя группы — подскажу, куда удобнее ходить.',
    '— Первое занятие — знакомство: посмотрим уровень, попробуем материалы. Приносить ничего не нужно.',
    '— Если всё устроит, закрепим место в группе.',
  );

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

  const isAdult = data.student_type === 'adult';
  const required = isAdult ? REQUIRED_ADULT : REQUIRED_CHILD;
  const missing = required.filter((key) => !String(data[key] ?? '').trim());
  if (missing.length) {
    console.warn('zayavka: не хватает полей', missing.join(', '));
    return redirect('/oshibka');
  }

  if (!isValidPhone(data.phone)) {
    console.warn('zayavka: некорректный телефон', data.phone);
    return redirect('/zayavka?error=phone');
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
