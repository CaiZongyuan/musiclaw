import { create } from 'zustand'

export interface ToastState {
  visible: boolean
  message: string
}

export interface ModalState {
  name: string | null
  payload?: unknown
}

interface UiStoreState {
  activeModal: ModalState
  toast: ToastState
  closeModal: () => void
  hideToast: () => void
  openModal: (name: string, payload?: unknown) => void
  showToast: (message: string) => void
}

const defaultToastState: ToastState = {
  visible: false,
  message: '',
}

const defaultModalState: ModalState = {
  name: null,
}

export const useUiStore = create<UiStoreState>()((set) => ({
  activeModal: defaultModalState,
  toast: defaultToastState,
  closeModal: () => set({ activeModal: defaultModalState }),
  hideToast: () => set({ toast: defaultToastState }),
  openModal: (name, payload) =>
    set({
      activeModal: {
        name,
        payload,
      },
    }),
  showToast: (message) =>
    set({
      toast: {
        visible: true,
        message,
      },
    }),
}))
