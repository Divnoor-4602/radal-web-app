"use client";

import { useEffect, useState } from "react";
import useFlowStore from "@/lib/stores/flowStore";

type HydrationProviderProps = {
  children: React.ReactNode;
};

/**
 * Provider component that ensures Zustand stores are properly hydrated
 * before rendering children. This prevents hydration mismatches in Next.js.
 */
export default function HydrationProvider({
  children,
}: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // Set up hydration listeners for flowStore
      const unsubFlowHydrate = useFlowStore.persist.onHydrate(() => {
        console.log("🔄 Flow store hydration started");
      });

      const unsubFlowFinishHydration = useFlowStore.persist.onFinishHydration(
        () => {
          console.log("✅ Flow store hydration completed");
          setIsHydrated(true);
        },
      );

      // Check if already hydrated
      if (useFlowStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        // Manually trigger rehydration
        useFlowStore.persist.rehydrate();
      }

      return () => {
        unsubFlowHydrate();
        unsubFlowFinishHydration();
      };
    }
  }, []);

  // On server side or before hydration, render a loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Initializing application...</div>
      </div>
    );
  }

  return <>{children}</>;
}
