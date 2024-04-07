import {
  Maze,
  initializeComputer,
  rustStringToJS,
  type Computer,
} from "../computer";

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
  maze: Maze | null;
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

function newMaze(app: App): void {
  if (app.maze !== null) {
    app.computer.free_maze(app.maze);
    app.maze = null;
  }

  app.maze = app.computer.new_maze_wilsons(app.width, app.height);
  app.wallsSvgPath.setAttribute(
    "d",
    rustStringToJS(app.computer, app.computer.maze_svg_path(app.maze)),
  );
  app.mazeSvg.setAttribute(
    "viewBox",
    `-0.125 -0.125 ${app.computer.maze_width(app.maze) + 0.25} ${app.computer.maze_height(app.maze) + 0.25}`,
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
    } else if (ev.target instanceof HTMLButtonElement) {
      const value = ev.target.value;
      if (value === "new") {
        newMaze(app);
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
    maze: null,
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

  newMaze(app);
}
