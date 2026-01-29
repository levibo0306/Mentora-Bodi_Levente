import React from "react";
import { getMetrics } from "../infra/metrics";

export const MetricsPanel: React.FC = () => {
  const m = getMetrics();

  return (
    <section style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #ddd" }}>
      <h3>Megfigyelhetőség (lokális metrikák)</h3>
      <ul>
        <li>Összes API-hívás: {m.requestsTotal}</li>
        <li>Hibás API-hívások: {m.requestsFailed}</li>
        <li>Létrehozott kvízek: {m.quizzesCreated}</li>
        {m.lastErrorAt && <li>Utolsó hiba ideje: {m.lastErrorAt}</li>}
      </ul>
      <p style={{ fontSize: 12, opacity: 0.8 }}>
        Megjegyzés: ez prototípus, a metrikák böngésző-memóriában élnek.
      </p>
    </section>
  );
};
