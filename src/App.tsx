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
import CanadaCountryRoute from "./pages/destinations/world/CanadaCountryRoute";
import CanadaProvinceRoute from "./pages/destinations/world/CanadaProvinceRoute";
import CanadaCityRoute from "./pages/destinations/world/CanadaCityRoute";
import CanadaTourRoute from "./pages/destinations/world/CanadaTourRoute";
import CanadaTourBookingRoute from "./pages/destinations/world/CanadaTourBookingRoute";
import CanadaActivityRoute from "./pages/destinations/world/CanadaActivityRoute";
import StateLandingRoute from "./pages/destinations/StateLandingRoute";
import CityRoute from "./pages/destinations/states/CityRoute";
import CityToursIndexRoute from "./pages/destinations/states/tours/CityToursIndexRoute";
import CityTourDetailRoute from "./pages/destinations/states/tours/CityTourDetailRoute";
import CityTourBookingRoute from "./pages/destinations/states/tours/CityTourBookingRoute";
import StateToursRoute from "./pages/destinations/states/tours/StateToursRoute";
import ToursLanding from "./pages/tours/ToursLanding";
import ToursCatalog from "./pages/ToursCatalog";
import GuidesIndex from "./pages/guides/GuidesIndex";
import UsGuidesIndex from "./pages/guides/UsGuidesIndex";
import InternationalGuidesIndex from "./pages/guides/InternationalGuidesIndex";
import StateGuideRoute from "./pages/guides/StateGuideRoute";
import CityGuideUsRoute from "./pages/guides/CityGuideUsRoute";
import CountryGuideRoute from "./pages/guides/CountryGuideRoute";
import CityGuideWorldRoute from "./pages/guides/CityGuideWorldRoute";
import ParisGuideRoute from "./pages/guides/ParisGuideRoute";
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
import Engine5ProofListingRoute from "./pages/engine5/Engine5ProofListingRoute";
import Engine5ProofTourPage from "./engine5/components/Engine5ProofTourPage";
import Engine6SpecimenRoute from "./pages/engine6/Engine6SpecimenRoute";
import {
  ENGINE5_PROOF_LISTING_PATH,
  ENGINE5_PROOF_TOUR_ROUTE_PATTERN,
} from "./engine5/routes";
import {
  ENGINE6_ANTELOPE_ROUTE,
  ENGINE6_CATALINA_ROUTE,
  ENGINE6_EMERALD_CAVE_ROUTE,
  ENGINE6_PARAGON_ROUTE,
  ENGINE6_ANCHORAGE_PRIVATE_ROUTE,
  ENGINE6_ANCHORAGE_SUNSET_ROUTE,
  ENGINE6_ANCHORAGE_GREENBELT_ROUTE,
  ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE,
  ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE,
  ENGINE6_NYC_PEDICAB_ROUTE,
  ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE,
  ENGINE6_SAN_DIEGO_HALF_DAY_4X4_ROUTE,
  ENGINE6_SAN_DIEGO_PRIVATE_SAILING_CHARTER_ROUTE,
  ENGINE6_SAN_DIEGO_SEA_CAVE_KAYAK_ROUTE,
  ENGINE6_SAN_DIEGO_ZOO_COMBO_ROUTE,
  ENGINE6_SPECIMEN_ROUTE,
  ENGINE6_YOSEMITE_ROUTE,
  ENGINE6_MIAMI_MILLIONAIRES_ROW_ROUTE,
} from "./engine6/routes";
import { canonicalHref, getStateGuidePath } from "./utils/guidePaths";

const EnglandRedirect = () => <RouteRedirect to="/united-kingdom" />;
const FaqRedirect = () => <RouteRedirect to="/faqs" />;
const ContactRedirect = () => <RouteRedirect to="/contact" />;

type StateSlugParams = {
  params: {
    stateSlug: string;
  };
};

const DestinationStateGuideRedirect = ({ params }: StateSlugParams) => {
  const stateGuidePath = canonicalHref(getStateGuidePath(params.stateSlug));
  const queryString = window.location.search || "";

  return <RouteRedirect to={`${stateGuidePath}${queryString}`} />;
};

const MexicoCitySlugRedirect = () => (
  <RouteRedirect to="/destinations/mexico/ciudad-de-mexico" />
);

type MexicoCityToursSlugRedirectProps = {
  params: {
    tourSlug: string;
  };
};

const MexicoCityToursSlugRedirect = ({
  params,
}: MexicoCityToursSlugRedirectProps) => (
  <RouteRedirect
    to={`/destinations/mexico/ciudad-de-mexico/tours/${params.tourSlug}`}
  />
);

