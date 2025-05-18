"use client";

import * as React from "react";

import "@/styles/globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { env } from "@/env";
import { info } from "@/backend/utils/logger";
import { useWebsocket } from "@/lib/stores";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setWebsocket, ws } = useWebsocket((s) => s);
  React.useEffect(() => {
    const connect = () => {
      try {
        const socket = new WebSocket(`ws://${env.NEXT_PUBLIC_WS_URL}`);
        socket.onopen = () => info(`Websocket connection established [CLIENT]`);

        if (!ws) {
          setWebsocket(socket);
        }
      } catch (err) {
        console.error("Failed to create WebSocket connection:", err);
      }
    };

    if (!ws) {
      connect();
    }
  }, []);
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryClientProvider client={queryClient}>
              <Toaster />
              {children}
            </QueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
