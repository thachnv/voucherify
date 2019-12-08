import React from "react";
import { CSSTransition } from "react-transition-group";
import Modal from "antd/lib/modal";
import "antd/lib/modal/style/css";
import Spin from "antd/lib/spin";
import "antd/lib/spin/style/css";
import Icon from "antd/lib/icon";
import "antd/lib/icon/style/css";
import {
  APP_ID,
  APP_TOKEN,
  BASE_URL,
  CREATE_PUBLLICATION,
  GET_VOUCHER_LIST
} from "./config";
import uuid from "uuid";

const v = {
  category: "New voucher",
  metadata: {
    locale: "de-en"
  },
  additional_info: "Test voucher",
  redemption: {
    quantity: 1
  }
};
function CampDetail({ camp, onBack }) {
  const [gettingCode, setGettingCode] = React.useState(false);
  const [showCode, setShowCode] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");

  const c = camp || {};
  const getCode = async () => {
    setGettingCode(true);
    const nunu =
      "%5Bfilters%5D%5Bmetadata.got%5D%5Bconditions%5D%5B$is_unknown%5D=true";

    const query = `?limit=100&campaign=${camp.name}&${nunu}`;
    const voucher = await fetch(BASE_URL + GET_VOUCHER_LIST + query, {
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
      .then(data => {
        return data.vouchers.find(v => v.publish.count === 0);
      });

    if (voucher) {
      try {
        const updated = await fetch(
          BASE_URL + GET_VOUCHER_LIST + "/" + voucher.code,
          {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
              "X-App-Id": APP_ID,
              "X-App-Token": APP_TOKEN
            },
            body: JSON.stringify({
              metadata: {
                got: "yes"
              }
            })
          }
        ).then(res => res.json());

        const final = await fetch(BASE_URL + CREATE_PUBLLICATION, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            "X-App-Id": APP_ID,
            "X-App-Token": APP_TOKEN
          },
          body: JSON.stringify({
            customer: {
              source_id: uuid.v4()
            },
            voucher: voucher.code
          })
        }).then(res => res.json());
        console.log(updated, final);
        setModalMessage(voucher.code);
      } catch {
        setModalMessage("Something went wrong.");
      }
    } else {
      setModalMessage("No voucher left.");
    }
    setShowCode(true);
    setGettingCode(false);
  };

  return (
    <div>
      {camp && (
        <button className="p-4" onClick={onBack}>
          Back
        </button>
      )}
      <CSSTransition in={!!camp} timeout={300} classNames="alert" unmountOnExit>
        <div>
          <div className="text-center">
            <img
              src={c.metadata && c.metadata.photo_url}
              alt="cover"
              className="ml-auto mr-auto h-full object-cover w-full"
              style={{ maxHeight: 500 }}
            />
          </div>
          <div className="p-4">
            <div className="text-lg text-left font-bold leading-tight two-lines-ellipsis">
              {c.name}
            </div>
            <div className="mt-2 text-left opacity-50 overflow">
              {c.vouchers_count} voucher(s).
            </div>
          </div>
        </div>
      </CSSTransition>
      {camp && (
        <button
          className="fixed border shadow p-4 rounded bg-green-500 text-white mt-16"
          style={{
            bottom: 8,
            left: 8,
            right: 8,
            transition: "opacity",
            width: "calc(100% - 16px)",
            height: 60
          }}
          onClick={getCode}
        >
          {gettingCode ? (
            <Spin
              indicator={
                <Icon
                  type="loading"
                  style={{ fontSize: 24, color: "white" }}
                  spin
                />
              }
            />
          ) : (
            <span className="font-bold">Get Code</span>
          )}
        </button>
      )}
      <Modal
        visible={showCode}
        footer={null}
        width={"50%"}
        onCancel={() => setShowCode(false)}
      >
        <b>{modalMessage}</b>
      </Modal>
    </div>
  );
}

export default CampDetail;
