import React from "react";
import "./App.css";
import "tailwindcss/dist/base.css";
import "tailwindcss/dist/components.css";
import "tailwindcss/dist/utilities.css";
import "tailwindcss/dist/tailwind.css";
import carousellLogo from "./logo.png";
import CampDetail from "./CampDetail";
import { APP_ID, APP_TOKEN, BASE_URL, GET_CAMPAIGN_LIST } from "./config";
import { Switch, Route, Link, HashRouter as Router } from "react-router-dom";
import MerchantPage from "./MerchantPage";

const processCampainData = camp => {
  try {
    camp.metadata.photo_urls = JSON.parse(camp.metadata.photo_urls);
  } catch (e) {
    camp.metadata.photo_urls = [];
  }
  return camp;
};

function App() {
  const [campaignList, setCampaignList] = React.useState(null);

  React.useEffect(() => {
    fetch(BASE_URL + GET_CAMPAIGN_LIST, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
        "X-App-Token": APP_TOKEN
      }
    })
      .then(res => res.json())
      .then(data =>
        setCampaignList(data.campaigns.map(c => processCampainData(c)))
      );
  }, []);

  if (!campaignList) {
    return (
      <div className="h-full content-center justify-center flex">
        <div className="lds-dual-ring mt-32" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mr-auto ml-auto">
      <header data-reactid="3">
        <nav className="fixed top-0 left-0 right-0 h-16 border-b p-4 index z-50 bg-white">
          <a href="/#">
            <img src={carousellLogo} alt="logo" className="h-full" />
          </a>
        </nav>
      </header>
      <Router>
        <Switch>
          <Route exact path="/">
            <div className="p-2 mt-16 mb-16">
              {campaignList.map((c, i) => (
                <Link to={`/campaign/${encodeURI(c.id)}`} key={c.id}>
                  <div
                    className={`border-2 shadow rounded-lg overflow-hidden text-black ${
                      i === 0 ? "mt-0" : "mt-2"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className="img-wrapper overflow-hidden"
                        style={{ maxHeight: 160 }}
                      >
                        <img
                          src={c.metadata && c.metadata.photo_urls[0]}
                          alt="cover"
                          className="ml-auto mr-auto object-cover w-full"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-left font-bold leading-tight two-lines-ellipsis">
                        {c.metadata.title || c.name}
                      </div>
                      <div className="mt-2 text-left opacity-50 overflow">
                        {c.vouchers_count} voucher(s).
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Route>
          <Route path="/campaign/:name">
            <CampDetail />
          </Route>
          <Route path="/merchant">
            <MerchantPage />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
