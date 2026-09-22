import { useEffect } from "react";

const STORAGE_KEY = "prismbay_cookie_consent";
const SCRIPT_ID = "goaffpro-loader";

function loadGoAffPro() {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.type = "text/javascript";
  script.src = "https://api.goaffpro.com/loader.js?shop=ppkqmsgfhp";
  script.async = true;
  document.head.appendChild(script);
}

export default function GoAffProTracker() {
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "accepted") {
      loadGoAffPro();
    }

    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === "accepted") loadGoAffPro();
    };

    window.addEventListener("prismbay:cookie-consent", onConsent);
    return () => window.removeEventListener("prismbay:cookie-consent", onConsent);
  }, []);

  return null;
}
