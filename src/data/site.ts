import rawGallery from './gallery.json';
import pricesData from './prices.json';
import scheduleData from './schedule.json';

export const site = {
  name: 'Izo Studio',
  legalName: 'Изостудия Izo Studio',
  tagline: 'Изостудия в Жодино',
  url: 'https://izostudio.by',
  description:
    'Изостудия в Жодино: живопись, графика, лепка и декоративное искусство для детей и взрослых. Онлайн-запись на занятия.',
  phone: '+375 (25) 718-72-57',
  phoneHref: 'tel:+375257187257',
  address: 'г. Жодино, ул. Деревянко, 3',
  addressNote: 'Дворец культуры',
  hours: [
    { days: 'Пн–Пт', time: '10:00–19:00' },
    { days: 'Сб–Вс', time: '11:00–16:00' },
  ],
  socials: [
    { label: 'Telegram', href: 'https://t.me/nastasia1313', icon: '/icons/telegram1.svg' },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/izo_studia_zhodino/',
      icon: '/icons/insta1.svg',
    },
  ],
  mapSrc:
    'https://yandex.ru/map-widget/v1/?um=constructor%3Ae55adb7f6eb88de03fc96654ca3aec003d14c2a54cc5cfb7bc8757f08f6d2a0f&source=constructor',
};

export const nav = [
  { label: 'Главная', href: '/' },
  { label: 'Детям', href: '/detyam' },
  { label: 'Взрослым', href: '/vzroslym' },
  { label: 'Занятия', href: '/services' },
  { label: 'Галерея', href: '/gallery' },
  { label: 'О студии', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
];

export const directions = [
  {
    title: 'Живопись',
    text: 'Акварель, гуашь, масло. Учимся видеть цвет, свет и форму — от первых этюдов до законченных работ.',
  },
  {
    title: 'Графика',
    text: 'Карандаш, пастель, тушь. Постановка руки, композиция и уверенный рисунок с натуры.',
  },
  {
    title: 'Лепка',
    text: 'Скульптура и керамика: объём, материал, фактура. Занятия для тех, кому мало плоскости.',
  },
  {
    title: 'Декоративное искусство',
    text: 'Роспись, коллаж, декоративные композиции. Свобода experimentation и работа с фактурой.',
  },
];

export const services = [
  {
    title: 'Групповые занятия',
    text: 'Регулярные уроки живописи, графики, лепки и декоративного искусства для детей и взрослых. Форматы: будни и выходные.',
    meta: 'Постоянные группы',
  },
  {
    title: 'Индивидуальные занятия',
    text: 'Персональная работа с преподавателем по выбранному направлению. Подходит для подготовки к поступлению и углублённого изучения.',
    meta: 'Один на один',
  },
  {
    title: 'Мастер-классы и интенсивы',
    text: 'Краткосрочные программы — от одного дня до недели. Темы: акварель, пастель, композиция, лепка, иллюстрация.',
    meta: 'От 1 дня',
  },
  {
    title: 'Онлайн-обучение',
    text: 'Видеоуроки и живые трансляции для тех, кто не может посещать студию лично.',
    meta: 'Из любой точки',
  },
  {
    title: 'Арт-мероприятия',
    text: 'Выставки, арт-дни, пленэры и творческие встречи. Участие открыто для всех желающих.',
    meta: 'Для всех',
  },
];

export const teacher = {
  name: 'Анастасия Владимировна Кочкина',
  role: 'Художник, педагог',
  photo: '/teachers/nasta.jpeg',
  instagram: 'https://www.instagram.com/izo_studia_zhodino/',
  bio: 'Академическая живопись и графика. Более 10 лет преподавания детям и взрослым. Вдохновляет, поддерживает и помогает раскрыть потенциал каждому ученику.',
};

export type GalleryItem = {
  src: string;
  alt: string;
  href?: string;
};

type WorkItem = { type: 'work'; file: string; title: string; technique?: string };
type InstagramItem = { type: 'instagram'; src: string; href: string; alt: string; title: string };

const galleryData = rawGallery as (WorkItem | InstagramItem)[];

export const gallery: GalleryItem[] = galleryData.map((item) =>
  item.type === 'work'
    ? {
        src: `/gallery/works/${item.file}`,
        alt: `${item.title} — работа ученика изостудии Izo Studio в Жодино${item.technique ? `, ${item.technique}` : ''}`,
        caption: item.title,
      }
    : {
        src: item.src,
        href: item.href,
        alt: item.alt,
        caption: item.title,
      },
);

export const schedule = scheduleData;

export const prices = pricesData;

export const steps = [
  {
    n: '01',
    title: 'Оставляете заявку',
    text: 'Расскажите, кто и чем хочет заниматься. Мы уточним детали и ответим в течение дня.',
  },
  {
    n: '02',
    title: 'Знакомимся',
    text: 'Приходите на первое занятие: смотрим уровень, пробуем материалы, подбираем группу и время.',
  },
  {
    n: '03',
    title: 'Занимаетесь',
    text: 'Регулярные занятия по выбранному направлению. Работы показываем на выставках и в галерее студии.',
  },
];
