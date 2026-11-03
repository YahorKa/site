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
  { label: 'О студии', href: '/about' },
  { label: 'Занятия', href: '/services' },
  { label: 'Галерея', href: '/gallery' },
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

export const gallery: GalleryItem[] = [
  {
    src: '/gallery/works/lisenok-zont.jpg',
    alt: 'Лисёнок под зонтом — работа ученика изостудии Izo Studio в Жодино',
  },
  {
    src: '/gallery/works/prividenie-mella.jpg',
    alt: 'Привидение на метле — работа ученика изостудии Izo Studio в Жодино',
  },
  {
    src: '/gallery/works/sova-pismo.jpg',
    alt: 'Сова с письмом — работа ученика изостудии Izo Studio в Жодино',
  },
  { src: '/gallery/preview1.jpg', href: 'https://www.instagram.com/p/DNyCnjM0Nwv/', alt: 'Работа ученика изостудии Izo Studio — живопись' },
  { src: '/gallery/preview2.jpg', href: 'https://www.instagram.com/izo_studia_zhodino/p/DNsaTHzULTI/', alt: 'Работа ученика изостудии Izo Studio — натюрморт' },
  { src: '/gallery/preview3.jpg', href: 'https://www.instagram.com/izo_studia_zhodino/p/DN5R6IrCN51/', alt: 'Работа ученика изостудии Izo Studio — графика' },
  { src: '/gallery/preview4.jpg', href: 'https://www.instagram.com/p/DNU7DyIonZe/', alt: 'Работа ученика изостудии Izo Studio — пейзаж' },
  { src: '/gallery/preview5.jpg', href: 'https://www.instagram.com/p/DNTVXOOIzdL/', alt: 'Работа ученика изостудии Izo Studio — портрет' },
  { src: '/gallery/preview6.jpg', href: 'https://www.instagram.com/p/DNTkhcNOnzM/', alt: 'Работа ученика изостудии Izo Studio — композиция' },
  { src: '/gallery/preview7.jpg', href: 'https://www.instagram.com/p/DNlcNAOoDTY/', alt: 'Работа ученика изостудии Izo Studio — акварель' },
  { src: '/gallery/preview8.jpg', href: 'https://www.instagram.com/p/DN5Rf2lCCk6/', alt: 'Работа ученика изостудии Izo Studio — пастель' },
  { src: '/gallery/preview9.jpg', href: 'https://www.instagram.com/p/DRm_EplCKyh/', alt: 'Работа ученика изостудии Izo Studio — масло' },
  { src: '/gallery/preview10.webp', href: 'https://www.instagram.com/p/DRPZ5LEiEx5/', alt: 'Работа ученика изостудии Izo Studio — этюд' },
  { src: '/gallery/preview11.webp', href: 'https://www.instagram.com/p/DRhE-vJCA_7/', alt: 'Работа ученика изостудии Izo Studio — рисунок' },
  { src: '/gallery/preview12.webp', href: 'https://www.instagram.com/p/DRPZsgXiDJT/', alt: 'Работа ученика изостудии Izo Studio — набросок' },
];

export const schedule = [
  { days: 'Понедельник, среда', time: '09:30–10:15' },
  { days: 'Понедельник, вторник', time: '16:45–17:30' },
];

export const prices = [
  { title: 'Групповые занятия', detail: 'Абонемент на 8 занятий', price: '100 руб' },
  { title: 'Индивидуальное занятие', detail: '45 минут', price: '20 руб' },
];

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
