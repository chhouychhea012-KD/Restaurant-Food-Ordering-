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

if (typeof window !== 'undefined') {
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
  const canInstall = computed(() => Boolean(installPrompt.value && !isInstalled.value));

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
  }

  return {
    canInstall,
    dismissInstallPrompt,
    installApp,
    isInstalled,
  };
}
