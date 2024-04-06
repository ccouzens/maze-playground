import { initializeComputer, rustStringToJS, type Computer } from "../computer";

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
  wallsSvgPath: SVGPathElement;
  routeSvgPath: SVGPathElement;
  mazeSvg: SVGElement;
  computer: Computer;
  width: number;
  height: number;
  window: WindowType;
}

function navigate(app: App, key: string, pushState = true) {
  let dialog: HTMLDialogElement;
  if (key === "#options") {
    dialog = app.optionsDialog;
  } else if (key === "#links") {
    dialog = app.linksDialog;
  } else {
    return;
  }
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

export async function initialiseApp(window: WindowType) {
  const computer = await initializeComputer();
  const mazeSvg = window.document.querySelector<SVGElement>("#maze")!;
  const app: App = {
    optionsDialog:
      window.document.querySelector<HTMLDialogElement>("#optionsDialog")!,
    linksDialog:
      window.document.querySelector<HTMLDialogElement>("#linksDialog")!,
    wallsSvgPath: mazeSvg.querySelector<SVGPathElement>("#walls")!,
    routeSvgPath: mazeSvg.querySelector<SVGPathElement>("#route")!,
    mazeSvg,
    computer,
    width: 10,
    height: 10,
    window,
  };
  const clickHandler = clickHandlerFactory(app);
  const popstateHandler = popstateHandlerFactory(app);

  window.document.body.addEventListener("click", clickHandler);

  window.addEventListener("popstate", popstateHandler);

  if (window.location.hash) {
    navigate(app, app.window.location.hash, false);
  }

  const maze = computer.new_maze(app.width, app.height);
  try {
    app.wallsSvgPath.setAttribute(
      "d",
      rustStringToJS(computer, computer.maze_svg_path(maze)),
    );
    mazeSvg.setAttribute(
      "viewBox",
      `-0.125 -0.125 ${computer.maze_width(maze) + 0.25} ${computer.maze_height(maze) + 0.25}`,
    );
  } finally {
    computer.free_maze(maze);
  }
}
