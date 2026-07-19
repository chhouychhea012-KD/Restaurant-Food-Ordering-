import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import translations from '@/i18n/translations.json';

export type LocaleCode = 'en' | 'km';

interface LanguageOption {
  code: LocaleCode;
  name: string;
  nativeName: string;
  flag: string;
  flagUrl?: string;
}

type PhraseMap = Record<string, Record<LocaleCode, string>>;

const STORAGE_KEY = 'flavor-fleet-language';
const languages = translations.languages as LanguageOption[];
const phrases = translations.phrases as PhraseMap;
const fallbackLocale: LocaleCode = 'en';

function isLocale(value: string | null): value is LocaleCode {
  return languages.some((language) => language.code === value);
}

function getInitialLocale(): LocaleCode {
  if (typeof window === 'undefined') {
    return fallbackLocale;
  }

  const storedLocale = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(storedLocale) ? storedLocale : fallbackLocale;
}

const locale = ref<LocaleCode>(getInitialLocale());

function normalizePhrase(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyLocaleSideEffects(code: LocaleCode) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, code);
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = code === 'km' ? 'km' : 'en';
  }
}

function translateKnownSegments(value: string) {
  if (locale.value === fallbackLocale) {
    return value;
  }

  let translated = normalizePhrase(value);
  let changed = false;

  Object.entries(phrases)
    .filter(([source]) => source.length >= 3 && !/[{}$]/.test(source))
    .sort(([left], [right]) => right.length - left.length)
    .forEach(([source, phrase]) => {
      const replacement = phrase[locale.value] ?? phrase[fallbackLocale];
      if (!replacement || replacement === source) {
        return;
      }

      const next = translated.replace(new RegExp(escapeRegExp(source), 'gi'), replacement);
      if (next !== translated) {
        translated = next;
        changed = true;
      }
    });

  return changed ? translated : value;
}

export function translateText(value: string, explicitFallback = value) {
  const normalized = normalizePhrase(value);

  if (!normalized) {
    return value;
  }

  const phrase = phrases[normalized];
  if (phrase) {
    return phrase[locale.value] ?? phrase[fallbackLocale] ?? explicitFallback;
  }

  return translateKnownSegments(value);
}

export function useI18n() {
  const currentLanguage = computed(() => languages.find((language) => language.code === locale.value) ?? languages[0]);

  function setLocale(code: LocaleCode) {
    if (!isLocale(code)) {
      return;
    }

    locale.value = code;
    applyLocaleSideEffects(code);
  }

  return {
    currentLanguage,
    languages,
    locale,
    setLocale,
    t: translateText,
  };
}

export function useAutoTranslate(root: Ref<HTMLElement | null>) {
  const originalText = new WeakMap<Text, string>();
  const originalAttributes = new WeakMap<Element, Map<string, string>>();
  const translatableAttributes = ['aria-label', 'title', 'placeholder', 'alt'];
  let observer: MutationObserver | null = null;
  let isApplying = false;

  function shouldSkipElement(element: Element | null) {
    return Boolean(element?.closest('[data-i18n-ignore]'));
  }

  function translateElementAttributes(element: Element) {
    if (shouldSkipElement(element)) {
      return;
    }

    let attributes = originalAttributes.get(element);
    if (!attributes) {
      attributes = new Map<string, string>();
      originalAttributes.set(element, attributes);
    }

    translatableAttributes.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) {
        return;
      }

      if (!attributes.has(attribute)) {
        attributes.set(attribute, element.getAttribute(attribute) ?? '');
      }

      const original = attributes.get(attribute) ?? '';
      const translated = translateText(original);
      if (element.getAttribute(attribute) !== translated) {
        element.setAttribute(attribute, translated);
      }
    });
  }

  function translateTextNode(node: Text) {
    const parent = node.parentElement;
    if (!parent || shouldSkipElement(parent) || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) {
      return;
    }

    if (!originalText.has(node)) {
      originalText.set(node, node.data);
    }

    const original = originalText.get(node) ?? node.data;
    const leadingSpace = original.match(/^\s*/)?.[0] ?? '';
    const trailingSpace = original.match(/\s*$/)?.[0] ?? '';
    const translated = translateText(original);
    const nextValue = translated === original ? original : `${leadingSpace}${translated}${trailingSpace}`;

    if (node.data !== nextValue) {
      node.data = nextValue;
    }
  }

  function applyTranslations() {
    const rootElement = root.value;
    if (!rootElement) {
      return;
    }

    isApplying = true;

    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      translateTextNode(node as Text);
      node = walker.nextNode();
    }

    rootElement.querySelectorAll('*').forEach(translateElementAttributes);
    isApplying = false;
  }

  function scheduleTranslations() {
    if (isApplying) {
      return;
    }

    void nextTick(applyTranslations);
  }

  onMounted(() => {
    applyLocaleSideEffects(locale.value);
    applyTranslations();

    if (!root.value) {
      return;
    }

    observer = new MutationObserver(scheduleTranslations);
    observer.observe(root.value, {
      attributes: true,
      attributeFilter: translatableAttributes,
      characterData: true,
      childList: true,
      subtree: true,
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  watch(locale, scheduleTranslations);

  return {
    refreshTranslations: applyTranslations,
  };
}