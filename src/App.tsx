import { Route, Switch } from "wouter";

import Header from "./components/Header";
import ScrollToTopOnRouteChange from "./components/ScrollToTopOnRouteChange";
import Home from "./pages/Home";
import DestinationsIndex from "./pages/destinations/DestinationsIndex";
import StateRoute from "./pages/destinations/states/StateRoute";
import CityRoute from "./pages/destinations/states/CityRoute";
import ToursIndex from "./pages/ToursIndex";
import ToursCatalog from "./pages/ToursCatalog";
import CyclingTours from "./pages/tours/activities/CyclingTours";
import DayAdventuresTours from "./pages/tours/activities/DayAdventuresTours";
import DetoursTours from "./pages/tours/activities/DetoursTours";
import HikingTours from "./pages/tours/activities/HikingTours";
import MultiDayTours from "./pages/tours/activities/MultiDayTours";

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
        <Route path="/tours/catalog" component={ToursCatalog} />
        <Route path="/tours/activities/cycling" component={CyclingTours} />
        <Route
          path="/tours/activities/day-adventures"
          component={DayAdventuresTours}
        />
        <Route path="/tours/activities/detours" component={DetoursTours} />
        <Route path="/tours/activities/hiking" component={HikingTours} />
        <Route path="/tours/activities/multi-day" component={MultiDayTours} />

        <Route>Not Found</Route>
      </Switch>
    </>
  );
}
