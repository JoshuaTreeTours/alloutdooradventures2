import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTopOnRouteChange() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (location.includes("#")) {
      const [, hash] = location.split("#");
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "auto" });
        }
      }
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}
