const FAREHARBOR_API_SRC = "https://fareharbor.com/embeds/api/v1/";

type FareHarborLightframeApi = {
  autoLightframe?: (options: { container: HTMLElement }) => void;
};

declare global {
  interface Window {
    FH?: FareHarborLightframeApi;
  }
}

let fareHarborApiPromise: Promise<FareHarborLightframeApi | null> | null = null;
const initializedLinks = new WeakSet<HTMLElement>();
const pendingLinks = new WeakMap<HTMLElement, Promise<boolean>>();

export const isFareHarborEmbedsBookingUrl = (href: string): boolean => {
  try {
    const url = new URL(href, "https://www.alloutdooradventures.com");
    return (
      (url.hostname === "fareharbor.com" ||
        url.hostname.endsWith(".fareharbor.com")) &&
      url.pathname.startsWith("/embeds/book/")
    );
  } catch {
    return false;
  }
};

const loadFareHarborApi = (): Promise<FareHarborLightframeApi | null> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  if (window.FH?.autoLightframe) {
    return Promise.resolve(window.FH);
  }

  if (fareHarborApiPromise) return fareHarborApiPromise;

  fareHarborApiPromise = new Promise(resolve => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${FAREHARBOR_API_SRC}"]`
    );
    const script = existingScript ?? document.createElement("script");
    let settled = false;

    const finish = (api: FareHarborLightframeApi | null) => {
      if (settled) return;
      settled = true;
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (!api && !existingScript) script.remove();
      if (!api) fareHarborApiPromise = null;
      resolve(api);
    };
    const onLoad = () => finish(window.FH?.autoLightframe ? window.FH : null);
    const onError = () => finish(null);

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existingScript) {
      script.src = FAREHARBOR_API_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return fareHarborApiPromise;
};

/**
 * Load FareHarbor's own Lightframe API only after a customer shows intent to
 * book, then bind it only to this exact affiliate booking link. The untouched
 * link remains the native booking fallback if the API cannot load or open.
 */
export const prepareFareHarborLightframe = (
  link: HTMLAnchorElement
): Promise<boolean> => {
  if (!isFareHarborEmbedsBookingUrl(link.href)) return Promise.resolve(false);
  if (initializedLinks.has(link)) return Promise.resolve(true);

  const pending = pendingLinks.get(link);
  if (pending) return pending;

  const preparation = loadFareHarborApi()
    .then(api => {
      if (!api?.autoLightframe || !link.isConnected) return false;
      if (!initializedLinks.has(link)) {
        api.autoLightframe({ container: link });
        initializedLinks.add(link);
      }
      return true;
    })
    .catch(() => false)
    .finally(() => pendingLinks.delete(link));

  pendingLinks.set(link, preparation);
  return preparation;
};
