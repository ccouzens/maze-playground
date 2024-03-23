import { type Computer, type Maze } from "../computer";

export interface RenderProps {
  computer: Computer;
  maze: Maze;
  imageBitmapFactory: () => Promise<ImageBitmap>;
}

export interface Renderer<T> {
  init: () => Promise<T>;
  render: (props: RenderProps, state: T) => Promise<void>;
}
