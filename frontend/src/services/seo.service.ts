import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';
import { appEnv } from '@/config/env';

const SITE_URL = appEnv.siteUrl.replace(/\/$/, '');
const DEFAULT_TITLE = 'Golden Land Restaurant | Cambodian Food Delivery';
const DEFAULT_DESCRIPTION = 'Order Cambodian food online from Golden Land Restaurant partners. Browse Khmer meals, save addresses, use vouchers, and track delivery across Cambodia.';
const DEFAULT_IMAGE = SITE_URL + '/image/logo.png';

const publicRouteSeo: Record<string, { title: string; description: string; keywords: string }> = {
  'customer-home': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: 'Golden Land Restaurant, Cambodian food delivery, Khmer food, Phnom Penh restaurant, online food ordering Cambodia',
  },
  'customer-about': {
    title: 'About Golden Land Restaurant | Cambodia Food Ordering',
    description: 'Learn about Golden Land Restaurant, a Cambodia-focused restaurant ordering platform for Khmer meals, delivery tracking, vouchers, and local restaurant partners.',
    keywords: 'Golden Land Restaurant about, Cambodia restaurant platform, Khmer food delivery',
  },
  restaurants: {
    title: 'Browse Cambodian Restaurants | Golden Land Restaurant',
    description: 'Browse Cambodian restaurant partners, menus, categories, delivery branches, and fresh Khmer food available through Golden Land Restaurant.',
    keywords: 'Cambodian restaurants, Khmer restaurants, food delivery Cambodia, Phnom Penh food delivery',
  },
  'customer-categories': {
    title: 'Cambodian Food Categories | Golden Land Restaurant',
    description: 'Explore Cambodian food categories including Khmer classics, rice plates, noodles, grilled dishes, seafood, drinks, and desserts.',
    keywords: 'Cambodian food categories, Khmer menu, rice plates, noodles, seafood Cambodia',
  },
  'restaurant-detail': {
    title: 'Restaurant Menu | Golden Land Restaurant',
    description: 'View restaurant menus, branch details, Cambodian dishes, prices, modifiers, and delivery options on Golden Land Restaurant.',
    keywords: 'restaurant menu Cambodia, Khmer food menu, Cambodian dishes online',
  },
};

function setTag(selector: string, create: () => HTMLMetaElement | HTMLLinkElement, update: (element: HTMLMetaElement | HTMLLinkElement) => void) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  update(element);
}

function setMeta(name: string, content: string) {
  setTag(
    'meta[name="' + name + '"]',
    () => {
      const tag = document.createElement('meta');
      tag.setAttribute('name', name);
      return tag;
    },
    (tag) => tag.setAttribute('content', content),
  );
}

function setProperty(property: string, content: string) {
  setTag(
    'meta[property="' + property + '"]',
    () => {
      const tag = document.createElement('meta');
      tag.setAttribute('property', property);
      return tag;
    },
    (tag) => tag.setAttribute('content', content),
  );
}

function setCanonical(url: string) {
  setTag(
    'link[rel="canonical"]',
    () => {
      const tag = document.createElement('link');
      tag.setAttribute('rel', 'canonical');
      return tag;
    },
    (tag) => tag.setAttribute('href', url),
  );
}

function removeStructuredData() {
  document.querySelectorAll('script[data-seo-json-ld="true"]').forEach((element) => element.remove());
}

function addStructuredData(route: RouteLocationNormalizedLoaded, canonicalUrl: string) {
  removeStructuredData();

  const data = route.name === 'customer-home'
    ? {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'Golden Land Restaurant',
        url: SITE_URL,
        logo: DEFAULT_IMAGE,
        image: DEFAULT_IMAGE,
        servesCuisine: ['Cambodian', 'Khmer', 'Asian'],
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'KH',
          addressLocality: 'Phnom Penh',
          addressRegion: 'Phnom Penh',
        },
        potentialAction: {
          '@type': 'OrderAction',
          target: SITE_URL + '/restaurants',
          deliveryMethod: 'https://schema.org/ParcelService',
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: document.title,
        url: canonicalUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Golden Land Restaurant',
          url: SITE_URL,
        },
      };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.seoJsonLd = 'true';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function humanizeSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getSeo(route: RouteLocationNormalizedLoaded) {
  const name = typeof route.name === 'string' ? route.name : '';
  const base = publicRouteSeo[name];

  if (name === 'restaurant-detail' && typeof route.params.slug === 'string') {
    const restaurantName = humanizeSlug(route.params.slug);
    return {
      title: restaurantName + ' Menu | Golden Land Restaurant',
      description: 'Order from ' + restaurantName + ' on Golden Land Restaurant. View Cambodian menu items, branch details, prices, vouchers, and delivery options.',
      keywords: restaurantName + ', Cambodian restaurant menu, Khmer food delivery, Golden Land Restaurant',
      indexable: true,
    };
  }

  if (base) {
    return { ...base, indexable: true };
  }

  return {
    title: 'Golden Land Restaurant Account',
    description: 'Protected Golden Land Restaurant workspace for orders, checkout, delivery, and account management.',
    keywords: 'Golden Land Restaurant account',
    indexable: false,
  };
}

export function updateSeo(route: RouteLocationNormalizedLoaded) {
  if (typeof document === 'undefined') return;

  const seo = getSeo(route);
  const path = route.path === '/' ? '/' : route.path.replace(/\/$/, '');
  const canonicalUrl = SITE_URL + path;

  document.title = seo.title;
  setMeta('description', seo.description);
  setMeta('keywords', seo.keywords);
  setMeta('robots', seo.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
  setMeta('author', 'Golden Land Restaurant');
  setMeta('theme-color', '#f97316');

  setCanonical(canonicalUrl);

  setProperty('og:site_name', 'Golden Land Restaurant');
  setProperty('og:type', 'website');
  setProperty('og:title', seo.title);
  setProperty('og:description', seo.description);
  setProperty('og:url', canonicalUrl);
  setProperty('og:image', DEFAULT_IMAGE);
  setProperty('og:locale', 'en_US');

  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', seo.title);
  setMeta('twitter:description', seo.description);
  setMeta('twitter:image', DEFAULT_IMAGE);

  addStructuredData(route, canonicalUrl);
}

export function installSeo(router: Router) {
  router.afterEach((route) => updateSeo(route));
  void router.isReady().then(() => updateSeo(router.currentRoute.value));
}
