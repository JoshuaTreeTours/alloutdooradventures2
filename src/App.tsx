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

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/destinations" component={DestinationsIndex} />

      <Route path="/destinations/states/california" component={California} />
      <Route path="/destinations/states/arizona" component={Arizona} />
      <Route path="/destinations/states/nevada" component={Nevada} />
      <Route path="/destinations/states/utah" component={Utah} />
      <Route path="/destinations/states/oregon" component={Oregon} />
      <Route path="/destinations/states/washington" component={Washington} />

      <Route path="/tours" component={ToursIndex} />

      <Route>Not Found</Route>
    </Switch>
  );
}
