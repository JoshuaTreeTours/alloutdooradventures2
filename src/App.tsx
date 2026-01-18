import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";

import Header from "./components/Header";
import ScrollToTopOnRouteChange from "./components/ScrollToTopOnRouteChange";
import Home from "./pages/Home";
import StateLandingRoute from "./pages/destinations/StateLandingRoute";
import StateRoute from "./pages/destinations/states/StateRoute";
import CityRoute from "./pages/destinations/states/CityRoute";
import CityToursIndexRoute from "./pages/destinations/states/tours/CityToursIndexRoute";
import CityTourDetailRoute from "./pages/destinations/states/tours/CityTourDetailRoute";
import CityTourBookingRoute from "./pages/destinations/states/tours/CityTourBookingRoute";
import StateToursRoute from "./pages/destinations/states/tours/StateToursRoute";
import ToursCatalog from "./pages/ToursCatalog";
import DayAdventuresTours from "./pages/tours/activities/DayAdventuresTours";
import DetoursTours from "./pages/tours/activities/DetoursTours";
import MultiDayTours from "./pages/tours/activities/MultiDayTours";
import TourDetail from "./pages/tours/TourDetail";
import ActivityStateTours from "./pages/tours/ActivityStateTours";
import FlagstaffTourDetailRoute from "./pages/tours/FlagstaffTourDetailRoute";
import FlagstaffTourBookingRoute from "./pages/tours/FlagstaffTourBookingRoute";

const DestinationsIndex = lazy(
  () => import("./pages/destinations/DestinationsIndex"),
);
const EuropeCountryRoute = lazy(
  () => import("./pages/destinations/europe/EuropeCountryRoute"),
);
const ToursIndex = lazy(() => import("./pages/ToursIndex"));
const CyclingTours = lazy(() => import("./pages/tours/activities/CyclingTours"));
const HikingTours = lazy(() => import("./pages/tours/activities/HikingTours"));
const CanoeingTours = lazy(
  () => import("./pages/tours/activities/CanoeingTours"),
);

export default function App() {
  return (
    <>
      <Header />
      <ScrollToTopOnRouteChange />
      <Suspense
        fallback={
          <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
            <p className="text-sm text-[#405040]">Loading tours…</p>
          </main>
        }
      >
        <Switch>
          <Route path="/" component={Home} />

          <Route path="/destinations" component={DestinationsIndex} />
          <Route
            path="/destinations/europe/:countrySlug/tours"
            component={EuropeCountryRoute}
          />
          <Route
            path="/destinations/europe/:countrySlug/:categorySlug"
            component={EuropeCountryRoute}
          />
          <Route
            path="/destinations/europe/:countrySlug"
            component={EuropeCountryRoute}
          />

          <Route
            path="/destinations/states/:stateSlug/cities/:citySlug/tours/:tourSlug/book"
            component={CityTourBookingRoute}
          />
          <Route
            path="/destinations/states/:stateSlug/cities/:citySlug/tours/:tourSlug"
            component={CityTourDetailRoute}
          />
          <Route
            path="/destinations/states/:stateSlug/cities/:citySlug/tours"
            component={CityToursIndexRoute}
          />
          <Route
            path="/destinations/states/:stateSlug/tours"
            component={StateToursRoute}
          />
          <Route
            path="/destinations/:stateSlug/:citySlug/tours/:tourSlug/book"
            component={CityTourBookingRoute}
          />
          <Route
            path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"
            component={CityTourDetailRoute}
          />
          <Route
            path="/destinations/:stateSlug/:citySlug/tours"
            component={CityToursIndexRoute}
          />
          <Route
            path="/destinations/states/:stateSlug/cities/:citySlug"
            component={CityRoute}
          />
          <Route path="/destinations/states/:stateSlug" component={StateRoute} />
          <Route
            path="/destinations/:stateSlug"
            component={StateLandingRoute}
          />

          <Route path="/tours" component={ToursIndex} />
          <Route path="/tours/catalog" component={ToursCatalog} />
          <Route path="/tours/cycling" component={CyclingTours} />
          <Route path="/tours/hiking" component={HikingTours} />
          <Route path="/tours/canoeing" component={CanoeingTours} />
          <Route
            path="/tours/:activitySlug/us/:stateSlug"
            component={ActivityStateTours}
          />
          <Route path="/tours/activities/cycling" component={CyclingTours} />
          <Route
            path="/tours/activities/day-adventures"
            component={DayAdventuresTours}
          />
          <Route path="/tours/activities/detours" component={DetoursTours} />
          <Route path="/tours/activities/hiking" component={HikingTours} />
          <Route path="/tours/activities/multi-day" component={MultiDayTours} />
          <Route
            path="/tours/activities/canoeing"
            component={CanoeingTours}
          />
          <Route
            path="/tours/:tourSlug/book"
            component={FlagstaffTourBookingRoute}
          />
          <Route
            path="/tours/:tourSlug"
            component={FlagstaffTourDetailRoute}
          />
          <Route
            path="/tours/:stateSlug/:citySlug/:slug"
            component={TourDetail}
          />

          <Route>Not Found</Route>
        </Switch>
      </Suspense>
    </>
  );
}
