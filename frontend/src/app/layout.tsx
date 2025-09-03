import type { Metadata } from "next";
import { Schoolbell } from "next/font/google";
import "./globals.css";
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import theme from "~/theme/antd.theme";
import { QueryClientProvider } from "~/providers/QueryClientProvider";

const schoolbell = Schoolbell({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-schoolbell",
});

export const metadata: Metadata = {
  title: "Ledgerly - Personal Financial Management",
  description: "Your Personal Financial Management Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schoolbell.className} antialiased`} suppressHydrationWarning
      >
        <QueryClientProvider>
          <AntdRegistry>
            <ConfigProvider theme={theme}>
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </QueryClientProvider>
      </body>
    </html>
  );
}
