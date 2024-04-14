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
  nextMoveSvgPath: SVGElement;
  mazeSvg: SVGElement;
  optionsForm: HTMLFormElement;
  mazeSizeInput: HTMLInputElement;
  algorithmRadioGroup: RadioNodeList;
  computer: Computer;
  maze: Maze | null;
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

  const size = app.mazeSizeInput.valueAsNumber;
  const algorithm = app.algorithmRadioGroup.value;

  switch (algorithm) {
    case "binary tree":
      app.maze = app.computer.new_maze_binary_tree(size, size);
      break;
    case "sidewinder":
      app.maze = app.computer.new_maze_sidewinder(size, size);
      break;
    case "aldous broder":
      app.maze = app.computer.new_maze_aldous_broder(size, size);
      break;
    case "wilson's":
      app.maze = app.computer.new_maze_wilsons(size, size);
      break;
    default:
      return;
  }
  app.wallsSvgPath.setAttribute(
    "d",
    rustStringToJS(app.computer, app.computer.maze_walls_svg_path(app.maze)),
  );
  app.routeSvgPath.setAttribute(
    "d",
    rustStringToJS(app.computer, app.computer.maze_path_svg_path(app.maze)),
  );
  app.nextMoveSvgPath.setAttribute(
    "d",
    rustStringToJS(
      app.computer,
      app.computer.maze_next_move_svg_path(app.maze, 3),
    ),
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
    } else if (ev.target instanceof Node && app.mazeSvg.contains(ev.target)) {
      move(app, ev.x, ev.y);
    }
  };
}

function move(app: App, x: number, y: number) {
  if (app.maze === null) {
    return;
  }
  const m = (
    (app.mazeSvg as any).getScreenCTM() as DOMMatrixReadOnly
  ).inverse();
  const mazeX = Math.floor(m.a * x + m.c * y + m.e);
  const mazeY = Math.floor(m.b * x + m.d * y + m.f);
  app.computer.maze_move_to(app.maze, mazeX, mazeY);
  app.routeSvgPath.setAttribute(
    "d",
    rustStringToJS(app.computer, app.computer.maze_path_svg_path(app.maze)),
  );
}

function pointerMoveHandlerFactory(
  app: App,
): (this: HTMLElement | SVGElement, ev: PointerEvent) => void {
  return function pointerMoveHandler(ev) {
    if (
      ev instanceof PointerEvent &&
      ev.pointerType === "mouse" &&
      ev.buttons !== 1
    ) {
      return;
    }
    move(app, ev.x, ev.y);
  };
}

function lookupElements(
  window: WindowType,
): Omit<App, "computer" | "maze" | "window"> {
  const mazeSvg = window.document.querySelector<SVGElement>("#maze")!;
  const optionsForm = window.document.querySelector<HTMLFormElement>(
    "#optionsDialog form",
  )!;
  return {
    optionsDialog:
      window.document.querySelector<HTMLDialogElement>("#optionsDialog")!,
    linksDialog:
      window.document.querySelector<HTMLDialogElement>("#linksDialog")!,
    wallsSvgPath: mazeSvg.querySelector<SVGPathElement>("#walls")!,
    routeSvgPath: mazeSvg.querySelector<SVGPathElement>("#route")!,
    nextMoveSvgPath: mazeSvg.querySelector<SVGPathElement>("#next_move")!,
    mazeSizeInput: optionsForm.elements.namedItem("size") as HTMLInputElement,
    optionsForm,
    algorithmRadioGroup: optionsForm.elements.namedItem(
      "algorithm",
    ) as RadioNodeList,
    mazeSvg,
  };
}

export async function initialiseApp(window: WindowType) {
  const [computer, partialApp] = await Promise.all([
    initializeComputer(),
    lookupElements(window),
  ]);
  const app: App = {
    ...partialApp,
    computer,
    maze: null,
    window,
  };
  const clickHandler = clickHandlerFactory(app);
  const optionsInputHandler = () => newMaze(app);
  const popstateHandler = popstateHandlerFactory(app);
  const pointerMoveHandler = pointerMoveHandlerFactory(app);

  window.document.body.addEventListener("click", clickHandler);
  app.optionsForm.addEventListener("input", optionsInputHandler);
  window.addEventListener("popstate", popstateHandler);
  app.mazeSvg.addEventListener("pointermove", pointerMoveHandler);

  if (window.location.hash) {
    navigate(app, app.window.location.hash, false);
  }

  newMaze(app);
}
