import { Route, Switch } from "wouter";

import Header from "./components/Header";
import ScrollToTopOnRouteChange from "./components/ScrollToTopOnRouteChange";
import Home from "./pages/Home";
import DestinationsIndex from "./pages/destinations/DestinationsIndex";
import EuropeCountryRoute from "./pages/destinations/europe/EuropeCountryRoute";
import StateLandingRoute from "./pages/destinations/StateLandingRoute";
import StateRoute from "./pages/destinations/states/StateRoute";
import CityRoute from "./pages/destinations/states/CityRoute";
import CityToursIndexRoute from "./pages/destinations/states/tours/CityToursIndexRoute";
import CityTourDetailRoute from "./pages/destinations/states/tours/CityTourDetailRoute";
import CityTourBookingRoute from "./pages/destinations/states/tours/CityTourBookingRoute";
import StateToursRoute from "./pages/destinations/states/tours/StateToursRoute";
import ToursIndex from "./pages/ToursIndex";
import ToursCatalog from "./pages/ToursCatalog";
import CyclingTours from "./pages/tours/activities/CyclingTours";
import DayAdventuresTours from "./pages/tours/activities/DayAdventuresTours";
import DetoursTours from "./pages/tours/activities/DetoursTours";
import HikingTours from "./pages/tours/activities/HikingTours";
import MultiDayTours from "./pages/tours/activities/MultiDayTours";
import CanoeingTours from "./pages/tours/activities/CanoeingTours";
import TourDetail from "./pages/tours/TourDetail";
import ActivityStateTours from "./pages/tours/ActivityStateTours";
import FlagstaffTourDetailRoute from "./pages/tours/FlagstaffTourDetailRoute";
import FlagstaffTourBookingRoute from "./pages/tours/FlagstaffTourBookingRoute";

export default function App() {
  return (
    <>
      <Header />
      <ScrollToTopOnRouteChange />
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
        <Route path="/destinations/:stateSlug" component={StateLandingRoute} />

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
    </>
  );
}
