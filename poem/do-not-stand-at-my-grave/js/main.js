(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".running-head");
  var cover = document.getElementById("cover");
  var nodes = document.querySelectorAll("[data-reveal]");

  if (reduce) {
    document.documentElement.classList.add("reduce-motion");
    nodes.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  if (header && cover && "IntersectionObserver" in window) {
    var headIo = new IntersectionObserver(
      function (entries) {
        header.classList.toggle("is-shown", !entries[0].isIntersecting);
      },
      { threshold: 0.12 }
    );
    headIo.observe(cover);
  }
})();
