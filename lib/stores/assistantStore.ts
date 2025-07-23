import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export type AssistantState = {
  // UI State
  isOpen: boolean;
  previousSidebarState: boolean;

  // Actions
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;

  setPreviousSidebarState: (state: boolean) => void;
};

const useAssistantStore = createWithEqualityFn<AssistantState>(
  (set, get) => ({
    // Initial state
    isOpen: false,
    previousSidebarState: true, // Assume sidebar was open initially

    // Actions
    openAssistant: () => {
      set({ isOpen: true });
    },

    closeAssistant: () => {
      set({ isOpen: false });
    },

    toggleAssistant: () => {
      const { isOpen } = get();
      set({ isOpen: !isOpen });
    },

    setPreviousSidebarState: (state: boolean) => {
      set({ previousSidebarState: state });
    },
  }),
  shallow,
);

export default useAssistantStore;
