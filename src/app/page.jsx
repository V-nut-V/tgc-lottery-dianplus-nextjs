"use client";
import Link from "next/link";
import { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { StoreContext } from "@/lib/StoreContextProvider.jsx";
import { Input, Space } from "antd";
import { BiSolidStore } from "react-icons/bi";
import {
  drawPrizeAndUpdate,
  rollPrizeText,
  isPrizePoolEmpty,
} from "@/lib/lottery";
import { LotteryContainer } from "./index.style";
import { MdConfirmationNumber } from "react-icons/md";
import dayjs from "dayjs";

const { Search } = Input;

export default function Home() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [spent, setSpent] = useState("");
  const [loading, setLoading] = useState(false);
  const finalPrizeRef = useRef(null);
  const [history, setHistory] = useState([]);
  const { store, setStore, getStore, updateStore, getHistory, postHistory } = useContext(StoreContext);
  const [rollingText, setRollingText] = useState(store.Dashboard_Title);
  

  useEffect(() => {
    if (!store.Store_ID) router.push("/store");
  }, []);

  function getChinaISOTime() {
    const date = new Date();
    const offsetMs = 8 * 60 * 60 * 1000; // UTC+8
    const local = new Date(date.getTime() + offsetMs)
      .toISOString()
      .replace("Z", "+08:00");
    return local;
  }

  const rolling = async (invoiceNumber) => {
    finalPrizeRef.current = null;
    setLoading(true);
    let currentHistory = [];
    let spentAmount;

    if (!invoiceNumber) {
      Stop(store.Dashboard_Title);
      return;
    }
    setRollingText("准备中...");

    // 0. 通过小票号码获取消费金额（也检查了小票号码合法性）
    // 只获取一次，如果已经获取了就不再请求获取，跳过
    if (!spent) {
      console.log("fetch spent", spent, process.env.NEXT_PUBLIC_SUB_BASE_PATH);
      try {
        const retailSpentAmount = await fetch(
          `${
            process.env.NEXT_PUBLIC_SUB_BASE_PATH || ""
          }/api/external?code=${invoiceNumber}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        spentAmount = await retailSpentAmount.json();
        if (spentAmount === null) {
          Stop("无效的小票号码,请复查后再试");
          return;
        }
        setSpent(spentAmount.toString());
      } catch {
        Stop("请再尝试或联系开发人员[Failed to sumDealPrice]");
        return;
      }
    }

    try {
      const preHistory = await getHistory(invoiceNumber);
      setHistory(preHistory);
      console.log("preHistory", preHistory);
      const times = Math.floor(
        parseFloat(spent || spentAmount) / parseFloat(store.Min_Spent)
      );
      if (preHistory && preHistory.length >= times) {
        Stop("此号码已抽完奖项");
        return;
      }
    } catch {
      Stop("请再尝试或联系开发人员[Failed to fetch history]");
      return;
    }

    // 实际抽奖过程
    // 1. 更新重新获取更新 Store
    const store_id = localStorage.getItem("store_id");
    const storeData = await getStore(parseInt(store_id));

    // 2. 检查奖品池是否为空
    if (isPrizePoolEmpty(storeData.Prize)) {
      Stop("抱歉，奖池已空");
      return;
    }

    // 更新滚动文本 - 模拟抽奖过程 （同时返回停止滚动的控制器-手动）
    rollPrizeText(
      store.Prize,
      () => finalPrizeRef.current,
      setRollingText,
      () => Stop(finalPrizeRef.current)
    );

    // 3. 根据Store信息进行随机抽奖
    const { selected, afterPrizes } = drawPrizeAndUpdate(storeData.Prize);
    setStore((prev) => ({ ...prev, Prize: afterPrizes }));

    // 4. update/push更新后的store信息
    try {
      await Promise.all([
        updateStore({
          ...store,
          Prize: afterPrizes.map(({ Name, Quantity }) => ({ Name, Quantity })),
        }),
        postHistory({
          Code: invoiceNumber,
          Store_Name: store.Store_Name,
          Store_ID: store.Store_ID,
          Prize_Name: selected.Name,
          Spent: spent.toString(),
          Create_Date: getChinaISOTime(),
        }),
      ]);
    } catch {
      Stop(
        "请再尝试一遍或联系开发人员[failed to updateStore or failed to createHistory.]"
      );
      return;
    }

    // 5. create/post抽奖历史
    try {
      currentHistory = await getHistory(invoiceNumber);
    } catch {
      Stop("请再尝试一遍或联系开发人员[]");
      return;
    }

    finalPrizeRef.current = selected.Name;

    function Stop(message) {
      setRollingText(message);
      setLoading(false);
      if (currentHistory?.length > 0) {
        setHistory(currentHistory);
      }
    }
  };

  const reset = () => {
    setRollingText(store.Dashboard_Title);
    setInvoiceNumber("");
    setSpent("");
    setHistory([]);
  };

  return (
    <LotteryContainer
      background_url={store.Background_URL}
      position={store.Position}
    >
      <div className="box">
        {/* <h1>{store.Dashboard_Title}</h1> */}
        <Space.Compact size="large">
          <Search
            addonBefore={
              <MdConfirmationNumber
                fontSize={32}
                style={{ paddingTop: "0.3rem" }}
                color="#54C8E8"
              />
            }
            style={{ width: "30rem", minWidth: "450px" }}
            placeholder="小票号码"
            value={invoiceNumber}
            onChange={(e) => {
              setInvoiceNumber(e.target.value);
              setRollingText(store.Dashboard_Title);
              setHistory([]);
              setSpent("");
            }}
            onSearch={() => rolling(invoiceNumber)}
            enterButton="点击抽奖"
            loading={loading}
          />
        </Space.Compact>
        <span onDoubleClick={() => reset()} className="rolling-box">
          {rollingText}
        </span>
        {spent && (
          <span className="times-limit">
            {spent && `消费金额：${spent} 元｜`}
            可抽奖次数：
            {Math.floor(parseFloat(spent) / parseFloat(store.Min_Spent))}
            {history?.length > 0 &&
              Math.floor(parseFloat(spent) / parseFloat(store.Min_Spent)) >=
                1 &&
              `｜剩余抽奖次数：
                ${
                  Math.floor(parseFloat(spent) / parseFloat(store.Min_Spent)) -
                  history.length
                }`}
          </span>
        )}

        {invoiceNumber && history?.length > 0 && (
          <ul className="history-list">
            {history
              .slice()
              .reverse()
              .map((h) => (
                <li key={h.createdAt}>
                  {h.Prize_Name} -{" "}
                  {dayjs(h.createdAt).format("YYYY/MM/DD HH:mm")}
                </li>
              ))}
          </ul>
        )}
      </div>
      <Link href="/store" className="icon-store-settings">
        <BiSolidStore size={22} />
      </Link>
    </LotteryContainer>
  );
}
