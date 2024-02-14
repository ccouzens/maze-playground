import { putMazeOnPage } from "./index";

putMazeOnPage().catch((e) => {
  console.error("Error putting maze on page", e);
});
