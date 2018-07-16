'use strict';

System.register(['aurelia-templating', 'aurelia-loader', 'aurelia-dependency-injection', 'aurelia-path', 'aurelia-pal'], function (_export, _context) {
  "use strict";

  var ViewResources, resource, ViewCompileInstruction, Loader, Container, relativeToFile, DOM, FEATURE, PLATFORM, cssUrlMatcher, CSSResource, CSSViewEngineHooks;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
      throw new Error('Failed loading required CSS file: ' + address);
    }
    return css.replace(cssUrlMatcher, function (match, p1) {
      var quote = p1.charAt(0);
      if (quote === '\'' || quote === '"') {
        p1 = p1.substr(1, p1.length - 2);
      }
      return 'url(\'' + relativeToFile(p1, address) + '\')';
    });
  }

  function injectCssLinkTag(address, id) {
    var url = PLATFORM.global.requirejs.toUrl(address);

    var cssHref = /^\./i.replace(url, '');

    if (id) {
      var oldLink = DOM.getElementById(id);
      if (oldLink) {
        var isLinkTag = oldLink.tagName.toLowerCase() === 'link';

        if (isLinkTag) {
          oldLink.href = cssHref;
          return;
        }

        throw new Error('The provided id: \'' + id + '\' does not indicate a link tag.');
      }
    }

    var node = DOM.createElement('link');
    node.href = cssHref;
    node.rel = 'stylesheet';

    if (id) {
      node.id = id;
    }

    var headNode = DOM.querySelector('head');
    headNode.appendChild(node);
  }

  function _createCSSResource(address, injectAsLinkTag) {
    var _dec, _class;

    var ViewCSS = (_dec = resource(new CSSResource(address, injectAsLinkTag)), _dec(_class = function (_CSSViewEngineHooks) {
      _inherits(ViewCSS, _CSSViewEngineHooks);

      function ViewCSS() {
        

        return _possibleConstructorReturn(this, _CSSViewEngineHooks.apply(this, arguments));
      }

      return ViewCSS;
    }(CSSViewEngineHooks)) || _class);

    return ViewCSS;
  }

  _export('_createCSSResource', _createCSSResource);

  return {
    setters: [function (_aureliaTemplating) {
      ViewResources = _aureliaTemplating.ViewResources;
      resource = _aureliaTemplating.resource;
      ViewCompileInstruction = _aureliaTemplating.ViewCompileInstruction;
    }, function (_aureliaLoader) {
      Loader = _aureliaLoader.Loader;
    }, function (_aureliaDependencyInjection) {
      Container = _aureliaDependencyInjection.Container;
    }, function (_aureliaPath) {
      relativeToFile = _aureliaPath.relativeToFile;
    }, function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
      FEATURE = _aureliaPal.FEATURE;
      PLATFORM = _aureliaPal.PLATFORM;
    }],
    execute: function () {
      cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

      CSSResource = function () {
        function CSSResource(address, injectAsLinkTag) {
          

          this.address = address;
          this._scoped = null;
          this._global = false;
          this._globalInjectAsLinkTag = !!injectAsLinkTag;
          this._alreadyGloballyInjected = false;
        }

        CSSResource.prototype.initialize = function initialize(container, target) {
          this._scoped = new target(this);
        };

        CSSResource.prototype.register = function register(registry, name) {
          if (name === 'scoped') {
            registry.registerViewEngineHooks(this._scoped);
          } else {
            this._global = true;
          }
        };

        CSSResource.prototype.load = function load(container) {
          var _this = this;

          return container.get(Loader).loadText(this.address).catch(function (err) {
            return null;
          }).then(function (text) {
            text = fixupCSSUrls(_this.address, text);
            _this._scoped.css = text;
            if (_this._global) {
              _this._alreadyGloballyInjected = true;
              if (_this._globalInjectAsLinkTag) {
                injectCssLinkTag(_this.address, _this.address);
              } else {
                DOM.injectStyles(text);
              }
            }
          });
        };

        return CSSResource;
      }();

      CSSViewEngineHooks = function () {
        function CSSViewEngineHooks(owner) {
          

          this.owner = owner;
          this.css = null;
        }

        CSSViewEngineHooks.prototype.beforeCompile = function beforeCompile(content, resources, instruction) {
          if (instruction.targetShadowDOM) {
            DOM.injectStyles(this.css, content, true);
          } else if (FEATURE.scopedCSS) {
            var styleNode = DOM.injectStyles(this.css, content, true);
            styleNode.setAttribute('scoped', 'scoped');
          } else if (this._global && !this.owner._alreadyGloballyInjected) {
            this.owner._alreadyGloballyInjected = true;
            if (this.owner._globalInjectAsLinkTag) {
              injectCssLinkTag(this.owner.address, this.owner.address);
            } else {
              DOM.injectStyles(text);
            }
          }
        };

        return CSSViewEngineHooks;
      }();
    }
  };
});