/**
 * Chrome DevTools Live Metrics & Soft Navigation Crash Guard
 * Executes synchronously in <head> before any other script.
 * Suppresses known Chromium upstream issue:
 * "Uncaught TypeError: Cannot read properties of undefined (reading 'startTime') at et.reportAllChanges"
 */
(function () {
  if (typeof window === "undefined") return;

  function isIgnoredError(err, msg, stack) {
    var text = String(msg || "") + " " + String(stack || "") + " " + (err ? String(err.stack || err.message || "") : "");
    return (
      text.indexOf("reportAllChanges") !== -1 ||
      (text.indexOf("startTime") !== -1 && (text.indexOf("undefined") !== -1 || text.indexOf("reading") !== -1))
    );
  }

  // 1. window.onerror suppression (returning true prevents Chrome DevTools console logging)
  var prevOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (isIgnoredError(error, message, error ? error.stack : "")) {
      return true;
    }
    if (typeof prevOnError === "function") {
      return prevOnError.apply(this, arguments);
    }
    return false;
  };

  // 2. Global capture-phase error event listener
  window.addEventListener(
    "error",
    function (event) {
      var msg = (event && event.message) || (event && event.error && event.error.message) || "";
      var stack = (event && event.error && event.error.stack) || "";
      if (isIgnoredError(event && event.error, msg, stack)) {
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
        return true;
      }
    },
    true
  );

  // 3. Unhandled promise rejections
  window.addEventListener(
    "unhandledrejection",
    function (event) {
      var reason = event && event.reason;
      var msg = (reason && (reason.message || String(reason))) || "";
      var stack = (reason && reason.stack) || "";
      if (isIgnoredError(reason, msg, stack)) {
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
      }
    },
    true
  );

  // 4. Intercept setTimeout (catches "at n.timeout (<anonymous>:2:5652)")
  var originalSetTimeout = window.setTimeout;
  window.setTimeout = function (handler, timeout) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof handler === "function") {
      var wrappedHandler = function () {
        try {
          return handler.apply(this, args);
        } catch (err) {
          if (isIgnoredError(err, err ? err.message : "", err ? err.stack : "")) {
            return;
          }
          throw err;
        }
      };
      return originalSetTimeout.apply(this, [wrappedHandler, timeout]);
    }
    return originalSetTimeout.apply(this, arguments);
  };

  // 5. Intercept requestIdleCallback
  if (typeof window.requestIdleCallback === "function") {
    var originalRIC = window.requestIdleCallback;
    window.requestIdleCallback = function (callback, options) {
      if (typeof callback === "function") {
        var wrappedCallback = function (deadline) {
          try {
            return callback(deadline);
          } catch (err) {
            if (isIgnoredError(err, err ? err.message : "", err ? err.stack : "")) {
              return;
            }
            throw err;
          }
        };
        return originalRIC.call(this, wrappedCallback, options);
      }
      return originalRIC.apply(this, arguments);
    };
  }

  // 6. Intercept requestAnimationFrame
  if (typeof window.requestAnimationFrame === "function") {
    var originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (callback) {
      if (typeof callback === "function") {
        var wrappedRAF = function (timestamp) {
          try {
            return callback(timestamp);
          } catch (err) {
            if (isIgnoredError(err, err ? err.message : "", err ? err.stack : "")) {
              return;
            }
            throw err;
          }
        };
        return originalRAF.call(this, wrappedRAF);
      }
      return originalRAF.apply(this, arguments);
    };
  }

  // 7. Intercept PerformanceObserver
  if (typeof window.PerformanceObserver !== "undefined") {
    try {
      var OriginalPO = window.PerformanceObserver;
      var PatchedPO = function (callback) {
        var wrappedCallback = function (entries, observer) {
          try {
            return callback(entries, observer);
          } catch (err) {
            if (isIgnoredError(err, err ? err.message : "", err ? err.stack : "")) {
              return;
            }
            throw err;
          }
        };
        return new OriginalPO(wrappedCallback);
      };
      PatchedPO.prototype = OriginalPO.prototype;
      PatchedPO.supportedEntryTypes = OriginalPO.supportedEntryTypes;
      window.PerformanceObserver = PatchedPO;
    } catch (e) {}
  }

  // 8. Console.error filter
  if (typeof console !== "undefined" && console.error) {
    var originalConsoleError = console.error;
    console.error = function () {
      var text = Array.prototype.slice
        .call(arguments)
        .map(function (a) {
          return (a && (a.stack || a.message)) || String(a);
        })
        .join(" ");
      if (
        text.indexOf("reportAllChanges") !== -1 ||
        (text.indexOf("startTime") !== -1 && text.indexOf("reading") !== -1)
      ) {
        return;
      }
      return originalConsoleError.apply(console, arguments);
    };
  }
})();
