/* eslint-disable unicorn/prefer-global-this */
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const pushVital = (metric: Metric): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "web_vital",
    metric_delta: metric.delta,
    metric_id: metric.id,
    metric_name: metric.name,
    metric_navigation_type: metric.navigationType,
    metric_rating: metric.rating,
    metric_value: metric.value,
  });
};

export const reportWebVitals = (): void => {
  onCLS(pushVital);
  onFCP(pushVital);
  onINP(pushVital);
  onLCP(pushVital);
  onTTFB(pushVital);
};
