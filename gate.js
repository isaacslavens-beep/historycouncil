/* Simple password gate. Not real security: the page content is still in the HTML source. */
(function () {
  // SHA-256 of the shared password
  var HASH = "fe3fb7f9c6ed9a291fab2a00863895079cdbf21082aad497a728c07e23543961";

  // Unlocking sets a session cookie, so other pages stay unlocked until the browser closes
  var COOKIE = "hc_unlocked";
  if (document.cookie.split("; ").indexOf(COOKIE + "=" + HASH) !== -1) return;

  document.documentElement.classList.add("gated");

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Pages can leave some content visible above the prompt by marking it data-gate-public
    var publicEls = document.querySelectorAll("main [data-gate-public]");
    var inline = publicEls.length > 0;

    var gate = document.createElement("div");
    gate.className = inline ? "gate gate-inline" : "gate";
    gate.innerHTML =
      (inline ? '' : '<a href="index.html"><img class="gate-logo" src="history-council-logo.png" alt="History Council crest"></a>') +
      '<form class="gate-form">' +
        (inline ? '<h2>Wii Sports Members Only</h2>' : '<h1>Wii Sports Members Only</h1>') +
        '<p>Enter the Council password to continue.</p>' +
        '<label class="visually-hidden" for="gate-password">Password</label>' +
        '<input id="gate-password" type="password" autocomplete="current-password" required' + (inline ? '' : ' autofocus') + '>' +
        '<button type="submit">Enter</button>' +
        '<p class="gate-error" role="alert" hidden>Incorrect password.</p>' +
        (inline ? '' : '<a class="gate-back" href="index.html">Back to home</a>') +
      '</form>';

    if (inline) {
      publicEls[publicEls.length - 1].after(gate);
    } else {
      document.body.appendChild(gate);
    }

    var form = gate.querySelector("form");
    var input = gate.querySelector("input");
    var error = gate.querySelector(".gate-error");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(input.value).then(function (hash) {
        if (hash === HASH) {
          document.cookie = COOKIE + "=" + HASH + "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
          gate.remove();
          document.documentElement.classList.remove("gated");
        } else {
          error.hidden = false;
          input.value = "";
          input.focus();
        }
      });
    });
  });
})();
