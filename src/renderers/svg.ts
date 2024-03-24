import { rustStringToJS } from "../computer";
import { type InitRenderer } from "./type";

export const svg: InitRenderer = function initSvg() {
  const svg = document.querySelector<SVGElement>("#svg")!;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  svg.append(path);
  return Promise.resolve(function renderSvg({ computer, maze }) {
    svg.setAttribute(
      "viewBox",
      `-0.125 -0.125 ${computer.maze_width(maze) + 0.25} ${computer.maze_height(maze) + 0.25}`,
    );
    path.setAttribute(
      "d",
      rustStringToJS(computer, computer.maze_svg_path(maze)),
    );
    return Promise.resolve();
  });
};
