import { useEffect } from "react";

type RouteRedirectProps = {
  to: string;
};

export default function RouteRedirect({ to }: RouteRedirectProps) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return null;
}
