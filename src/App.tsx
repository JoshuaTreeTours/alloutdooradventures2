import { Route, Switch } from "wouter";

import Home from "./pages/Home";
import DestinationsIndex from "./pages/destinations/DestinationsIndex";
import California from "./pages/destinations/states/California";
import Arizona from "./pages/destinations/states/Arizona";
import Nevada from "./pages/destinations/states/Nevada";
import Utah from "./pages/destinations/states/Utah";
import Oregon from "./pages/destinations/states/Oregon";
import Washington from "./pages/destinations/states/Washington";
import ToursIndex from "./pages/ToursIndex";
import { destinations } from "./data/destinations";
import type { ComponentType } from "react";

const DESTINATION_COMPONENTS: Record<string, ComponentType> = {
  california: California,
  arizona: Arizona,
  nevada: Nevada,
  utah: Utah,
  oregon: Oregon,
  washington: Washington,
};

const DESTINATION_ROUTES = destinations.map((destination) => {
  const component = DESTINATION_COMPONENTS[destination.stateSlug];

  if (!component) {
    throw new Error(
      `Missing destination route for state: ${destination.stateSlug}`,
    );
  }

  return { path: destination.href, component };
});

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/destinations" component={DestinationsIndex} />

      {DESTINATION_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} component={route.component} />
      ))}

      <Route path="/tours" component={ToursIndex} />

      <Route>Not Found</Route>
    </Switch>
  );
}
