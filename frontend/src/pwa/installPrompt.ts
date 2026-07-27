import { computed, ref } from 'vue';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(
  typeof window !== 'undefined'
    && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true),
);
const isIos = ref(false);
const isSafari = ref(false);
const iosPromptDismissed = ref(false);

if (typeof window !== 'undefined') {
  const userAgent = window.navigator.userAgent;
  isIos.value = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  isSafari.value = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(userAgent);
  iosPromptDismissed.value = window.localStorage.getItem('golden-land-ios-install-dismissed') === 'true';

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt.value = event as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    isInstalled.value = true;
    installPrompt.value = null;
  });
}

export function useInstallPrompt() {
  const canNativeInstall = computed(() => Boolean(installPrompt.value && !isInstalled.value));
  const canInstallIos = computed(() => Boolean(isIos.value && isSafari.value && !isInstalled.value && !iosPromptDismissed.value));
  const canInstall = computed(() => canNativeInstall.value || canInstallIos.value);

  async function installApp() {
    const promptEvent = installPrompt.value;
    if (!promptEvent) return false;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      installPrompt.value = null;
      isInstalled.value = true;
      return true;
    }
    return false;
  }

  function dismissInstallPrompt() {
    installPrompt.value = null;
    if (canInstallIos.value) {
      iosPromptDismissed.value = true;
      window.localStorage.setItem('golden-land-ios-install-dismissed', 'true');
    }
  }

  return {
    canInstall,
    canInstallIos,
    canNativeInstall,
    dismissInstallPrompt,
    installApp,
    isInstalled,
  };
}