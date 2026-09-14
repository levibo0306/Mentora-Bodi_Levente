import { useEffect, useState } from "react";

export function ErrorToaster() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer: number | undefined;
    const show = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(""), 6000);
    };
    window.addEventListener("mentora:error", show);
    return () => { window.removeEventListener("mentora:error", show); window.clearTimeout(timer); };
  }, []);
  if (!message) return null;
  return <div className="error-toast" role="alert"><span>{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Hibaüzenet bezárása">×</button></div>;
}