const MexicoCityBookSlugRedirect = ({
  params,
}: MexicoCityToursSlugRedirectProps) => (
  <RouteRedirect
    to={`/destinations/mexico/ciudad-de-mexico/tours/${params.tourSlug}/book`}
  />
);

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
        <Route path="/book/:tourSlug" component={CanadaTourBookingRoute} />
        <Route
          path="/destinations/world/canada/:province/:city/tours/:tourSlug/book"
          component={CanadaTourBookingRoute}
        />
        <Route
          path="/destinations/world/canada/:province/:city/tours/:tourSlug"
          component={CanadaTourRoute}
        />
        <Route
          path="/destinations/world/canada/:province/:city/activities/:activitySlug"
          component={CanadaActivityRoute}
        />
        <Route
          path="/destinations/world/canada/:province/activities/:activitySlug"
          component={CanadaActivityRoute}
        />
        <Route
          path="/destinations/world/canada/activities/:activitySlug"
          component={CanadaActivityRoute}
        />
        <Route
          path="/destinations/world/canada/:province/:city"
          component={CanadaCityRoute}
        />
        <Route
          path="/destinations/world/canada/:province"
          component={CanadaProvinceRoute}
        />
        <Route
          path="/destinations/world/canada"
          component={CanadaCountryRoute}
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

        <Route path={ENGINE6_SPECIMEN_ROUTE} component={Engine6SpecimenRoute} />
        <Route path={ENGINE6_PARAGON_ROUTE} component={Engine6SpecimenRoute} />
        <Route path={ENGINE6_CATALINA_ROUTE} component={Engine6SpecimenRoute} />
        <Route path={ENGINE6_ANTELOPE_ROUTE} component={Engine6SpecimenRoute} />
        <Route
          path={ENGINE6_EMERALD_CAVE_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route path={ENGINE6_YOSEMITE_ROUTE} component={Engine6SpecimenRoute} />
        <Route
          path={ENGINE6_ANCHORAGE_PRIVATE_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_ANCHORAGE_SUNSET_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_ANCHORAGE_GREENBELT_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_NYC_PEDICAB_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_SAN_DIEGO_ZOO_COMBO_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_SAN_DIEGO_SEA_CAVE_KAYAK_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_SAN_DIEGO_PRIVATE_SAILING_CHARTER_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_SAN_DIEGO_HALF_DAY_4X4_ROUTE}
          component={Engine6SpecimenRoute}
        />
        <Route
          path={ENGINE6_MIAMI_MILLIONAIRES_ROW_ROUTE}
          component={Engine6SpecimenRoute}
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
          path="/destinations/united-states/:stateSlug/:citySlug/tours/:tourSlug/book"
          component={CityTourBookingRoute}
        />
        <Route
          path="/destinations/united-states/:stateSlug/:citySlug/tours/:tourSlug"
          component={CityTourDetailRoute}
        />
        <Route
          path="/destinations/united-states/:stateSlug/:citySlug/tours"
          component={CityToursIndexRoute}
        />
        <Route
          path="/destinations/united-states/:stateSlug/tours"
          component={StateToursRoute}
        />
        <Route
          path="/destinations/united-states/:stateSlug"
          component={StateLandingRoute}
        />

        <Route
          path="/destinations/mexico/ciudad-de-m-xico"
          component={MexicoCitySlugRedirect}
        />
        <Route
          path="/destinations/mexico/ciudad-de-m-xico/tours"
          component={() => (
            <RouteRedirect to="/destinations/mexico/ciudad-de-mexico/tours" />
          )}
        />
        <Route
          path="/destinations/mexico/ciudad-de-m-xico/tours/:tourSlug"
          component={MexicoCityToursSlugRedirect}
        />
        <Route
          path="/destinations/mexico/ciudad-de-m-xico/tours/:tourSlug/book"
          component={MexicoCityBookSlugRedirect}
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
          path="/destinations/states/:stateSlug"
          component={DestinationStateGuideRedirect}
        />
        <Route
          path="/destinations/:stateSlug/:citySlug"
          component={CityRoute}
        />
        <Route
          path="/destinations/states/:stateSlug/cities/:citySlug"
          component={CityRoute}
        />
        <Route path="/destinations/:stateSlug" component={StateLandingRoute} />

        <Route path="/tours" component={ToursLanding} />
        <Route path="/tours/catalog" component={ToursCatalog} />
        <Route path="/tours/day" component={DayToursIndex} />
        <Route path="/tours/day/cycling" component={DayCyclingTours} />
        <Route path="/tours/day/hiking" component={DayHikingTours} />
        <Route path="/tours/day/paddle" component={DayPaddleTours} />
        <Route path="/tours/multi-day" component={MultiDayLanding} />
        <Route
          path={ENGINE5_PROOF_LISTING_PATH}
          component={Engine5ProofListingRoute}
        />
        <Route
          path={ENGINE5_PROOF_TOUR_ROUTE_PATTERN}
          component={Engine5ProofTourPage}
        />
        <Route path="/guides" component={GuidesIndex} />
        <Route path="/guides/us" component={UsGuidesIndex} />
        <Route
          path="/guides/international/:countrySlug/:citySlug"
          component={({ params }) => (
            <RouteRedirect
              to={`/guides/world/${params.countrySlug}/${params.citySlug}`}
            />
          )}
        />
        <Route
          path="/guides/international/:countrySlug"
          component={({ params }) => (
            <RouteRedirect to={`/guides/world/${params.countrySlug}`} />
          )}
        />
        <Route
          path="/guides/international"
          component={() => <RouteRedirect to="/guides/world" />}
        />
        <Route path="/guides/world" component={InternationalGuidesIndex} />
        <Route
          path="/guides/us/:stateSlug/:citySlug"
          component={CityGuideUsRoute}
        />
        <Route path="/guides/us/:stateSlug" component={StateGuideRoute} />
        <Route path="/guides/world/france/paris" component={ParisGuideRoute} />
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
        <Route path="/contact-us" component={ContactRedirect} />
        <Route path="/custom-tour" component={ContactRedirect} />
        <Route path="/inquire" component={ContactRedirect} />
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
        <Route path="/tours/activities/canoeing" component={CanoeingTours} />
        <Route
          path="/tours/:tourSlug/book"
          component={FlagstaffTourBookingRoute}
        />
        <Route path="/tours/:tourSlug" component={FlagstaffTourDetailRoute} />
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
