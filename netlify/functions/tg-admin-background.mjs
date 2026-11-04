// Telegram-админка сайта Izo Studio.
//
// Умеет: добавлять работы (фото с подписью), удалять работы, менять цены и расписание.
// Все правки идут коммитами в GitHub, дальше Netlify сам пересобирает сайт.
//
// Переменные окружения:
//   TELEGRAM_BOT_TOKEN       — токен бота
//   TELEGRAM_WEBHOOK_SECRET  — секрет вебхука (тот же, что в setWebhook)
//   GITHUB_TOKEN             — токен с правом Contents: Read and write
//   GITHUB_REPO              — по умолчанию YahorKa/site
//   GITHUB_BRANCH            — по умолчанию astro
//   ADMIN_CHAT_IDS           — через запятую: кто может управлять
//
// Файл назван *-background — Netlify даёт таким функциям до 15 минут,
// потому что загрузка фото и коммит иногда не укладываются в 10 секунд.

const API = 'https://api.github.com';

const REPO = process.env.GITHUB_REPO || 'YahorKa/site';
const BRANCH = process.env.GITHUB_BRANCH || 'astro';
const TOKEN = process.env.GITHUB_TOKEN;
const BOT = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED = (process.env.ADMIN_CHAT_IDS || '-5478222453')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const PATHS = {
  works: 'src/data/works.json',
  prices: 'src/data/prices.json',
  schedule: 'src/data/schedule.json',
  images: 'public/gallery/works',
};

const ghHeaders = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'content-type': 'application/json',
};

