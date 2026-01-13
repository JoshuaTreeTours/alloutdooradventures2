import { Route, Switch } from "wouter";

import Header from "./components/Header";
import ScrollToTopOnRouteChange from "./components/ScrollToTopOnRouteChange";
import Home from "./pages/Home";
import DestinationsIndex from "./pages/destinations/DestinationsIndex";
import StateRoute from "./pages/destinations/states/StateRoute";
import CityRoute from "./pages/destinations/states/CityRoute";
import ToursIndex from "./pages/ToursIndex";

export default function App() {
  return (
    <>
      <Header />
      <ScrollToTopOnRouteChange />
      <Switch>
        <Route path="/" component={Home} />

        <Route path="/destinations" component={DestinationsIndex} />

        <Route
          path="/destinations/states/:stateSlug/cities/:citySlug"
          component={CityRoute}
        />
        <Route path="/destinations/states/:stateSlug" component={StateRoute} />

        <Route path="/tours" component={ToursIndex} />

        <Route>Not Found</Route>
      </Switch>
    </>
  );
}
