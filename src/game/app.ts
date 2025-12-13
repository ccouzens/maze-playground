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
  navigator: {
    share: Window["navigator"]["share"];
  };
  location: {
    href: Window["location"]["href"];
  };
}

interface App {
  winDialog: HTMLDialogElement;
  wallsSvgPath: SVGPathElement;
  routeSvgPath: SVGPathElement;
  mazeSvg: SVGElement;
  optionsForm: HTMLFormElement;
  mazeSizeInput: HTMLInputElement;
  root: HTMLElement;
  algorithmRadioGroup: RadioNodeList;
  computer: Computer;
  maze: Maze | null;
  window: WindowType;
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
  app.mazeSvg.setAttribute(
    "viewBox",
    `-0.125 -0.125 ${app.computer.maze_width(app.maze) + 0.25} ${app.computer.maze_height(app.maze) + 0.25}`,
  );
  app.root.dataset["animation"] = `${Math.floor(Math.random() * 4) + 1}`;
  renderAfterMove(app);
}

function clickHandlerFactory(
  app: App,
): (ev: HTMLElementEventMap["click"]) => void {
  return function clickHandler(ev) {
    if (ev.target instanceof HTMLDialogElement) {
      ev.target.close();
    } else if (ev.target instanceof HTMLButtonElement) {
      const value = ev.target.value;
      if (value === "new") {
        newMaze(app);
      } else if (value === "share") {
        app.window.navigator.share({
          url: app.window.location.href,
          title: "Maze puzzle",
        });
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
  app.computer.maze_move_to(app.maze, Math.max(mazeX, 0), Math.max(mazeY, 0));
  renderAfterMove(app);
}

function pointerMoveHandlerFactory(app: App): (ev: PointerEvent) => void {
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

function keyDownHanderFactory(app: App): (ev: KeyboardEvent) => void {
  return function keyDownHandler(ev) {
    if (app.maze === null) {
      return;
    }
    if (ev.target instanceof Element && ev.target.closest("dialog") !== null) {
      return;
    }
    let direction: number | null = null;
    if (ev.key === "ArrowUp") {
      direction = 0;
    } else if (ev.key === "ArrowRight") {
      direction = 1;
    } else if (ev.key === "ArrowDown") {
      direction = 2;
    } else if (ev.key === "ArrowLeft") {
      direction = 3;
    }

    if (direction === null) {
      return;
    }

    if (app.computer.maze_move_direction(app.maze, direction)) {
      renderAfterMove(app);
    }
  };
}

function renderAfterMove(app: App) {
  if (app.maze !== null) {
    app.routeSvgPath.setAttribute(
      "d",
      rustStringToJS(app.computer, app.computer.maze_path_svg_path(app.maze)),
    );

    const won = app.computer.maze_is_solved(app.maze);
    if (won) {
      app.winDialog.showModal();
    }
    app.root.classList.toggle("win", won);
  }
}

function lookupElements(
  window: WindowType,
): Omit<App, "computer" | "maze" | "window"> {
  const mazeSvg = window.document.querySelector<SVGElement>("#maze")!;
  const optionsForm = window.document.querySelector<HTMLFormElement>(
    "#optionsDialog form",
  )!;
  return {
    winDialog: window.document.querySelector<HTMLDialogElement>("#winDialog")!,
    wallsSvgPath: mazeSvg.querySelector<SVGPathElement>("#walls")!,
    routeSvgPath: mazeSvg.querySelector<SVGPathElement>("#route")!,
    mazeSizeInput: optionsForm.elements.namedItem("size") as HTMLInputElement,
    optionsForm,
    algorithmRadioGroup: optionsForm.elements.namedItem(
      "algorithm",
    ) as RadioNodeList,
    mazeSvg,
    root: window.document.querySelector("html")!,
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
  const pointerMoveHandler = pointerMoveHandlerFactory(app);
  const keyDownHandler = keyDownHanderFactory(app);

  app.window.document.body.addEventListener("click", clickHandler);
  app.optionsForm.addEventListener("input", optionsInputHandler);
  app.mazeSvg.addEventListener("pointermove", pointerMoveHandler);
  app.window.addEventListener("keydown", keyDownHandler);

  app.root.classList.toggle("supports-share", "share" in window.navigator);

  newMaze(app);
}
