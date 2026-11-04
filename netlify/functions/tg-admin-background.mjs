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
// Оба ID: старая группа и супергруппа, в которую она превратилась.
// Переменная ADMIN_CHAT_IDS добавляется к этому списку, а не заменяет его.
const DEFAULT_CHATS = ['-5478222453', '-1003823799689'];
const ALLOWED = [
  ...new Set([
    ...DEFAULT_CHATS,
    ...(process.env.ADMIN_CHAT_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  ]),
];

const PATHS = {
  gallery: 'src/data/gallery.json',
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

function parseCaption(caption) {
  const raw = String(caption || '').trim();
  if (!raw) return { title: '', technique: '' };

  const semi = raw.split(';');
  if (semi.length > 1) {
    return { title: semi[0].trim(), technique: semi.slice(1).join(';').trim() };
  }

  const paren = raw.match(/^(.*?)\s*[\(\[]([^\)\]]+)[\)\]]\s*$/);
  if (paren) {
    return { title: paren[1].trim(), technique: paren[2].trim() };
  }

  return { title: raw, technique: '' };
}

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
    '  Подпись: <i>Название; техника</i> или <i>Название (техника)</i>',
    '  Например: <i>Кот в шапке; гуашь</i> или <i>Тукан (гуашь)</i>',
    '',
    '• /list — все работы в галерее',
    '',
    'После добавления сайт обновляется сам за ~30 секунд.',
  ].join('\n');
}

async function listAll(chatId) {
  const items = (await readJson(PATHS.gallery)).data;
  const works = items.filter((w) => w.type === 'work');
  const fromInstagram = items.length - works.length;

  const lines = [`<b>Галерея</b> — ${items.length} работ`];
  if (items.length === 0) lines.push('— пока пусто');
  items.forEach((w, i) => {
    const mark = w.type === 'work' ? '🖼' : '📷';
    const tech = w.technique ? ` <i>(${esc(w.technique)})</i>` : '';
    lines.push(`${i + 1}. ${mark} ${esc(w.title)}${tech}`);
  });

  lines.push('', `🖼 загружено через бота: ${works.length} · 📷 из Instagram: ${fromInstagram}`);

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
  const parsed = parseCaption(caption);
  const title = parsed.title || 'Без названия';
  const technique = parsed.technique;

  await tg(chatId, '⏳ Сохраняю…');

  const buffer = await downloadPhoto(fileId);

  const slug = slugify(title);
  let fileName = `${slug}.jpg`;
  const existing = await readJson(PATHS.gallery);

  // имя файла не должно совпасть с уже существующим
  let n = 2;
  while (existing.data.some((w) => w.type === 'work' && w.file === fileName)) {
    fileName = `${slug}-${n}.jpg`;
    n += 1;
  }

  await ghPut(`${PATHS.images}/${fileName}`, buffer, `Галерея: ${title}`);

  // новые работы ставим после уже загруженных, но перед записями из Instagram
  const lastWork = existing.data.map((w) => w.type).lastIndexOf('work');
  existing.data.splice(lastWork === -1 ? 0 : lastWork + 1, 0, {
    type: 'work',
    file: fileName,
    title,
    technique,
  });
  await ghPut(
    PATHS.gallery,
    JSON.stringify(existing.data, null, 2) + '\n',
    `Галерея: добавить «${title}»`,
    existing.sha,
  );

  await tg(chatId, `✅ Добавил «${esc(title)}».\nЧерез ~30 секунд появится на сайте.`);
}

async function handle(update) {
  const message = update.message || update.channel_post;
  if (!message) return;

  const chatId = String(message.chat.id);
  const text = (message.text || '').trim();

  // /id отвечаем всегда: иначе не понять, из какого чата пришло сообщение
  if (text === '/id') {
    const allowed = ALLOWED.includes(chatId) ? 'этот чат подключён ✅' : 'этот чат НЕ подключён ❌';
    return tg(chatId, `chat_id: <code>${chatId}</code>\n${allowed}`);
  }

  if (!ALLOWED.includes(chatId)) {
    return; // чужим не отвечаем и ничего не меняем
  }

  if (!text && (message.photo || message.document)) {
    return addWork(chatId, message);
  }

  if (text === '/start' || text === '/help') return tg(chatId, helpText());
  if (text === '/id') return tg(chatId, `chat_id: <code>${chatId}</code>`);
  if (text === '/list') return listAll(chatId);

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
