import React from "react";
import Modal from "antd/lib/modal";
import "antd/lib/modal/style/css";
import Spin from "antd/lib/spin";
import "antd/lib/spin/style/css";
import Icon from "antd/lib/icon";
import "antd/lib/icon/style/css";
import Carousel from "antd/lib/carousel";
import "antd/lib/carousel/style/css";
import { useParams } from "react-router-dom";

import {
  APP_ID,
  APP_TOKEN,
  BASE_URL,
  CREATE_PUBLLICATION,
  GET_CAMPAIGN_LIST,
  GET_VOUCHER_LIST
} from "./config";
import uuid from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard/lib/Component";

function CampDetail() {
  const [gettingCode, setGettingCode] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  const [camp, setCamp] = React.useState(null);

  const { name } = useParams();

  React.useEffect(() => {
    fetch(BASE_URL + GET_CAMPAIGN_LIST + "/" + name, {
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
      .then(data => setCamp(data));
  }, [name]);

  const c = camp || {};
  const getCode = async () => {
    const code = localStorage.getItem(camp.id);
    let voucher;
    setGettingCode(true);
    if (code) {
      voucher = await fetch(BASE_URL + GET_VOUCHER_LIST + "/" + code, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          "X-App-Id": APP_ID,
          "X-App-Token": APP_TOKEN
        }
      }).then(res => res.json());
    } else {
      const nunu =
        "%5Bfilters%5D%5Bjunction%5D=and&%5Bfilters%5D%5Bmetadata.got%5D%5Bconditions%5D%5B$is_unknown%5D=true";

      const query = `?limit=100&campaign=${camp.name}&${nunu}`;
      // const query = `?limit=100&campaign=${camp.id}`;
      voucher = await fetch(BASE_URL + GET_VOUCHER_LIST + query, {
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
    }
    if (voucher) {
      try {
        await fetch(BASE_URL + GET_VOUCHER_LIST + "/" + voucher.code, {
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
        }).then(res => res.json());

        await fetch(BASE_URL + CREATE_PUBLLICATION, {
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
        localStorage.setItem(camp.id, voucher.code);
      } catch {
        setShowModal(true);
        setGettingCode(false);
        setModalMessage("Something went wrong.");
      }
    } else {
      setShowModal(true);
      setGettingCode(false);
      setModalMessage("No voucher left.");
    }
    if (voucher) {
      setGettingCode(false);
      Modal.info({
        icon: null,
        title: (
          <div className="text-center">"Your voucher has been generated!"</div>
        ),
        content: (
          <div className="text-center">
            <img
              alt="qr code"
              className="inline-block"
              src={voucher.assets.qr.url}
            />
            <div className="text-3xl font-bold">{voucher.code}</div>
            <CopyToClipboard text={voucher.code} onCopy={() => setCopied(true)}>
              <button className="w-24 border rounded inline-block p-4 bg-gray-300 text-center">
                {copied ? (
                  <span className="text-green-500">Copied!</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </CopyToClipboard>
          </div>
        ),
        okText: "OK",
        cancelText: "No"
      });
    }
  };

  if (!camp) {
    return (
      <div className="h-full content-center justify-center flex">
        <div className="lds-dual-ring mt-32" />
      </div>
    );
  }

  const photoUrls = JSON.parse(camp.metadata.photo_urls);
  return (
    <div className="mt-16">
      <div className="pt-1">
        <div className="m-2 border rounded overflow-hidden text-center ">
          {camp && camp.metadata.photo_urls && (
            <Carousel style={{ overflow: "hidden" }} dots={true}>
              {photoUrls.map(img => (
                <img
                  src={img}
                  alt="cover"
                  className="ml-auto mr-auto object-cover w-full"
                />
              ))}
            </Carousel>
          )}
        </div>
        <div className="p-4">
          <div className="text-lg text-left font-bold leading-tight two-lines-ellipsis">
            {c.metadata.title || c.name}
          </div>
          {camp && (
            <div
              dangerouslySetInnerHTML={{ __html: camp.metadata.description }}
            />
          )}
          <div className="mt-2 text-left opacity-50 overflow">
            {c.vouchers_count} voucher(s).
          </div>
        </div>
      </div>
      {
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
      }
      {/*{camp && code && (*/}
      {/*  <div*/}
      {/*    className="fixed text-center"*/}
      {/*    style={{*/}
      {/*      bottom: 8,*/}
      {/*      left: 8,*/}
      {/*      right: 8,*/}
      {/*      transition: "opacity",*/}
      {/*      width: "calc(100% - 16px)",*/}
      {/*      height: 60*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <div className="w-32 border rounded inline-block p-4">*/}
      {/*      <b>{code}</b>*/}
      {/*    </div>*/}
      {/*    <CopyToClipboard text={code} onCopy={() => setCopied(true)}>*/}
      {/*      <button className="w-24 border rounded inline-block p-4 bg-gray-300 text-center">*/}
      {/*        {copied ? (*/}
      {/*          <span className="text-green-500">Copied!</span>*/}
      {/*        ) : (*/}
      {/*          <span>Copy</span>*/}
      {/*        )}*/}
      {/*      </button>*/}
      {/*    </CopyToClipboard>*/}
      {/*  </div>*/}
      {/*)}*/}
      <Modal
        visible={showModal}
        footer={null}
        width={"50%"}
        onCancel={() => setShowModal(false)}
      >
        <b>{modalMessage}</b>
      </Modal>
    </div>
  );
}

export default CampDetail;
