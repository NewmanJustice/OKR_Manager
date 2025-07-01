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
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    // Load hCaptcha script if not already present
    if (!window.hcaptcha) {
      const script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else {
      renderWidget();
    }

    function renderWidget() {
      if (window.hcaptcha && widgetId.current === null) {
        widgetId.current = window.hcaptcha.render("hcaptcha-container", {
          sitekey,
          callback: onVerify,
        });
      }
    }

    return () => {
      // Optionally remove widget on unmount
      if (window.hcaptcha && widgetId.current !== null) {
        window.hcaptcha.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [sitekey, onVerify]);

  return <div id="hcaptcha-container" />;
};

export default HCaptchaWidget;