async function ghGet(path) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`, {
    headers: ghHeaders,
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { sha: data.sha, text: Buffer.from(data.content, 'base64').toString('utf8') };
}

async function ghPut(path, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function ghDelete(path, message, sha) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: 'DELETE',
    headers: ghHeaders,
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub DELETE ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function readJson(path) {
  const file = await ghGet(path);
  if (!file) throw new Error(`Файл ${path} не найден`);
  return { sha: file.sha, data: JSON.parse(file.text) };
}

const tg = async (chatId, text) => {
  const res = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!res.ok) console.error('telegram sendMessage:', res.status, await res.text());
};

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};

function slugify(text) {
  const base = String(text)
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return base || `work-${Date.now()}`;
}

async function downloadPhoto(fileId) {
  const meta = await fetch(`https://api.telegram.org/bot${BOT}/getFile?file_id=${fileId}`).then((r) => r.json());
  if (!meta.ok) throw new Error(`getFile: ${meta.description}`);
  const fileUrl = `https://api.telegram.org/file/bot${BOT}/${meta.result.file_path}`;
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`download: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function helpText() {
  return [
    '<b>Админка Izo Studio</b>',
    '',
    '• Пришлите фото с подписью — добавлю работу в галерею.',
    '  Подпись: <i>Название; техника</i>',
    '  Например: <i>Кот в шапке; гуашь</i>',
    '',
    '• /list — работы, цены и расписание',
    '• /del 2 — удалить работу №2',
    '• /price 1 120 руб — цена №1',
    '• /time 1 Пн, Ср 09:30-10:15 — расписание №1',
    '',
    'После правки сайт обновляется сам за ~30 секунд.',
  ].join('\n');
}

async function listAll(chatId) {
  const works = (await readJson(PATHS.works)).data;
  const prices = (await readJson(PATHS.prices)).data;
  const schedule = (await readJson(PATHS.schedule)).data;

  const lines = ['<b>Работы</b>'];
  if (works.length === 0) lines.push('— пока пусто');
  works.forEach((w, i) => lines.push(`${i + 1}. ${esc(w.title)}${w.technique ? ` <i>(${esc(w.technique)})</i>` : ''}`));

  lines.push('', '<b>Цены</b>');
  prices.forEach((p, i) => lines.push(`${i + 1}. ${esc(p.title)} — <b>${esc(p.price)}</b>`));

  lines.push('', '<b>Расписание</b>');
  schedule.forEach((s, i) => lines.push(`${i + 1}. ${esc(s.days)} — ${esc(s.time)}`));

  await tg(chatId, lines.join('\n'));
}

async function addWork(chatId, message) {
  const photos = message.photo;
  const doc = message.document && /^image\//.test(message.document.mime_type || '') ? message.document : null;

  if (!photos && !doc) {
    await tg(chatId, 'Пришлите фото картинки — документом или как фотографию.');
    return;
  }

  const caption = (message.caption || '').trim();
  if (!caption) {
    await tg(chatId, 'Добавьте подпись к фото — иначе не знаю, как назвать работу.\nФормат: <i>Название; техника</i>');
    return;
  }

  const fileId = photos ? photos[photos.length - 1].file_id : doc.file_id;
  const [titleRaw, techniqueRaw] = caption.split(';').map((s) => s.trim());
  const title = titleRaw || 'Без названия';
  const technique = techniqueRaw || '';

  await tg(chatId, '⏳ Сохраняю…');

  const buffer = await downloadPhoto(fileId);

  const slug = slugify(title);
  let fileName = `${slug}.jpg`;
  const existing = await readJson(PATHS.works);

  // имя файла не должно совпасть с уже существующим
  let n = 2;
  while (existing.data.some((w) => w.file === fileName)) {
    fileName = `${slug}-${n}.jpg`;
    n += 1;
  }

  await ghPut(`${PATHS.images}/${fileName}`, buffer, `Галерея: ${title}`);

  existing.data.push({ file: fileName, title, technique });
  await ghPut(
    PATHS.works,
    JSON.stringify(existing.data, null, 2) + '\n',
    `Галерея: добавить «${title}»`,
    existing.sha,
  );

  await tg(chatId, `✅ Добавил «${esc(title)}».\nЧерез ~30 секунд появится на сайте.`);
}

async function deleteWork(chatId, arg) {
  const index = Number(arg) - 1;
  const file = await readJson(PATHS.works);
  if (!Number.isInteger(index) || index < 0 || index >= file.data.length) {
    await tg(chatId, `Нет работы с таким номером. Всего работ: ${file.data.length}. Смотрите /list`);
    return;
  }

  const [removed] = file.data.splice(index, 1);
  await ghPut(PATHS.works, JSON.stringify(file.data, null, 2) + '\n', `Галерея: удалить «${removed.title}»`, file.sha);

  const imagePath = `${PATHS.images}/${removed.file}`;
  const image = await ghGet(imagePath);
  if (image) await ghDelete(imagePath, `Галерея: удалить файл ${removed.file}`, image.sha);

  await tg(chatId, `🗑 Удалил «${esc(removed.title)}».`);
}

async function setPrice(chatId, arg) {
  const match = String(arg).match(/^(\d+)\s+(.+)$/);
  if (!match) {
    await tg(chatId, 'Формат: <code>/price 1 120 руб</code>');
    return;
  }
  const index = Number(match[1]) - 1;
  const value = match[2].trim();

  const file = await readJson(PATHS.prices);
  if (index < 0 || index >= file.data.length) {
    await tg(chatId, `Нет цены с таким номером. Всего: ${file.data.length}. Смотрите /list`);
    return;
  }

  const before = file.data[index].price;
  file.data[index].price = value;
  await ghPut(PATHS.prices, JSON.stringify(file.data, null, 2) + '\n', `Цены: ${file.data[index].title} → ${value}`, file.sha);

  await tg(chatId, `✅ ${esc(file.data[index].title)}: ${esc(before)} → <b>${esc(value)}</b>`);
}

async function setTime(chatId, arg) {
  const match = String(arg).match(/^(\d+)\s+(.+)$/);
  if (!match) {
    await tg(chatId, 'Формат: <code>/time 1 Пн, Ср 09:30-10:15</code>');
    return;
  }
  const index = Number(match[1]) - 1;
  const rest = match[2].trim();

  const timeMatch = rest.match(/(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/);
  if (!timeMatch) {
    await tg(chatId, 'Не вижу времени. Пример: <code>/time 1 Пн, Ср 09:30-10:15</code>');
    return;
  }

  const days = rest.slice(0, timeMatch.index).replace(/[,\s]+$/, '').trim();
  if (!days) {
    await tg(chatId, 'Не вижу дней недели. Пример: <code>/time 1 Пн, Ср 09:30-10:15</code>');
    return;
  }

  const time = `${timeMatch[1].replace('.', ':')}–${timeMatch[2].replace('.', ':')}`;

  const file = await readJson(PATHS.schedule);
  if (index < 0 || index >= file.data.length) {
    await tg(chatId, `Нет группы с таким номером. Всего: ${file.data.length}. Смотрите /list`);
    return;
  }

  file.data[index] = { days, time };
  await ghPut(PATHS.schedule, JSON.stringify(file.data, null, 2) + '\n', `Расписание: ${days} ${time}`, file.sha);

  await tg(chatId, `✅ Группа ${index + 1}: ${esc(days)} — <b>${esc(time)}</b>`);
}

async function handle(update) {
  const message = update.message || update.channel_post;
  if (!message) return;

  const chatId = String(message.chat.id);

  if (!ALLOWED.includes(chatId)) {
    return; // чужим не отвечаем и ничего не меняем
  }

  const text = (message.text || '').trim();

  if (!text && (message.photo || message.document)) {
    return addWork(chatId, message);
  }

  if (text === '/start' || text === '/help') return tg(chatId, helpText());
  if (text === '/id') return tg(chatId, `chat_id: <code>${chatId}</code>`);
  if (text === '/list') return listAll(chatId);

  if (text.startsWith('/del')) return deleteWork(chatId, text.replace('/del', '').trim());
  if (text.startsWith('/price')) return setPrice(chatId, text.replace('/price', '').trim());
  if (text.startsWith('/time')) return setTime(chatId, text.replace('/time', '').trim());

  return tg(chatId, 'Не понял команду. /help — что я умею.');
}

export async function handler(event) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const got = event.headers['x-telegram-bot-api-secret-token'] || event.headers['X-Telegram-Bot-Api-Secret-Token'];

  if (secret && got !== secret) {
    console.warn('tg-admin: неверный секрет вебхука');
    return { statusCode: 401, body: 'unauthorized' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const update = JSON.parse(event.body || '{}');
    await handle(update);
    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('tg-admin error:', err?.message, err?.stack);
    // сообщаем в чат, чтобы ошибка не потерялась
    const chatId = JSON.parse(event.body || '{}')?.message?.chat?.id;
    if (chatId) await tg(chatId, `⚠️ Ошибка: ${esc(err?.message || 'неизвестная')}`);
    return { statusCode: 200, body: 'error' };
  }
}
