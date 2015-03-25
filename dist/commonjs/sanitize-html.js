"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Behavior = require("aurelia-templating").Behavior;

var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

var SanitizeHtmlValueConverter = exports.SanitizeHtmlValueConverter = (function () {
  function SanitizeHtmlValueConverter() {
    _classCallCheck(this, SanitizeHtmlValueConverter);

    this.sanitizer = SanitizeHtmlValueConverter.defaultSanitizer;
  }

  _prototypeProperties(SanitizeHtmlValueConverter, {
    metadata: {
      value: function metadata() {
        return Behavior.valueConverter("sanitizeHtml");
      },
      writable: true,
      configurable: true
    },
    defaultSanitizer: {
      value: function defaultSanitizer(untrustedMarkup) {
        return untrustedMarkup.replace(SCRIPT_REGEX, "");
      },
      writable: true,
      configurable: true
    }
  }, {
    toView: {
      value: function toView(untrustedMarkup) {
        if (untrustedMarkup === null) {
          return null;
        }

        return this.sanitizer(untrustedMarkup);
      },
      writable: true,
      configurable: true
    }
  });

  return SanitizeHtmlValueConverter;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});