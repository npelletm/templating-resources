
import { ViewResources, resource, ViewCompileInstruction } from 'aurelia-templating';
import { Loader } from 'aurelia-loader';
import { Container } from 'aurelia-dependency-injection';
import { relativeToFile } from 'aurelia-path';
import { DOM, FEATURE, PLATFORM } from 'aurelia-pal';

let cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

function fixupCSSUrls(address, css) {
  if (typeof css !== 'string') {
    throw new Error(`Failed loading required CSS file: ${address}`);
  }
  return css.replace(cssUrlMatcher, (match, p1) => {
    let quote = p1.charAt(0);
    if (quote === '\'' || quote === '"') {
      p1 = p1.substr(1, p1.length - 2);
    }
    return 'url(\'' + relativeToFile(p1, address) + '\')';
  });
}

function injectCssLinkTag(address, id) {
  let url = PLATFORM.global.requirejs.toUrl(address);

  let cssHref = /^\./i.replace(url, '');

  if (id) {
    let oldLink = DOM.getElementById(id);
    if (oldLink) {
      let isLinkTag = oldLink.tagName.toLowerCase() === 'link';

      if (isLinkTag) {
        oldLink.href = cssHref;
        return;
      }

      throw new Error(`The provided id: '${id}' does not indicate a link tag.`);
    }
  }

  let node = DOM.createElement('link');
  node.href = cssHref;
  node.rel = 'stylesheet';

  if (id) {
    node.id = id;
  }

  let headNode = DOM.querySelector('head');
  headNode.appendChild(node);
}

let CSSResource = class CSSResource {

  constructor(address, injectAsLinkTag) {
    this.address = address;
    this._scoped = null;
    this._global = false;
    this._globalInjectAsLinkTag = !!injectAsLinkTag;
    this._alreadyGloballyInjected = false;
  }

  initialize(container, target) {
    this._scoped = new target(this);
  }

  register(registry, name) {
    if (name === 'scoped') {
      registry.registerViewEngineHooks(this._scoped);
    } else {
      this._global = true;
    }
  }

  load(container) {
    return container.get(Loader).loadText(this.address).catch(err => null).then(text => {
      text = fixupCSSUrls(this.address, text);
      this._scoped.css = text;
      if (this._global) {
        this._alreadyGloballyInjected = true;
        if (this._globalInjectAsLinkTag) {
          injectCssLinkTag(this.address, this.address);
        } else {
          DOM.injectStyles(text);
        }
      }
    });
  }
};
let CSSViewEngineHooks = class CSSViewEngineHooks {
  constructor(owner) {
    this.owner = owner;
    this.css = null;
  }

  beforeCompile(content, resources, instruction) {
    if (instruction.targetShadowDOM) {
      DOM.injectStyles(this.css, content, true);
    } else if (FEATURE.scopedCSS) {
      let styleNode = DOM.injectStyles(this.css, content, true);
      styleNode.setAttribute('scoped', 'scoped');
    } else if (this._global && !this.owner._alreadyGloballyInjected) {
      this.owner._alreadyGloballyInjected = true;
      if (this.owner._globalInjectAsLinkTag) {
        injectCssLinkTag(this.owner.address, this.owner.address);
      } else {
        DOM.injectStyles(text);
      }
    }
  }
};


export function _createCSSResource(address, injectAsLinkTag) {
  var _dec, _class;

  let ViewCSS = (_dec = resource(new CSSResource(address, injectAsLinkTag)), _dec(_class = class ViewCSS extends CSSViewEngineHooks {}) || _class);

  return ViewCSS;
}