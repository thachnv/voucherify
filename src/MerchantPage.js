import React from "react";

import Form from "antd/lib/form";
import "antd/lib/form/style/css";
import Input from "antd/lib/input";
import "antd/lib/input/style/css";
import Button from "antd/lib/button";
import "antd/lib/button/style/css";
import Modal from "antd/lib/modal";
import "antd/lib/modal/style/css";
import {
  APP_ID,
  APP_TOKEN,
  BASE_URL,
  CUSTOMER_ENDPOINT,
  REDEEM
} from "./config";
import Icon from "antd/lib/icon";
import Spin from "antd/lib/spin";

function MerchantPage() {
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [merchantId, setMerchantId] = React.useState("");

  const redeem = async () => {
    setLoading(true);
    // validate the merchant
    const data = await fetch(BASE_URL + CUSTOMER_ENDPOINT + "/" + merchantId, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
        "X-App-Token": APP_TOKEN
      }
    }).then(res => res.json());

    if (!data.id) {
      if (data.key === "resource_not_found") {
        Modal.error({
          title: "Merchant does not exist!",
          content: "Merchant does not exist!"
        });
      } else {
        Modal.error({
          title: "Cannot verify merchant!",
          content: "Error happen when verify this merchant!"
        });
      }
      setLoading(false);
      return;
    }

    // if (!data.metadata.is_merchant) {
    //   Modal.error({
    //     title: "This user is not a merchant!",
    //     content: "This user is not a merchant!"
    //   });
    //   setLoading(false);
    //   return;
    // }

    fetch(BASE_URL + REDEEM.replace("{code}", code), {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
        "X-App-Token": APP_TOKEN
      },
      body: JSON.stringify({
        order: {
          amount: 1
        },
        metadata: {
          merchant_id: merchantId
        }
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.result === "SUCCESS") {
          Modal.success({
            title: "Redeem success!",
            content: "Redeem success!"
          });
        } else {
          if (res.key === "resource_not_found") {
            Modal.error({
              title: "Redeem Failed!",
              content: "Code Invalid!"
            });
          } else if (res.key === "voucher_not_active") {
            Modal.error({
              title: "Redeem Failed!",
              content: "Voucher not active yet!"
            });
          } else if (res.key === "quantity_exceeded") {
            Modal.error({
              title: "Redeem Failed!",
              content: "Voucher already used!"
            });
          } else {
            Modal.error({
              title: "Redeem Failed!",
              content: "Error happen when redeem this code!"
            });
          }
        }
        setLoading(false);
      });
  };

  return (
    <div className="mt-16 p-2 relative">
      <Form layout="vertical">
        <Form.Item label="Merchant ID">
          <Input onChange={e => setMerchantId(e.target.value)} />
        </Form.Item>
        <Form.Item label="Voucher Code">
          <Input onChange={e => setCode(e.target.value)} />
        </Form.Item>
      </Form>
      <Button
        type="primary"
        className="fixed text-lg"
        style={{
          fontSize: "1.125rem",
          position: "fixed",
          width: "calc(100% - 16px)",
          bottom: 8,
          right: 8,
          left: 8,
          height: 60
        }}
        onClick={redeem}
      >
        {loading ? (
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
          <span>Redeem</span>
        )}
      </Button>
    </div>
  );
}

export default MerchantPage;
