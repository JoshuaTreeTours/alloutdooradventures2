import { Route, Switch } from "wouter";

import Header from "./components/Header";
import Footer from "./components/Footer";
import RouteRedirect from "./components/RouteRedirect";
import ScrollToTopOnRouteChange from "./components/ScrollToTopOnRouteChange";
import Home from "./pages/Home";
import DestinationsIndex from "./pages/destinations/DestinationsIndex";
import EuropeCountryRoute from "./pages/destinations/europe/EuropeCountryRoute";
import EuropeCityRoute from "./pages/destinations/europe/EuropeCityRoute";
import EuropeCityToursRoute from "./pages/destinations/europe/EuropeCityToursRoute";
import UnitedKingdomRoute from "./pages/destinations/europe/UnitedKingdomRoute";
import EuropeIndex from "./pages/destinations/europe/EuropeIndex";
import WorldCountryRoute from "./pages/destinations/world/WorldCountryRoute";
import WorldCityRoute from "./pages/destinations/world/WorldCityRoute";
import WorldCityToursRoute from "./pages/destinations/world/WorldCityToursRoute";
import StateLandingRoute from "./pages/destinations/StateLandingRoute";
import StateRoute from "./pages/destinations/states/StateRoute";
import CityRoute from "./pages/destinations/states/CityRoute";
import CityToursIndexRoute from "./pages/destinations/states/tours/CityToursIndexRoute";
import CityTourDetailRoute from "./pages/destinations/states/tours/CityTourDetailRoute";
import CityTourBookingRoute from "./pages/destinations/states/tours/CityTourBookingRoute";
import StateToursRoute from "./pages/destinations/states/tours/StateToursRoute";
import ToursIndex from "./pages/ToursIndex";
import ToursCatalog from "./pages/ToursCatalog";
import GuidesIndex from "./pages/guides/GuidesIndex";
import StateGuideRoute from "./pages/guides/StateGuideRoute";
import CityGuideUsRoute from "./pages/guides/CityGuideUsRoute";
import CountryGuideRoute from "./pages/guides/CountryGuideRoute";
import CityGuideWorldRoute from "./pages/guides/CityGuideWorldRoute";
import Faqs from "./pages/Faqs";
import Journeys from "./pages/Journeys";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Disclosure from "./pages/Disclosure";
import DayToursIndex from "./pages/tours/day/DayToursIndex";
import DayCyclingTours from "./pages/tours/day/DayCyclingTours";
import DayHikingTours from "./pages/tours/day/DayHikingTours";
import DayPaddleTours from "./pages/tours/day/DayPaddleTours";
import MultiDayLanding from "./pages/tours/MultiDayLanding";
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

const EnglandRedirect = () => <RouteRedirect to="/united-kingdom" />;
const FaqRedirect = () => <RouteRedirect to="/faqs" />;

export default function App() {
  return (
    <>
      <Header />
      <ScrollToTopOnRouteChange />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/england" component={EnglandRedirect} />
        <Route path="/united-kingdom" component={UnitedKingdomRoute} />

        <Route path="/destinations" component={DestinationsIndex} />
        <Route path="/destinations/europe" component={EuropeIndex} />
        <Route
          path="/destinations/europe/:countrySlug/cities/:citySlug/tours"
          component={EuropeCityToursRoute}
        />
        <Route
          path="/destinations/europe/:countrySlug/cities/:citySlug"
          component={EuropeCityRoute}
        />
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
          path="/destinations/world/:countrySlug/cities/:citySlug/tours"
          component={WorldCityToursRoute}
        />
        <Route
          path="/destinations/world/:countrySlug/cities/:citySlug"
          component={WorldCityRoute}
        />
        <Route
          path="/destinations/world/:countrySlug/:categorySlug"
          component={WorldCountryRoute}
        />
        <Route
          path="/destinations/world/:countrySlug"
          component={WorldCountryRoute}
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
        <Route path="/tours/day" component={DayToursIndex} />
        <Route path="/tours/day/cycling" component={DayCyclingTours} />
        <Route path="/tours/day/hiking" component={DayHikingTours} />
        <Route path="/tours/day/paddle" component={DayPaddleTours} />
        <Route path="/tours/multi-day" component={MultiDayLanding} />
        <Route path="/guides" component={GuidesIndex} />
        <Route
          path="/guides/us/:stateSlug/:citySlug"
          component={CityGuideUsRoute}
        />
        <Route path="/guides/us/:stateSlug" component={StateGuideRoute} />
        <Route
          path="/guides/world/:countrySlug/:citySlug"
          component={CityGuideWorldRoute}
        />
        <Route
          path="/guides/world/:countrySlug"
          component={CountryGuideRoute}
        />
        <Route path="/faqs" component={Faqs} />
        <Route path="/faq" component={FaqRedirect} />
        <Route path="/journeys" component={Journeys} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/disclosure" component={Disclosure} />
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
      <Footer />
    </>
  );
}
