import type { MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { StylesPlaceholder } from "@mantine/remix";
import { createEmotionCache, MantineProvider } from "@mantine/core";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

createEmotionCache({ key: "mantine" });

export default function App() {
  return (
    <MantineProvider
      theme={{
        colorScheme: "dark",

        globalStyles: (theme) => ({
          body: {
            height: "100vh",
            minHeight: "100%",
          },
        }),

        components: {
          Button: {
            defaultProps: {
              color: "red",
            },
          },
          ActionIcon: {
            defaultProps: {
              color: "red",
            },
          },
        },
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <html lang="en">
        <head>
          <StylesPlaceholder />
          <Meta />
          <Links />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </MantineProvider>
  );
}
