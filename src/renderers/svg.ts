import { rustStringToJS } from "../computer";
import { Renderer } from "./type";

interface State {
  svg: SVGElement;
  path: SVGPathElement;
}

export const svg: Renderer<State> = {
  init() {
    const svg = document.querySelector<SVGElement>("#svg")!;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.append(path);
    return Promise.resolve({ svg, path });
  },

  render({ computer, maze }, { svg, path }) {
    svg.setAttribute(
      "viewBox",
      `-0.125 -0.125 ${computer.maze_width(maze) + 0.25} ${computer.maze_height(maze) + 0.25}`,
    );
    path.setAttribute(
      "d",
      rustStringToJS(computer, computer.maze_svg_path(maze)),
    );
    return Promise.resolve();
  },
};
