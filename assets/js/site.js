/* Paw Protection Alliance - small site script: mobile menu, directory search and filters. */
(function () {
  document.documentElement.classList.remove("no-js");

  // ---- Mobile navigation ----
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1120) setOpen(false);
    });
  }

  // ---- Directory filters ----
  // A form.filter-bar[data-filter-for="X"] controls items inside [data-filter-list="X"].
  document.querySelectorAll("form[data-filter-for]").forEach(function (form) {
    var name = form.getAttribute("data-filter-for");
    var list = document.querySelector('[data-filter-list="' + name + '"]');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-item]"));
    var search = form.querySelector("[data-filter-search]");
    var selects = Array.prototype.slice.call(form.querySelectorAll("select[data-filter-key]"));
    var count = form.querySelector("[data-filter-count]");
    var empty = document.querySelector('[data-filter-empty="' + name + '"]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip-for="' + name + '"] [data-chip-value]'));
    var chipKey = chips.length ? chips[0].closest("[data-chip-key]").getAttribute("data-chip-key") : null;
    var chipValue = "";

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var terms = q ? q.split(/\s+/) : [];
      var shown = 0;
      items.forEach(function (el) {
        var hay = el.getAttribute("data-search") || "";
        var ok = terms.every(function (t) { return hay.indexOf(t) !== -1; });
        selects.forEach(function (s) {
          if (ok && s.value) ok = (el.getAttribute("data-" + s.getAttribute("data-filter-key")) || "") === s.value;
        });
        if (ok && chipKey && chipValue) ok = (el.getAttribute("data-" + chipKey) || "") === chipValue;
        el.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = "Showing " + shown + " of " + items.length + (items.length === 1 ? " record" : " records");
      if (empty) empty.classList.toggle("is-visible", shown === 0);
    }
    if (search) search.addEventListener("input", apply);
    selects.forEach(function (s) { s.addEventListener("change", apply); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chipValue = c.getAttribute("data-chip-value");
        chips.forEach(function (o) { o.setAttribute("aria-pressed", o === c ? "true" : "false"); });
        apply();
      });
    });
    // Preselect a category from the address, e.g. /research/?category=Wildlife
    var wanted = new URLSearchParams(window.location.search).get("category");
    if (wanted) {
      chips.forEach(function (c) { if (c.getAttribute("data-chip-value") === wanted) c.click(); });
      selects.forEach(function (s) {
        if (s.getAttribute("data-filter-key") === "animal_category") {
          Array.prototype.forEach.call(s.options, function (o) { if (o.value === wanted) s.value = wanted; });
        }
      });
    }
    apply();
  });
})();
