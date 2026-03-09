import { RouterProvider, createBrowserRouter } from "react-router";
import { useEffect, useState } from "react";
import { MainApp } from "./components/MainApp";
import { SharedPlaylistPage } from "./components/SharedPlaylistPage";
import { isFigmaSandbox } from "./utils/sandbox";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">Page not found</h1>
        <a href="/" className="text-[#4feec5] hover:underline">Go home</a>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", Component: MainApp },
  { path: "/playlist/:id", Component: SharedPlaylistPage },
  { path: "*", Component: NotFound },
]);

// Suppress unhandled "Failed to fetch" rejections as a last safety net.
window.addEventListener("unhandledrejection", (event) => {
  const msg = String(event.reason?.message ?? event.reason ?? "");
  if (
    msg.toLowerCase().includes("failed to fetch") ||
    msg.toLowerCase().includes("networkerror") ||
    msg.toLowerCase().includes("load failed") ||
    msg.toLowerCase().includes("sandbox")
  ) {
    event.preventDefault();
  }
});

export default function App() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0";

    // Re-evaluate sandbox state here (after mount, SW may now be active).
    if (!isFigmaSandbox()) {
      const fonts = [
        "https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap",
        "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
      ];
      fonts.forEach((href) => {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      });
    }
  }, []);

  return <RouterProvider router={router} />;
}
