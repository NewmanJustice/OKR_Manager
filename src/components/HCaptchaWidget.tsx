import { useEffect, useRef } from "react";

interface HCaptchaWidgetProps {
  sitekey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: string,
        opts: { sitekey: string; callback: (token: string) => void }
      ) => number;
      remove: (id: number) => void;
    };
  }
}

const HCaptchaWidget = ({ sitekey, onVerify }: HCaptchaWidgetProps) => {
  console.log("hCaptcha sitekey at runtime:", sitekey);

  const widgetId = useRef<number | null>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    function renderWidget() {
      if (window.hcaptcha && widgetId.current === null) {
        widgetId.current = window.hcaptcha.render("hcaptcha-container", {
          sitekey,
          callback: onVerify,
        });
      }
    }

    if (!window.hcaptcha && !scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded.current = true;
        renderWidget();
      };
      document.body.appendChild(script);
    } else if (window.hcaptcha) {
      renderWidget();
    }

    return () => {
      if (window.hcaptcha && widgetId.current !== null) {
        window.hcaptcha.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [sitekey, onVerify]);

  return <div id="hcaptcha-container" />;
};

export default HCaptchaWidget;
