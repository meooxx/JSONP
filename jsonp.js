function Jsonp(opts) {
  this.opts = opts;
  this.suffix = opts.jsonpCallback || "callback";
  this.callbackName = opts.callbackName || generateFuncName();
  const scriptEle = document.createElement("script");
  const abort = this.abort.bind(this)

  scriptEle.onerror = scriptEle.onload = function(e) {
    if (e && e.type === "error") {
      abort();
    } else {
      setTimeout(abort, 0);
    }
  };
  this.scriptEle = scriptEle;
}

let events = {};

Jsonp.prototype.on = function(event, f) {
  events[event] = f;
};

Jsonp.prototype.abort = function() {
  event = {};
  removeNode(this.scriptEle);
  clearFunction();
};

Jsonp.prototype.open = function(_, url) {
  const { callbackName, suffix, scriptEle, opts } = this;
  window[callbackName] = function(data) {
    events["load"] &&
      events["load"]({
        status: 200,
        statusText: "ok",
        response: data
      });
    this.clearFunction(callbackName);
  };

  const headEle = document.getElementsByTagName("head")[0];
  url += url.indexOf("?") === -1 ? "?" : "&";

  scriptEle.setAttribute("src", `${url}${suffix}=${callbackName}`);
  headEle.insertBefore(scriptEle, headEle.firstChild);
  if (opts.timeout) {
    setTimeout(() => {
      events["timeout"] && events["timeout"]();
      this.abort;
    }, opts.timeout);
  }
};

const f = document.createDocumentFragment();
function removeNode(node) {
  f.appendChild(node); // this action will move node from dom to domFragment
  f.removeChild(node); // remove node from domFragment
}

function clearFunction(callbackName) {
  window[callbackName] = null;
}

function generateFuncName() {
  const reg = /0\./;
  return ("jsonp" + Math.random()).replace(reg, "");
}
