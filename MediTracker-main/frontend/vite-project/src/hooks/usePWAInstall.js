import { useState, useEffect } from "react";

let globalDeferredPrompt = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    listeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    listeners.forEach((listener) => listener(null));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Check if app is currently in standalone mode
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(Boolean(isStandalone));
    };

    checkInstalled();
    window.addEventListener("resize", checkInstalled);

    const handlePromptChange = (prompt) => {
      setDeferredPrompt(prompt);
    };

    listeners.add(handlePromptChange);

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setModalOpen(false);
    };

    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("resize", checkInstalled);
      window.removeEventListener("appinstalled", onAppInstalled);
      listeners.delete(handlePromptChange);
    };
  }, []);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());

  const isAndroid =
    typeof navigator !== "undefined" &&
    /android/i.test(navigator.userAgent.toLowerCase());

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        globalDeferredPrompt = null;
      }
      return choiceResult;
    } else {
      // Show instructional modal if direct browser prompt is unavailable (e.g. iOS or manual)
      setModalOpen(true);
      return null;
    }
  };

  return {
    isInstallable: Boolean(deferredPrompt) || isIOS,
    isInstalled,
    isIOS,
    isAndroid,
    deferredPrompt,
    promptInstall,
    modalOpen,
    setModalOpen,
  };
}
