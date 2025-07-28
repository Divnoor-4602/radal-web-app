import { useEffect, useState } from "react";
import useFlowStore from "@/lib/stores/flowStore";

/**
 * Hook to check if the Zustand store has been hydrated from localStorage.
 * This prevents hydration mismatches in Next.js SSR.
 *
 * @returns boolean - true when the store has been hydrated
 */
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);
  const hasHydrated = useFlowStore((state) => state.hasHydrated);

  useEffect(() => {
    // Check if store has been hydrated
    if (hasHydrated) {
      setHydrated(true);
    } else {
      // Manually trigger rehydration if needed
      useFlowStore.persist.rehydrate();
    }
  }, [hasHydrated]);

  useEffect(() => {
    // Set up hydration listeners
    const unsubHydrate = useFlowStore.persist.onHydrate(() =>
      setHydrated(false),
    );
    const unsubFinishHydration = useFlowStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );

    // Check current hydration status
    setHydrated(useFlowStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
