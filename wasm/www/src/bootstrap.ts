import { putMazeOnPage } from ".";

putMazeOnPage().catch((e) => {
  console.error("Error putting maze on page", e);
});
