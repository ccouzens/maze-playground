import { type Computer, type Maze } from "../computer";

export interface RenderProps {
  computer: Computer;
  maze: Maze;
  imageBitmapFactory: () => Promise<ImageBitmap>;
}

export type InitRenderer = () => Promise<(props: RenderProps) => Promise<void>>;
