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
export const BRAND = 'Копейкин Самбо';

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
 * Расписание. Точное время — в личных сообщениях (решение владельца),
 * поэтому в openingHours только достоверно известные слоты.
 * TODO(владелец): подтвердить/дополнить часы работы зала.
 */
export const OPENING_HOURS = [
    // Открытая утренняя зарядка в ЦПКиО им. Белоусова — вторник.
    { dayOfWeek: ['Tuesday'], opens: '08:00', closes: '09:00' },
    // Группа выходного дня по боевому самбо.
    { dayOfWeek: ['Saturday', 'Sunday'], opens: '10:00', closes: '18:00' },
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
    { href: '#directions', label: 'Направления', desktop: true },
    { href: '#combat', label: 'Боевое самбо', desktop: true },
    { href: '#sambo', label: 'Самбо', desktop: true },
    { href: '#striking', label: 'Ударка', desktop: true },
    { href: '#morning', label: 'Утренняя зарядка', desktop: false },
    { href: '#fp-kids', label: 'ОФП 4–6 лет', desktop: false },
    { href: '#youth', label: 'Подростки', desktop: true },
    { href: '#merch', label: 'Мерч', desktop: true },
    { href: '#contacts', label: 'Контакты', desktop: false },
];
