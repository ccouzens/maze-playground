const urls: Record<string, string> = {
  links: "#linksDialog",
};

function navigate(key: string, pushState = true) {
  const selector = urls[key];

  if (selector) {
    const dialog = document.querySelector<HTMLDialogElement>(selector)!;
    dialog.showModal();
    if (pushState) {
      history.pushState(key, "", `#${key}`);
    }
    dialog.addEventListener(
      "close",
      function dialogClose() {
        if (history.state === key) {
          history.back();
        } else {
          history.replaceState(
            null,
            "",
            window.location.href.replace(/#.+/, ""),
          );
        }
      },
      { once: true },
    );
  }
}

window.addEventListener("popstate", function listener({ state }) {
  if (state === null) {
    for (const dialog of document.querySelectorAll<HTMLDialogElement>(
      "dialog[open]",
    )) {
      dialog.close();
    }
  } else if (typeof state === "string") {
    navigate(state, false);
  }
});

document.getElementById("links")!.addEventListener("click", () => {
  navigate("links");
});

if (window.location.hash) {
  navigate(window.location.hash.slice(1), false);
}
