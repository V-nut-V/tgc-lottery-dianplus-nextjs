export const runtime = "nodejs";
import { NextResponse } from "next/server";
import crypto from "crypto";

// === ENV ===
const baseUrl = process.env.RETAIL_BASE_URL;
const appId = process.env.RETAIL_APP_ID;
const appSecret = process.env.RETAIL_APP_SECRET;
const brandId = process.env.RETAIL_BRAND_ID;
const apiVersion = "1.0";

// 上海时区 YYYYMMDDHHmmss（用于 time_stamp）
function getChinaTimestamp() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace(/\D/g, "");
}

// 上海时区 yyyy-MM-dd HH:mm:ss（用于 start/endModified）
function getChinaDateTime(offsetDays = 0) {
  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const chinaTime = new Date(
    utc + 8 * 3600 * 1000 + offsetDays * 24 * 3600 * 1000
  );
  const pad = (n) => String(n).padStart(2, "0");
  return `${chinaTime.getFullYear()}-${pad(chinaTime.getMonth() + 1)}-${pad(
    chinaTime.getDate()
  )} ${pad(chinaTime.getHours())}:${pad(chinaTime.getMinutes())}:${pad(
    chinaTime.getSeconds()
  )}`;
}

// 过滤空值 → 排序 → 拼接 key+value → 首尾拼 secret → md5 小写
function md5Sign(params, secret) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== null && `${v}`.trim() !== ""
    )
  );
  const concat = Object.keys(filtered)
    .sort()
    .map((k) => k + String(filtered[k]))
    .join("");
  return crypto
    .createHash("md5")
    .update(secret + concat + secret, "utf8")
    .digest("hex")
    .toLowerCase();
}

// 构造签名 + URL（把 context/module/method 也参与签名）
// modulePath/methodName 例如：("order","getOrder") 或 ("refundOrder","getRefundOrder")
function buildSignedUrl({ modulePath, methodName, extraParams }) {
  const baseParams = {
    app_id: appId,
    brandId: String(brandId),
    time_stamp: getChinaTimestamp(),
    version: apiVersion,
    pageNum: 1,
    pageSize: 100,
    startModified: getChinaDateTime(-5), // 默认查最近 5 天的数据
    endModified: getChinaDateTime(),
    ...extraParams,
  };

  const signInput = {
    ...baseParams,
    contextPath: "isv",
    modulePath,
    methodName,
  };

  const sign = md5Sign(signInput, appSecret);
  const query = new URLSearchParams({ ...baseParams, sign }).toString();
  const finalUrl = `${baseUrl}/isv/${modulePath}/${methodName}?${query}`;

  return { finalUrl, signInput, queryParams: { ...baseParams, sign } };
}

// 解析订单结果：返回 sumDealPrice（没有就回退 item 级别）
function sumOrders(results) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const total = results.reduce((acc, order) => {
    let orderTotal = 0;
    if (order?.sumDealPrice != null) {
      orderTotal = Number(order.sumDealPrice) || 0;
    } else if (Array.isArray(order?.orderItems)) {
      orderTotal = order.orderItems.reduce(
        (a, it) => a + (Number(it?.sumDealPrice) || 0),
        0
      );
    }
    return acc + (Number.isFinite(orderTotal) ? orderTotal : 0);
  }, 0);
  return total;
}

// 解析退款结果：把所有 results[*].returnMoney 的“绝对值”相加
// 若缺失则回退到明细 returnOrderItems[*].returnMoney
function sumRefunds(results) {
  if (!Array.isArray(results) || results.length === 0) return 0;
  return results.reduce((acc, r) => {
    let v = 0;
    if (r?.returnMoney != null) {
      v = Math.abs(Number(r.returnMoney) || 0);
    } else if (Array.isArray(r?.returnOrderItems)) {
      v = r.returnOrderItems.reduce(
        (a, it) => a + Math.abs(Number(it?.returnMoney) || 0),
        0
      );
    }
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("code");
    const debug = url.searchParams.get("debug") === "1";

    if (!orderId)
      return NextResponse.json(
        { error: "code (orderId) is required" },
        { status: 400 }
      );
    if (!baseUrl || !appId || !appSecret || !brandId) {
      return NextResponse.json(
        { error: "Missing required env vars" },
        { status: 500 }
      );
    }

    // === 构造两个接口的 URL（并发调用） ===
    // 1) 订单明细
    const orderReq = buildSignedUrl({
      modulePath: "order",
      methodName: "getOrder",
      extraParams: { orderId: String(orderId) },
    });

    // 2) 退款明细（文档为 /getRefundOrder；此处用 porderId 过滤原单）
    const refundReq = buildSignedUrl({
      modulePath: "order",
      methodName: "getRefundOrder",
      extraParams: { porderId: String(orderId) }, // 如果对方要求 rorderId/thirdOrderId，请改这里
    });

    if (debug) {
      // 返回两套签名过程，便于和后端/旧 Python 对比
      const debugPack = [orderReq, refundReq].map(
        ({ signInput, queryParams, finalUrl }) => {
          const filtered = Object.fromEntries(
            Object.entries(signInput).filter(
              ([_, v]) => v !== undefined && v !== null && `${v}`.trim() !== ""
            )
          );
          const sortedKeys = Object.keys(filtered).sort();
          const concatString = sortedKeys
            .map((k) => `${k}${filtered[k]}`)
            .join("");
          return {
            finalUrl,
            queryParams,
            sortedKeys,
            concatString,
            stringToMD5: appSecret + concatString + appSecret,
            sign: queryParams.sign,
          };
        }
      );
      return NextResponse.json({ debug: debugPack });
    }

    // === 并发请求 ===
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    const [orderRes, refundRes] = await Promise.all([
      fetch(orderReq.finalUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store",
        signal: controller.signal,
      }),
      fetch(refundReq.finalUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store",
        signal: controller.signal,
      }),
    ]).finally(() => clearTimeout(timer));

    // 错误处理
    if (!orderRes.ok) {
      const t = await orderRes.text();
      return NextResponse.json(
        { error: "Upstream order error", status: orderRes.status, detail: t },
        { status: 502 }
      );
    }
    if (!refundRes.ok) {
      const t = await refundRes.text();
      return NextResponse.json(
        { error: "Upstream refund error", status: refundRes.status, detail: t },
        { status: 502 }
      );
    }

    // 解析
    const orderData = await orderRes
      .json()
      .catch(async () => ({ raw: await orderRes.text() }));
    const refundData = await refundRes
      .json()
      .catch(async () => ({ raw: await refundRes.text() }));

    const orderResults = orderData?.resultObject?.results ?? null;
    const refundResults = refundData?.resultObject?.results ?? null;

    // 没有消费记录：按你的规则 → 返回 null
    const orderTotal = sumOrders(orderResults);
    if (orderTotal == null) return NextResponse.json(null);

    // 有消费记录：计算退款总额（数组为空或 null → 0）
    const refundTotal = sumRefunds(refundResults);

    // 最终实际消费金额 = 消费总额 - 退款总额
    const finalAmount = Number(orderTotal) - Number(refundTotal);

    // 直接返回数字；如果你想带上明细，也可返回 { total: finalAmount, orderTotal, refundTotal }
    if (url.searchParams.get("details") === "1") {
      return NextResponse.json({
        total: finalAmount,
        orderTotal,
        refundTotal,
      });
    }
    return NextResponse.json(finalAmount);
  } catch (e) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
