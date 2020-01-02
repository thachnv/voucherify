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
import jsQR from "jsqr";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 270,
  height: 270,
  facingMode: "environment"
};

const getImageData = img => {
  return new Promise(resolve => {
    const canvas = document.querySelector("canvas");

    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.src = img;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      resolve(imageData);
    };
  });
};

function MerchantPage() {
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [merchantId, setMerchantId] = React.useState("");
  const [merchant, setMerchant] = React.useState(null);
  const [useScanner, setUseScanner] = React.useState(false);
  const [pauseScanner, setPauseScanner] = React.useState(false);
  const webcamRef = React.useRef(null);

  //cust_NxziVRVbgrHt1l87aatCXaR1
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (useScanner && !loading && !pauseScanner) {
        const img = webcamRef.current.getScreenshot();
        getImageData(img).then(data => {
          const code = jsQR(data.data, data.width, data.height, {
            inversionAttempts: "dontInvert"
          });
          if (code) {
            setCode(code.data);
            redeem(code.data);
          }
        });
      }
    }, 1000);
    return () => clearInterval(intervalId);
  });

  const scanQR = () => {
    setUseScanner(true);
  };

  const verifyMerchant = async () => {
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
    setLoading(false);
    setMerchant(data);
  };

  const redeem = async localCode => {
    localCode = localCode || code;
    setLoading(true);
    setPauseScanner(true);
    fetch(BASE_URL + REDEEM.replace("{code}", localCode), {
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
            content: "Redeem success!",
            onOk: () => setPauseScanner(false)
          });
        } else {
          if (res.key === "resource_not_found") {
            Modal.error({
              title: "Redeem Failed!",
              content: "Code Invalid!",
              onOk: () => setPauseScanner(false)
            });
          } else if (res.key === "voucher_not_active") {
            Modal.error({
              title: "Redeem Failed!",
              content: "Voucher not active yet!",
              onOk: () => setPauseScanner(false)
            });
          } else if (res.key === "quantity_exceeded") {
            Modal.error({
              title: "Redeem Failed!",
              content: "Voucher already used!",
              onOk: () => setPauseScanner(false)
            });
          } else {
            Modal.error({
              title: "Redeem Failed!",
              content: "Error happen when redeem this code!",
              onOk: () => setPauseScanner(false)
            });
          }
        }
        setLoading(false);
      });
  };

  if (!merchant) {
    return (
      <Modal
        title="Enter your Merchant ID"
        visible={true}
        closable={false}
        footer={
          <Button type="primary" onClick={verifyMerchant} disabled={loading}>
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
              <span>OK</span>
            )}
          </Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="Merchant ID">
            <Input onChange={e => setMerchantId(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
  return (
    <div className="mt-16 p-2 relative">
      <div className="text-center align-middle">
        <label className="w-1/4 pr-2">Code</label>
        <div className="w-1/2 inline-block">
          <Input
            className="w-full"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>
        <div className="w-1/4 inline-block">
          <Button type="primary" onClick={redeem}>
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
        <div className="mt-4 text-center">Or</div>
        {useScanner && (
          <div className="mt-4 text-center">
            <Webcam
              audio={false}
              height={270}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={270}
              className="inline-block"
              videoConstraints={videoConstraints}
            />
          </div>
        )}

        <div className="mt-4 text-center">
          <Button type="primary" onClick={scanQR}>
            Scan QR
          </Button>
        </div>
      </div>
      <canvas
        id="canvas"
        className="absolute"
        style={{ top: -999, left: -999 }}
      />
    </div>
  );
}

export default MerchantPage;
