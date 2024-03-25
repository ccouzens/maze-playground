let poppingState = false;

function showDialog(selector: string, pushState = true) {
  const dialog = document.querySelector<HTMLDialogElement>(selector)!;
  dialog.showModal();
  dialog.addEventListener(
    "close",
    () => {
      if (!poppingState) {
        history.back();
      }
    },
    { once: true },
  );
  if (pushState) {
    history.pushState(selector, "");
  }
}

window.addEventListener("popstate", function listener({ state }) {
  poppingState = true;
  try {
    if (state === null) {
      for (const dialog of document.querySelectorAll<HTMLDialogElement>(
        "dialog[open]",
      )) {
        dialog.close();
      }
    } else if (typeof state === "string") {
      showDialog(state, false);
    }
  } finally {
    poppingState = false;
  }
});

document.getElementById("links")!.addEventListener("click", () => {
  showDialog("#linksDialog");
});
