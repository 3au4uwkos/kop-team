// ================================================================
// site.ts — единственный источник правды по контактам, адресу и
// реквизитам. Отсюда собираются JSON-LD в Base.astro, футер,
// страница /contacts/ и секция контактов на главной.
//
// Поля со значением `null` считаются «ещё не полученными от владельца»
// и молча выпадают из разметки — JSON-LD остаётся валидным.
// ================================================================

export const SITE_URL = 'https://kopeykin-sambo.ru';
export const CITY = 'Тула';
export const COACH_NAME = 'Копейкин Павел Сергеевич';
export const COACH_NAME_SHORT = 'Копейкин П. С.';
/** Клуб тренера — эмблема Kop.team в шапке, футере и OG. */
export const BRAND = 'Kop.team';

/** Телефон в формате E.164 — из ссылки WhatsApp. */
export const PHONE = '+79056295471';
export const PHONE_HUMAN = '+7 (905) 629-54-71';

export interface SocialLink {
    name: string;
    href: string;
    handle: string;
    /** Требует сноски о признании Meta экстремистской организацией. */
    metaMarked?: boolean;
    /** Включать ли ссылку в sameAs JSON-LD. */
    sameAs?: boolean;
}

export const SOCIALS: SocialLink[] = [
    {
        name: 'Telegram',
        href: 'https://t.me/kopeikin_pavel',
        handle: '@kopeikin_pavel',
        sameAs: true,
    },
    {
        name: 'WhatsApp',
        href: 'https://wa.me/79056295471',
        handle: PHONE_HUMAN,
        sameAs: false, // wa.me — не профиль, в sameAs не место
    },
    {
        name: 'VK',
        href: 'https://vk.com/id142009977',
        handle: 'Павел Копейкин',
        sameAs: true,
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/pavel_kopeikin/',
        handle: '@pavel_kopeikin',
        metaMarked: true,
        sameAs: true,
    },
];

export const META_FOOTNOTE =
    '*Принадлежит Meta Platforms Inc., признанной экстремистской организацией; ' +
    'её деятельность запрещена на территории РФ.';

// ----------------------------------------------------------------
// Адрес зала.
// TODO(владелец): улица, дом и индекс тренировочного зала.
// Пока streetAddress/postalCode = null — в PostalAddress уходит только город.
// ----------------------------------------------------------------
export const ADDRESS = {
    streetAddress: null as string | null,
    postalCode: null as string | null,
    addressLocality: CITY,
    addressRegion: 'Тульская область',
    addressCountry: 'RU',
};

// TODO(владелец): координаты зала (Яндекс.Карты → «Что здесь?» → широта/долгота).
// Координаты города не подставляем: неверная точка на карте хуже её отсутствия.
export const GEO: { latitude: number; longitude: number } | null = null;

/**
 * Расписание групп — по афише набора 2026 года (VK, 23.08.2026).
 * Групповая тренировка — полтора часа, индивидуальная — час.
 * TODO(владелец): время старшей группы в «Тула Арене» и утренней зарядки.
 */
export const OPENING_HOURS = [
    // Дети 6–10 лет, группа начальной подготовки.
    { dayOfWeek: ['Tuesday', 'Thursday'], opens: '15:00', closes: '16:30' },
    // Начальная подготовка, второй год.
    { dayOfWeek: ['Monday', 'Wednesday', 'Friday'], opens: '15:00', closes: '16:30' },
    // Боевое самбо, 16–18 лет и 18+, С/К «Динамо».
    { dayOfWeek: ['Wednesday', 'Friday'], opens: '19:30', closes: '21:00' },
];

// ----------------------------------------------------------------
// Где проходят тренировки — со слов тренера (голосовое от 23.08.2026):
// боевое самбо осталось в «Динамо», детские группы переехали в Академию
// единоборств на ул. Демонстрации, 5А, старшая группа — в «Тула Арене».
// Адреса — по 2ГИС, Яндекс.Картам и сайту «Динамо» (dynamo71.ru).
// ----------------------------------------------------------------
export interface Venue {
    name: string;
    address: string | null;
    groups: string[];
}

/** Поиск зала на Яндекс.Картах: без встраивания карты и без скриптов. */
export const venueMapUrl = (v: Venue) =>
    `https://yandex.ru/maps/15/tula/?text=${encodeURIComponent(`${v.name}, Тула, ${v.address ?? ''}`)}`;

export const VENUES: Venue[] = [
    {
        name: 'Академия единоборств',
        address: 'ул. Демонстрации, 5А',
        groups: [
            'Дети 6–10 лет, начальная подготовка — вт, чт 15:00–16:30',
            'Начальная подготовка, 2-й год — пн, ср, пт 15:00–16:30',
        ],
    },
    {
        name: 'С/К «Динамо»',
        address: 'ул. Жаворонкова, ЦПКиО им. П. П. Белоусова, стр. 1',
        groups: ['Боевое самбо, 16–18 лет и 18+ — ср, пт 19:30–21:00'],
    },
    {
        name: '«Тула Арена»',
        address: 'Калужское шоссе, 18',
        groups: ['Старшая группа по самбо — расписание в личных сообщениях'],
    },
];

/** Диапазон цен для SportsActivityLocation. Стоимость обсуждается лично. */
export const PRICE_RANGE = '₽₽';

// ----------------------------------------------------------------
// Реквизиты исполнителя (задача 3.3).
// TODO(владелец): налоговый статус (самозанятый / ИП), ИНН, для ИП — ОГРНИП.
// Блок в футере и на /contacts/ отрисуется автоматически, как только
// поля перестанут быть null.
// ----------------------------------------------------------------
export interface Requisites {
    fullName: string;
    /** 'self-employed' — самозанятый (НПД), 'ip' — индивидуальный предприниматель */
    status: 'self-employed' | 'ip' | null;
    inn: string | null;
    ogrnip: string | null;
}

export const REQUISITES: Requisites = {
    fullName: COACH_NAME,
    status: null,
    inn: null,
    ogrnip: null,
};

export const REQUISITES_READY =
    REQUISITES.status !== null && REQUISITES.inn !== null;

export const STATUS_LABEL: Record<'self-employed' | 'ip', string> = {
    'self-employed': 'Самозанятый (плательщик НПД)',
    ip: 'Индивидуальный предприниматель',
};

/** Год для копирайта — фиксируем при сборке, чтобы не плодить пересборки. */
export const YEAR = 2026;

/** Ссылки служебных страниц для футера. */
export const FOOTER_LINKS = [
    { href: '/faq/', label: 'Вопросы и ответы' },
    { href: '/contacts/', label: 'Контакты' },
    { href: '/privacy/', label: 'Конфиденциальность' },
    { href: '/terms/', label: 'Условия использования' },
];

/** Пункты навигации главной (якоря). */
export const NAV_LINKS = [
    { href: '#legends', label: 'Легенды', desktop: true },
    { href: '#season', label: 'Турниры', desktop: false },
    { href: '#directions', label: 'Направления', desktop: true },
    { href: '#combat', label: 'Боевое самбо', desktop: true },
    { href: '#sambo', label: 'Самбо', desktop: true },
    { href: '#striking', label: 'Ударка', desktop: true },
    { href: '#morning', label: 'Утренняя зарядка', desktop: false },
    { href: '#fp-kids', label: 'ОФП 4–6 лет', desktop: false },
    { href: '#youth', label: 'Сборы', desktop: true },
    { href: '#merch', label: 'Мерч', desktop: true },
    { href: '#contacts', label: 'Контакты', desktop: false },
];
