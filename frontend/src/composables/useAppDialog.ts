import { reactive } from 'vue';

type DialogTone = 'default' | 'danger' | 'success';
type DialogMode = 'confirm' | 'prompt';

type DialogRequest = {
  mode: DialogMode;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: DialogTone;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
};

type ActiveDialog = DialogRequest & {
  id: number;
  resolve: (value: boolean | string | null) => void;
};

const state = reactive({
  active: null as ActiveDialog | null,
  inputValue: '',
});

let dialogId = 0;

function openDialog(request: DialogRequest) {
  return new Promise<boolean | string | null>((resolve) => {
    state.active = {
      ...request,
      id: dialogId += 1,
      resolve,
    };
    state.inputValue = request.inputValue ?? '';
  });
}

export function useAppDialog() {
  async function confirmDialog(options: {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: DialogTone;
  }) {
    const result = await openDialog({
      mode: 'confirm',
      title: options.title ?? 'Confirm action',
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Confirm',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      tone: options.tone ?? 'default',
    });

    return result === true;
  }

  async function promptDialog(options: {
    title?: string;
    message: string;
    inputLabel?: string;
    inputValue?: string;
    inputPlaceholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: DialogTone;
  }) {
    const result = await openDialog({
      mode: 'prompt',
      title: options.title ?? 'Add details',
      message: options.message,
      inputLabel: options.inputLabel,
      inputValue: options.inputValue,
      inputPlaceholder: options.inputPlaceholder,
      confirmLabel: options.confirmLabel ?? 'Save',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      tone: options.tone ?? 'default',
    });

    return typeof result === 'string' ? result : null;
  }

  function cancelDialog() {
    state.active?.resolve(null);
    state.active = null;
    state.inputValue = '';
  }

  function confirmActiveDialog() {
    if (!state.active) {
      return;
    }

    state.active.resolve(state.active.mode === 'prompt' ? state.inputValue : true);
    state.active = null;
    state.inputValue = '';
  }

  return {
    dialogState: state,
    confirmDialog,
    promptDialog,
    cancelDialog,
    confirmActiveDialog,
  };
}