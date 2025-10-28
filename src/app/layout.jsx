import localFont from "next/font/local";
import StyledComponentsRegistry from "@/lib/registry";
import StoreContextProvider from "@/lib/StoreContextProvider.jsx";
import SettingsContextProvider from "@/lib/SettingsContextProvider";
import { ApolloWrapper } from "@/lib/ApolloWrapper.jsx";
import { ConfigProvider } from "antd";
import "./globals.css";

const myFont = localFont({
  src: [
    {
      path: "./font/ResourceHanRoundedCN-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./font/ResourceHanRoundedCN-Light.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./font/ResourceHanRoundedCN-Normal.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./font/ResourceHanRoundedCN-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./font/ResourceHanRoundedCN-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./font/ResourceHanRoundedCN-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./font/ResourceHanRoundedCN-Heavy.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata = {
  title: "",
  description: "",
};

const theme = {
  token: {
    fontSize: 16,
    colorPrimary: "#54C8E8",
    borderRadius: "40px",
    fontFamily: "myFont",
  },
  components: {
    Input: {
      addonBg: "#FFFFFF",
    },
    Slider: {
      trackBg: "#54C8E8",
      railBg: "rgba(0,0,0,0.1)",
      railHoverBg: "rgba(0,0,0,0.2)",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={myFont.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ApolloWrapper>
          <ConfigProvider theme={theme}>
            <SettingsContextProvider>
              <StoreContextProvider>
                <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
              </StoreContextProvider>
            </SettingsContextProvider>
          </ConfigProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
