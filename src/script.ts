import { putMazeOnPage } from "./main";

putMazeOnPage().catch((e) => {
  console.error("Error putting maze on page", e);
});
