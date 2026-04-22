import { Toaster } from "sonner";
import { useTheme } from "../theme/useTheme.js";

export default function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast: "app-toast",
        },
      }}
    />
  );
}
