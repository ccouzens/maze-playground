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

document.body.addEventListener("click", function clickHander(ev) {
  if (ev.target instanceof HTMLDialogElement) {
    ev.target.close();
  } else if (ev.target instanceof HTMLButtonElement && ev.target.id) {
    navigate(ev.target.id);
  }
});

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

if (window.location.hash) {
  navigate(window.location.hash.slice(1), false);
}
