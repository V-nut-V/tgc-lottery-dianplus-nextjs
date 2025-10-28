"use client";
import Link from "next/link";
import { useState, useContext, useEffect, Fragment } from "react";
import { StoreContainer } from "./index.style";
import { Input, Space, Slider } from "antd";
import { StoreContext } from "@/lib/StoreContextProvider.jsx";
import { SettingsContext } from "@/lib/SettingsContextProvider";
import { BiSolidStore } from "react-icons/bi";
import { FaEye } from "react-icons/fa";

const { Search } = Input;

export default function Store() {
  const [id, setId] = useState(1);
  const [checkPin, setCheckPin] = useState(0);
  const [inspect, setInspect] = useState(false);
  const { store, getStore } = useContext(StoreContext);
  const { size, setSize } = useContext(SettingsContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setId(store.Store_ID);
    console.log("Store component mounted or store changed", store);
  }, [store]);

  const GetStore = async (id) => {
    setLoading(true);
    try {
      const data = await getStore(id);
      if (!data) {
        console.error("Store not found for ID:", id);
        return;
      }
      console.log("Store data retrieved:", data);
    } catch (error) {
      console.error("Error fetching store data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreContainer className="container">
      <h3>{store.Store_Name}</h3>
      <div className="store-info">
        <Space.Compact>
          <Search
            addonBefore="ID"
            style={{ width: "14rem", minWidth: "200px" }}
            value={id}
            onChange={(e) => setId(e.target.value)}
            onSearch={() => GetStore(id)}
            enterButton
            loading={loading}
          />
        </Space.Compact>
      </div>

      <Slider
        style={{ width: "300px", marginTop: "20px" }}
        defaultValue={size}
        value={size}
        min={50}
        max={150}
        trackBg="#000"
        onChange={(value) => setSize(value)}
      />

      <div className="prize-title">
        {store.Store_ID ? <h6>奖项</h6> : ""}

        {store.Store_ID && !inspect ? (
          <Space.Compact>
            <Search
              addonBefore="验证码"
              style={{ width: "18rem", minWidth: "220px" }}
              value={checkPin}
              onChange={(e) => setCheckPin(e.target.value)}
              onSearch={() => {
                if (checkPin == store.Check_PIN) setInspect(true);
                console.log("CheckPin", checkPin, store.Check_PIN);
              }}
              enterButton={<FaEye />}
            />
          </Space.Compact>
        ) : (
          ""
        )}
      </div>

      {inspect && (
        <>
          <div className="prize-list">
            <span className="quantity title">数量</span>
            <span className="name title">奖品</span>
            {store.Prize.map((item, index) => (
              <Fragment key={item.Name + index}>
                <span className="quantity">{item.Quantity}</span>
                <span className="name">{item.Name}</span>
              </Fragment>
            ))}
            {store.Prize.length === 0 && "-"}
          </div>

          <span className="min-spent">
            允许最小额度：¥{store.Min_Spent || " - "}
          </span>
          <span className="position">
            位置：
            {store.Position === "bottom" && "靠下 / bottom"}
            {store.Position === "center" && "居中 / center"}
            {store.Position === "left" && "靠左 / left"}
            {store.Position === "right" && "靠右 / right"}
            {!store.Position && "-"}
          </span>
        </>
      )}
      <Link href="/" className="icon-store-settings">
        <BiSolidStore size={22} />
      </Link>
    </StoreContainer>
  );
}
