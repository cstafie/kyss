import { useContext } from "react";

// this is a helper which should be used by all custom context hooks
export const createSafeUseContext = <T>(
  context: React.Context<T>,
  hookName: string
) => {
  return () => {
    const ctx = useContext(context);
    if (!ctx) {
      throw new Error(
        `${hookName} must be used within a ${context.displayName}Provider`
      );
    }
    return ctx;
  };
};
