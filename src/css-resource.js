/*eslint new-cap:0, padded-blocks:0*/
import {ViewResources, resource, ViewCompileInstruction} from 'aurelia-templating';
import {Loader} from 'aurelia-loader';
import {Container} from 'aurelia-dependency-injection';
import {relativeToFile} from 'aurelia-path';
import {DOM, FEATURE, PLATFORM} from 'aurelia-pal';

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

/**
 * inject css as a <link href="cssUrl" rel="stylesheet" /> tag in head
 */
function injectCssLinkTag(address: string, id?: string) {
  let url = PLATFORM.global.requirejs.toUrl(address);
  //remove heading '.' char
  let cssHref = url.replace(/^\./i, '');

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

  //create node
  let node = DOM.createElement('link');
  node.href = cssHref;
  node.rel = 'stylesheet';

  if (id) {
    node.id = id;
  }

  let headNode = DOM.querySelector('head');
  headNode.appendChild(node);
}

class CSSResource {

  constructor(address: string, injectAsLinkTag?: boolean) {
    this.address = address;
    this._scoped = null;
    this._global = false;
    this._globalInjectAsLinkTag = !!injectAsLinkTag;
    this._alreadyGloballyInjected = false;
  }

  initialize(container: Container, target: Function): void {
    this._scoped = new target(this);
  }

  register(registry: ViewResources, name?: string): void {
    if (name === 'scoped') {
      registry.registerViewEngineHooks(this._scoped);
    } else {
      this._global = true;
    }
  }

  load(container: Container): Promise<CSSResource> {
    return container.get(Loader)
      .loadText(this.address)
      .catch(err => null)
      .then(text => {
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
}

class CSSViewEngineHooks {
  constructor(owner: CSSResource) {
    this.owner = owner;
    this.css = null;
  }

  beforeCompile(content: DocumentFragment, resources: ViewResources, instruction: ViewCompileInstruction): void {
    if (instruction.targetShadowDOM) {
      DOM.injectStyles(this.css, content, true);
    } else if (FEATURE.scopedCSS) {
      let styleNode = DOM.injectStyles(this.css, content, true);
      styleNode.setAttribute('scoped', 'scoped');
    } else if (this._global && !this.owner._alreadyGloballyInjected) {
      //dead code? this._global never set to true.
      this.owner._alreadyGloballyInjected = true;
      if (this.owner._globalInjectAsLinkTag) {
        injectCssLinkTag(this.owner.address, this.owner.address);
      } else {
        DOM.injectStyles(text);
      }
    }
  }
}

export function _createCSSResource(address: string, injectAsLinkTag?: boolean): Function {
  @resource(new CSSResource(address, injectAsLinkTag))
  class ViewCSS extends CSSViewEngineHooks {}
  return ViewCSS;
}
