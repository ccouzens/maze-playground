const urls: Record<string, string> = {
  options: "#optionsDialog",
  links: "#linksDialog",
};

function navigate(key: string, pushState = true) {
  const selector = urls[key];

  if (selector) {
    const dialog = window.document.querySelector<HTMLDialogElement>(selector)!;
    dialog.showModal();
    if (pushState) {
      window.history.pushState(key, "", `#${key}`);
    }
    dialog.addEventListener(
      "close",
      function dialogClose() {
        if (history.state === key) {
          window.history.back();
        } else {
          window.history.replaceState(
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

function popstateHandler({ state }: PopStateEvent): void {
  if (state === null) {
    for (const dialog of window.document.querySelectorAll<HTMLDialogElement>(
      "dialog[open]",
    )) {
      dialog.close();
    }
  } else if (typeof state === "string") {
    navigate(state, false);
  }
}

function clickHandler(ev: MouseEvent): void {
  if (ev.target instanceof HTMLDialogElement) {
    ev.target.close();
  } else if (ev.target instanceof HTMLAnchorElement) {
    const hrefAttr = ev.target.getAttribute("href");
    if (hrefAttr?.startsWith("#")) {
      navigate(hrefAttr.slice(1));
      ev.preventDefault();
    }
  }
}

export function initialiseApp() {
  window.document.body.addEventListener("click", clickHandler);

  window.addEventListener("popstate", popstateHandler);

  if (window.location.hash) {
    navigate(window.location.hash.slice(1), false);
  }
}
