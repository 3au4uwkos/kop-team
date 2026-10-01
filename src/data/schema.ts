// ================================================================
// schema.ts — сборка JSON-LD из данных site.ts.
// Пустые (null) поля не попадают в разметку: лучше отсутствие
// свойства, чем выдуманное значение.
// ================================================================
import {
    SITE_URL, CITY, COACH_NAME, BRAND, PHONE,
    ADDRESS, GEO, OPENING_HOURS, PRICE_RANGE, SOCIALS, VENUES,
} from './site';

const COACH_ID = `${SITE_URL}/#coach`;
const PLACE_ID = `${SITE_URL}/#gym`;

function postalAddress() {
    const a: Record<string, unknown> = {
        '@type': 'PostalAddress',
        addressLocality: ADDRESS.addressLocality,
        addressRegion: ADDRESS.addressRegion,
        addressCountry: ADDRESS.addressCountry,
    };
    if (ADDRESS.streetAddress) a.streetAddress = ADDRESS.streetAddress;
    if (ADDRESS.postalCode) a.postalCode = ADDRESS.postalCode;
    return a;
}

export function personSchema() {
    return {
        '@type': 'Person',
        '@id': COACH_ID,
        name: COACH_NAME,
        jobTitle: 'Тренер по самбо',
        description:
            'Мастер спорта России по самбо, рукопашному бою и боевому самбо, ' +
            'тренер высшей категории по борьбе самбо. Тренерский стаж более 18 лет.',
        url: `${SITE_URL}/`,
        telephone: PHONE,
        address: postalAddress(),
        knowsLanguage: 'ru',
        // Связь тренер → зал. Обратное coach у SportsActivityLocation
        // schema.org не допускает (только у SportsTeam), areaServed у
        // Person — тоже: город и так есть в address.
        workLocation: { '@id': PLACE_ID },
        sameAs: SOCIALS.filter((s) => s.sameAs).map((s) => s.href),
    };
}

export function locationSchema() {
    const node: Record<string, unknown> = {
        '@type': 'SportsActivityLocation',
        '@id': PLACE_ID,
        name: `${BRAND} — тренировочный зал`,
        description:
            'Тренировки по самбо, боевому самбо и ударной технике в Туле: ' +
            'группы и персональные занятия для детей, подростков и взрослых.',
        url: `${SITE_URL}/`,
        // sport у SportsActivityLocation schema.org не допускает (только у
        // SportsEvent/SportsOrganization) — вид спорта назван в description.
        telephone: PHONE,
        priceRange: PRICE_RANGE,
        currenciesAccepted: 'RUB',
        address: postalAddress(),
        areaServed: { '@type': 'City', name: CITY },
        openingHoursSpecification: OPENING_HOURS.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.dayOfWeek.map((d) => `https://schema.org/${d}`),
            opens: h.opens,
            closes: h.closes,
        })),
        sameAs: SOCIALS.filter((s) => s.sameAs).map((s) => s.href),
    };
    // Залы, где идут группы: у каждого — своё место в разметке.
    node.containsPlace = VENUES.map((v) => ({
        '@type': 'SportsActivityLocation',
        name: v.name,
        address: v.address
            ? { ...postalAddress(), streetAddress: v.address }
            : postalAddress(),
    }));
    // TODO(владелец): координаты зала — см. GEO в site.ts.
    if (GEO) {
        node.geo = { '@type': 'GeoCoordinates', latitude: GEO.latitude, longitude: GEO.longitude };
    }
    return node;
}

export interface Direction {
    name: string;
    description: string;
}

export function exercisePlanSchemas(directions: Direction[]) {
    return directions.map((d) => ({
        '@type': 'ExercisePlan',
        name: d.name,
        description: d.description,
        exerciseType: 'Martial arts',
        provider: { '@id': COACH_ID },
    }));
}

export interface Crumb {
    name: string;
    /** Путь от корня, например '/faq/'. */
    path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: `${SITE_URL}${c.path}`,
        })),
    };
}

export interface QA {
    q: string;
    a: string;
}

export function faqSchema(items: QA[]) {
    return {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/faq/#faq`,
        mainEntity: items.map((it) => ({
            '@type': 'Question',
            name: it.q,
            acceptedAnswer: { '@type': 'Answer', text: it.a },
        })),
    };
}

export function webSiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: BRAND,
        inLanguage: 'ru-RU',
        publisher: { '@id': COACH_ID },
    };
}
