import { initialiseApp } from "./game/app";

initialiseApp(window).catch((reason) => console.error(reason));

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(
    (r) => console.log("Service worker registered", r),
    (e) => console.log("Service worker failed to register", e),
  );
} else {
  console.log("Service worker not supported");
}
