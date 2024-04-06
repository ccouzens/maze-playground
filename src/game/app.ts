interface WindowType {
  addEventListener: Window["addEventListener"];
  document: {
    body: {
      addEventListener: Window["document"]["body"]["addEventListener"];
    };
    querySelector: Window["document"]["querySelector"];
    querySelectorAll: Window["document"]["querySelectorAll"];
  };
  history: {
    back: Window["history"]["back"];
    pushState: Window["history"]["pushState"];
    replaceState: Window["history"]["replaceState"];
    state: Window["history"]["state"];
  };
  location: {
    hash: Window["location"]["hash"];
    href: Window["location"]["href"];
  };
}

interface App {
  optionsDialog: HTMLDialogElement;
  linksDialog: HTMLDialogElement;
  window: WindowType;
}

const urls: Record<string, "optionsDialog" | "linksDialog"> = {
  "#options": "optionsDialog",
  "#links": "linksDialog",
};

function navigate(app: App, key: string, pushState = true) {
  const selector = urls[key];
  if (selector === undefined) {
    return;
  }

  const dialog = app[selector];
  dialog.showModal();
  if (pushState) {
    app.window.history.pushState(key, "", key);
  }
  dialog.addEventListener(
    "close",
    function dialogClose() {
      if (app.window.history.state === key) {
        app.window.history.back();
      } else {
        app.window.history.replaceState(
          null,
          "",
          app.window.location.href.replace(/#.+/, ""),
        );
      }
    },
    { once: true },
  );
}

function popstateHandlerFactory(
  app: App,
): (this: Window, ev: WindowEventMap["popstate"]) => void {
  return function popstateHandler({ state }) {
    if (state === null) {
      for (const dialog of app.window.document.querySelectorAll<HTMLDialogElement>(
        "dialog[open]",
      )) {
        dialog.close();
      }
    } else if (typeof state === "string") {
      navigate(app, state, false);
    }
  };
}

function clickHandlerFactory(
  app: App,
): (this: HTMLElement, ev: HTMLElementEventMap["click"]) => void {
  return function clickHandler(ev) {
    if (ev.target instanceof HTMLDialogElement) {
      ev.target.close();
    } else if (ev.target instanceof HTMLAnchorElement) {
      const hrefAttr = ev.target.getAttribute("href");
      if (hrefAttr?.startsWith("#")) {
        navigate(app, hrefAttr);
        ev.preventDefault();
      }
    }
  };
}

export function initialiseApp(window: WindowType) {
  const app: App = {
    optionsDialog:
      window.document.querySelector<HTMLDialogElement>("#optionsDialog")!,
    linksDialog:
      window.document.querySelector<HTMLDialogElement>("#linksDialog")!,
    window,
  };
  const clickHandler = clickHandlerFactory(app);
  const popstateHandler = popstateHandlerFactory(app);

  window.document.body.addEventListener("click", clickHandler);

  window.addEventListener("popstate", popstateHandler);

  if (window.location.hash) {
    navigate(app, app.window.location.hash, false);
  }
}
