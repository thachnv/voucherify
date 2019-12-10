import React from "react";
import "./App.css";
import "tailwindcss/dist/base.css";
import "tailwindcss/dist/components.css";
import "tailwindcss/dist/utilities.css";
import "tailwindcss/dist/tailwind.css";
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
      {!showDetail && (
        <div className="p-4">
          {campaignList.map(c => (
            <div className="ml-4 mt-8 border shadow rounded-lg overflow-hidden">
              <div className="text-center">
                <img
                  onClick={() => {
                    setShowDetail(!showDetail);
                    setSelectedCamp(c);
                  }}
                  src={c.metadata && c.metadata.photo_url}
                  alt="cover"
                  className="ml-auto mr-auto h-full object-cover"
                  style={{ height: 160 }}
                />
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
      <CampDetail camp={selectedCamp} onBack={onBack} />
    </div>
  );
}

export default App;
