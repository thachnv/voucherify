import React from "react";
import "./App.css";
import "tailwindcss/dist/base.css";
import "tailwindcss/dist/components.css";
import "tailwindcss/dist/utilities.css";
import "tailwindcss/dist/tailwind.css";
import carousellLogo from "./logo.png";
import CampDetail from "./CampDetail";
import { APP_ID, APP_TOKEN, BASE_URL, GET_CAMPAIGN_LIST } from "./config";

function App() {
  const [campaignList, setCampaignList] = React.useState(null);
  const [showDetail, setShowDetail] = React.useState(false);
  const [selectedCamp, setSelectedCamp] = React.useState(null);

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
      .then(data => setCampaignList(data.campaigns));
  }, []);

  const onBack = () => {
    setShowDetail(false);
    setSelectedCamp(null);
  };

  if (!campaignList) {
    return (
      <div className="h-full content-center justify-center flex">
        <div className="lds-dual-ring mt-32" />
      </div>
    );
  }

  return (
    <div>
      <header data-reactid="3">
        <nav className="fixed top-0 left-0 right-0 h-16 border-b p-4 index z-50 bg-white">
          <a href="http://carousell.com">
            <img src={carousellLogo} alt="logo" className="h-full" />
          </a>
        </nav>
      </header>
      {!showDetail && (
        <div className="p-8 mt-16">
          {campaignList.map((c, i) => (
            <div
              className={`border shadow rounded-lg overflow-hidden ${
                i === 0 ? "mt-0" : "mt-8"
              }`}
            >
              <div className="text-center">
                <div
                  className="img-wrapper overflow-hidden"
                  style={{ maxHeight: 160 }}
                >
                  <img
                    onClick={() => {
                      setShowDetail(!showDetail);
                      setSelectedCamp(c);
                    }}
                    src={c.metadata && c.metadata.photo_url}
                    alt="cover"
                    className="ml-auto mr-auto object-cover w-full"
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="text-left font-bold leading-tight two-lines-ellipsis">
                  {c.name}
                </div>
                <div className="mt-2 text-left opacity-50 overflow">
                  {c.vouchers_count} voucher(s).
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-16">
        <CampDetail camp={selectedCamp} onBack={onBack} />
      </div>
    </div>
  );
}

export default App;
