import { Route, Switch, Link } from "wouter";
import Home from "./pages/Home";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted-foreground">
        This page is a placeholder. We’ll wire it up next.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#1f2a1f]">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/destinations">
          <Placeholder title="Destinations" />
        </Route>
        <Route path="/tours">
          <Placeholder title="Tours" />
        </Route>
        <Route path="/about">
          <Placeholder title="About" />
        </Route>
        <Route>
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h1 className="text-3xl font-semibold">404</h1>
            <p className="mt-3">
              That page doesn’t exist.{" "}
              <Link className="underline" href="/">
                Back home
              </Link>
              .
            </p>
          </div>
        </Route>
      </Switch>
    </div>
  );
}
