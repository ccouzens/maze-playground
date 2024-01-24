import { Maze } from "../pkg";

const m = new Maze(10, 10);

const svg = document.getElementById("svg");
svg.setAttribute("viewBox", `-1 -1 ${m.width + 2} ${m.height + 2}`);
const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
svgPath.setAttribute("d", m.to_svg_path(m.width, m.height));
svg.append(svgPath);

console.log(m.toString());
