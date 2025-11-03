import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

export async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  try {
    const options = {
      logLevel: "info",
      output: "json",
      onlyCategories: ["performance"],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      throw new Error("Lighthouse returned no results");
    }

    const lhr = runnerResult.lhr;
    const metrics = lhr.audits;

    // Extract key metrics
    const lighthouseMetrics = {
      lcp: metrics["largest-contentful-paint"]?.numericValue,
      fid: metrics["max-potential-fid"]?.numericValue,
      cls: metrics["cumulative-layout-shift"]?.numericValue,
      fcp: metrics["first-contentful-paint"]?.numericValue,
      tti: metrics["interactive"]?.numericValue,
      tbt: metrics["total-blocking-time"]?.numericValue,
      speedIndex: metrics["speed-index"]?.numericValue,
      totalBlockingTime: metrics["total-blocking-time"]?.numericValue,
    };

    // Extract all audits
    const audits = {};
    Object.entries(lhr.audits).forEach(([id, audit]) => {
      audits[id] = {
        id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        details: audit.details,
      };
    });

    const score = lhr.categories.performance?.score
      ? Math.round(lhr.categories.performance.score * 100)
      : 0;

    return {
      url,
      score,
      metrics: lighthouseMetrics,
      audits,
      timestamp: Date.now(),
    };
  } finally {
    await chrome.kill();
  }
}
