import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

export async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  try {
    const options = {
      logLevel: "info",
      output: "json",
      // 移除 onlyCategories 以获取所有类别的数据（accessibility, best-practices, seo）
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      throw new Error("Lighthouse returned no results");
    }

    const lhr = runnerResult.lhr;
    const metrics = lhr.audits;
    // 使用 runnerResult.artifacts 而不是 lhr.artifacts
    const artifacts = runnerResult.artifacts || {};

    // 调试：打印 artifacts 的键
    console.log("Available artifacts keys:", Object.keys(artifacts));
    console.log("Has NetworkRecords:", "NetworkRecords" in artifacts);
    console.log("Has devtoolsLogs:", "devtoolsLogs" in artifacts);

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

    // Extract resource sizes
    // 尝试多个可能的路径来获取网络记录
    let networkRecords = [];
    
    // 方法1: 直接从 artifacts.NetworkRecords 获取
    if (artifacts.NetworkRecords && Array.isArray(artifacts.NetworkRecords)) {
      networkRecords = artifacts.NetworkRecords;
      console.log(`Found ${networkRecords.length} network records from artifacts.NetworkRecords`);
    } 
    // 方法2: 从 devtoolsLogs 中提取网络记录
    else if (artifacts.devtoolsLogs && artifacts.devtoolsLogs["defaultPass"]) {
      console.log("Attempting to extract network records from devtoolsLogs...");
      // devtoolsLogs 包含 Chrome DevTools Protocol 消息
      // 需要解析 Network.responseReceived, Network.requestWillBeSent 等消息
      const devtoolsLog = artifacts.devtoolsLogs["defaultPass"] || [];
      const networkRequests = new Map();
      
      devtoolsLog.forEach((entry) => {
        const params = entry.params || {};
        const requestId = params.requestId;
        
        if (entry.method === "Network.requestWillBeSent") {
          const request = params.request || {};
          if (requestId && request.url) {
            networkRequests.set(requestId, {
              url: request.url,
              mimeType: "",
              status: 0,
              startTime: (params.timestamp || 0) * 1000, // 转换为毫秒
              endTime: 0,
              transferSize: 0,
            });
          }
        } else if (entry.method === "Network.responseReceived") {
          const response = params.response || {};
          if (requestId && networkRequests.has(requestId)) {
            const record = networkRequests.get(requestId);
            record.mimeType = response.mimeType || "";
            record.status = response.status || 0;
            // 如果还没有设置 startTime，使用 responseReceived 的时间
            if (!record.startTime) {
              record.startTime = (params.timestamp || 0) * 1000;
            }
          }
        } else if (entry.method === "Network.loadingFinished") {
          if (requestId && networkRequests.has(requestId)) {
            const record = networkRequests.get(requestId);
            record.endTime = (params.timestamp || 0) * 1000;
            record.transferSize = params.encodedDataLength || 0;
          }
        }
      });
      
      networkRecords = Array.from(networkRequests.values());
      console.log(`Extracted ${networkRecords.length} network records from devtoolsLogs`);
    }
    // 方法3: 从 critical-request-chains audit 中提取部分数据
    else {
      console.warn("NetworkRecords not found, trying to extract from audits...");
      const criticalChains = metrics["critical-request-chains"]?.details?.chains || {};
      const extractedRequests = new Set();
      
      function extractUrlsFromChain(chain, urls) {
        if (chain.request && chain.request.url) {
          urls.add(chain.request.url);
        }
        if (chain.children) {
          Object.values(chain.children).forEach((child) => {
            extractUrlsFromChain(child, urls);
          });
        }
      }
      
      Object.values(criticalChains).forEach((chain) => {
        extractUrlsFromChain(chain, extractedRequests);
      });
      
      // 从 critical chains 中提取的 URL 创建简单的网络记录
      networkRecords = Array.from(extractedRequests).map((url) => ({
        url: url,
        mimeType: url.match(/\.(js|css|jpg|png|gif|svg|woff|woff2)/i)?.[1] || "unknown",
        transferSize: 0, // 无法从 critical chains 获取大小
        startTime: 0,
        endTime: 0,
      }));
      
      console.log(`Extracted ${networkRecords.length} network records from critical-request-chains`);
    }
    
    console.log(`Total network records found: ${networkRecords.length}`);
    
    let jsTotalSize = 0;
    let cssTotalSize = 0;
    let imageTotalSize = 0;
    let thirdPartySize = 0;
    let totalRequests = networkRecords.length;
    let thirdPartyRequests = 0;

    // 分析资源
    const resourceDetails = [];
    const slowRequests = [];

    // 获取当前页面的域名用于判断第三方资源
    let pageDomain = "";
    try {
      pageDomain = new URL(url).hostname;
    } catch (e) {
      console.warn("Failed to parse page URL:", url);
    }

    networkRecords.forEach((record) => {
      const size = record.transferSize || 0;
      const recordUrl = record.url || "";
      const mimeType = record.mimeType || "";
      const duration = record.endTime - record.startTime || 0;

      // 判断是否为第三方资源
      let isThirdParty = false;
      if (pageDomain) {
        try {
          const recordDomain = new URL(recordUrl).hostname;
          isThirdParty =
            recordDomain !== pageDomain &&
            !recordDomain.endsWith(`.${pageDomain}`) &&
            !pageDomain.endsWith(`.${recordDomain}`);
        } catch (e) {
          // URL 解析失败，使用简单判断
          isThirdParty =
            recordUrl.includes("cdn") ||
            recordUrl.includes("googleapis") ||
            recordUrl.includes("cloudflare") ||
            recordUrl.includes("cdnjs") ||
            recordUrl.includes("jsdelivr");
        }
      } else {
        // 没有页面域名，使用简单判断
        isThirdParty =
          recordUrl.includes("cdn") ||
          recordUrl.includes("googleapis") ||
          recordUrl.includes("cloudflare") ||
          recordUrl.includes("cdnjs") ||
          recordUrl.includes("jsdelivr");
      }

      if (isThirdParty) {
        thirdPartyRequests++;
        thirdPartySize += size;
      }

      // 按 MIME 类型分类
      if (mimeType.includes("javascript") || recordUrl.endsWith(".js")) {
        jsTotalSize += size;
      } else if (mimeType.includes("css") || recordUrl.endsWith(".css")) {
        cssTotalSize += size;
      } else if (mimeType.includes("image")) {
        imageTotalSize += size;
      }

      // 记录慢请求
      if (duration > 500) {
        slowRequests.push({
          url: recordUrl.substring(0, 100), // 截断长 URL
          duration: Math.round(duration),
          size: size,
          type: mimeType.split("/")[0] || "unknown",
        });
      }

      resourceDetails.push({
        url: recordUrl.substring(0, 100),
        size: size,
        duration: Math.round(duration),
        mimeType: mimeType,
        isThirdParty: isThirdParty,
      });
    });

    // 按耗时排序，取 Top 10
    slowRequests.sort((a, b) => b.duration - a.duration);
    const topSlowRequests = slowRequests.slice(0, 10);

    // 提取主线程分析数据 - 从 audit details 中提取
    const mainThreadBreakdown = metrics["mainthread-work-breakdown"]?.details?.items || [];
    console.log(`Found ${mainThreadBreakdown.length} main thread breakdown items`);
    
    const mainThreadData = {
      scriptEvaluation: 0,
      layout: 0,
      paint: 0,
      style: 0,
      other: 0,
    };

    mainThreadBreakdown.forEach((item) => {
      const duration = item.duration || 0;
      const group = item.group || "";
      
      // 根据 Lighthouse 的 group 字段分类（更准确）
      if (group === "scriptEvaluation") {
        mainThreadData.scriptEvaluation += duration;
      } else if (group === "styleLayout") {
        // Style & Layout 包含样式和布局，这里归到 layout
        mainThreadData.layout += duration;
      } else if (group.includes("paint") || group.includes("render")) {
        mainThreadData.paint += duration;
      } else {
        // 其他类别（scriptParseCompile, garbageCollection, parseHTML, other）
        mainThreadData.other += duration;
      }
    });

    // 提取所有 audits
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

    // 获取所有分类分数
    const scores = {
      performance: lhr.categories.performance?.score
        ? Math.round(lhr.categories.performance.score * 100)
        : 0,
      accessibility: lhr.categories.accessibility?.score
        ? Math.round(lhr.categories.accessibility.score * 100)
        : 0,
      "best-practices": lhr.categories["best-practices"]?.score
        ? Math.round(lhr.categories["best-practices"].score * 100)
        : 0,
      seo: lhr.categories.seo?.score
        ? Math.round(lhr.categories.seo.score * 100)
        : 0,
    };

    const performanceScore = scores.performance;

    // 构建时间线数据（瀑布流）
    // Lighthouse 的时间单位是毫秒，但可能为 0，需要过滤
    const timeline = networkRecords
      .filter(
        (record) =>
          record.startTime != null && record.endTime != null && record.url
      )
      .map((record) => {
        const recordUrl = record.url || "";
        const fileName = recordUrl.split("/").pop() || recordUrl;
        // Lighthouse 返回的时间已经是毫秒，但需要确保是数字
        const startTime =
          typeof record.startTime === "number"
            ? record.startTime
            : record.startTime || 0;
        const endTime =
          typeof record.endTime === "number"
            ? record.endTime
            : record.endTime || 0;
        return {
          name: fileName.length > 30 ? fileName.substring(0, 30) : fileName,
          url: recordUrl,
          startTime: startTime,
          endTime: endTime,
          duration: endTime - startTime,
          size: record.transferSize || 0,
          type: (record.mimeType || "").split("/")[0] || "unknown",
        };
      })
      .filter((item) => item.startTime >= 0 && item.duration > 0)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 50); // 限制数量以提高性能

    return {
      url,
      score: performanceScore,
      scores: scores,
      metrics: lighthouseMetrics,
      audits,
      timestamp: Date.now(),
      // 新增的详细数据
      resources: {
        jsTotalSize: Math.round(jsTotalSize / 1024), // KB
        cssTotalSize: Math.round(cssTotalSize / 1024), // KB
        imageTotalSize: Math.round(imageTotalSize / 1024), // KB
        thirdPartySize: Math.round(thirdPartySize / 1024), // KB
        totalSize: Math.round(
          (jsTotalSize + cssTotalSize + imageTotalSize + thirdPartySize) / 1024
        ), // KB
      },
      requests: {
        total: totalRequests,
        thirdParty: thirdPartyRequests,
        thirdPartyRatio:
          totalRequests > 0
            ? ((thirdPartyRequests / totalRequests) * 100).toFixed(1)
            : 0,
        slowRequests: topSlowRequests,
      },
      mainThread: mainThreadData,
      timeline: timeline,
    };
  } finally {
    await chrome.kill();
  }
}
