/* LVS Mall website runtime: renders the interactive templates (brand filters, mall map, FAQ). No dependencies. */
(function () {
  'use strict';
  var LVS = window.LVS = { comps: {}, tpls: {}, inst: {}, roots: [] };
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (p) {
    if (typeof p === 'function') p = p(this.state);
    for (var k in p) this.state[k] = p[k];
    schedule();
  };
  DCLogic.prototype.forceUpdate = function () { schedule(); };
  window.DCLogic = DCLogic;

  var HOLE = /\{\{([^}]+)\}\}/g;
  function lookup(scope, expr) {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return +expr;
    if (/^(['"]).*\1$/.test(expr)) return expr.slice(1, -1);
    var v = scope, parts = expr.split('.');
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function evalAttr(val, scope) {
    var m = val.match(/^\s*\{\{([^}]+)\}\}\s*$/);
    if (m) return lookup(scope, m[1]);
    return val.replace(HOLE, function (_, e) { var v = lookup(scope, e); return v == null ? '' : String(v); });
  }
  function kids(nodes, scope, parent, ctx) { for (var i = 0; i < nodes.length; i++) node(nodes[i], scope, parent, ctx); }
  function node(n, scope, parent, ctx) {
    if (n.nodeType === 3) {
      var t = n.nodeValue;
      parent.appendChild(document.createTextNode(t.indexOf('{{') < 0 ? t : t.replace(HOLE, function (_, e) { var v = lookup(scope, e); return v == null ? '' : String(v); })));
      return;
    }
    if (n.nodeType !== 1) return;
    var tag = n.localName;
    if (tag === 'sc-for') {
      var list = evalAttr(n.getAttribute('list'), scope) || [], as = n.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) { var s = Object.create(scope); s[as] = list[i]; s.$index = i; kids(n.childNodes, s, parent, ctx); }
      return;
    }
    if (tag === 'sc-if') { if (evalAttr(n.getAttribute('value'), scope)) kids(n.childNodes, scope, parent, ctx); return; }
    if (tag === 'dc-import') {
      var name = n.getAttribute('name'), props = {};
      for (var j = 0; j < n.attributes.length; j++) {
        var a = n.attributes[j];
        if (a.name === 'name' || a.name.indexOf('hint-') === 0) continue;
        props[a.name.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })] = evalAttr(a.value, scope);
      }
      ctx.count[name] = (ctx.count[name] || 0) + 1;
      var key = ctx.path + '/' + name + '#' + ctx.count[name];
      var inst = LVS.inst[key] || (LVS.inst[key] = new LVS.comps[name](props));
      inst.props = props;
      kids(LVS.tpls[name], inst.renderVals(), parent, { path: key, count: {} });
      return;
    }
    var ns = n.namespaceURI, el = ns && ns !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(ns, n.localName) : document.createElement(n.localName);
    for (var k = 0; k < n.attributes.length; k++) {
      var at = n.attributes[k], an = at.name;
      if (an.indexOf('hint-') === 0) continue;
      if (an.indexOf('on') === 0 && at.value.indexOf('{{') >= 0) {
        var fn = evalAttr(at.value, scope);
        if (typeof fn === 'function') el.addEventListener(an.slice(2), fn);
        continue;
      }
      var v = at.value.indexOf('{{') >= 0 ? evalAttr(at.value, scope) : at.value;
      if (v === undefined || v === null || v === false) continue;
      if (an === 'value' && 'value' in el) el.value = v;
      el.setAttribute(an, v === true ? '' : String(v));
    }
    kids(n.childNodes, scope, el, ctx);
    parent.appendChild(el);
  }
  function pathOf(el, root) { var p = []; while (el && el !== root) { var i = 0, s = el; while ((s = s.previousElementSibling)) i++; p.unshift(i); el = el.parentElement; } return p; }
  function byPath(root, p) { var el = root; for (var i = 0; i < p.length && el; i++) el = el.children[p[i]]; return el; }
  function render(r) {
    var scrolls = [];
    r.el.querySelectorAll('*').forEach(function (e) { if (e.scrollTop || e.scrollLeft) scrolls.push([pathOf(e, r.el), e.scrollTop, e.scrollLeft]); });
    var act = document.activeElement, label = act && r.el.contains(act) ? act.getAttribute('aria-label') : null, sel = label && act.selectionStart;
    var frag = document.createDocumentFragment();
    kids(LVS.tpls[r.name], r.inst.renderVals(), frag, { path: r.name, count: {} });
    r.el.replaceChildren(frag);
    scrolls.forEach(function (s) { var e = byPath(r.el, s[0]); if (e) { e.scrollTop = s[1]; e.scrollLeft = s[2]; } });
    if (label) { var f = r.el.querySelector('[aria-label="' + label.replace(/"/g, '\\"') + '"]'); if (f) { f.focus(); if (sel != null && f.setSelectionRange) f.setSelectionRange(sel, sel); } }
  }
  var pending = false;
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; LVS.roots.forEach(render); }); }
  LVS.schedule = schedule;
  LVS.mount = function (name, el) {
    document.querySelectorAll('template[data-dc]').forEach(function (t) { LVS.tpls[t.getAttribute('data-dc')] = t.content.childNodes; });
    var r = { name: name, el: el, inst: new LVS.comps[name]({}) };
    LVS.roots.push(r); render(r);
    if (location.hash) { var target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView(); }
  };
  function fit() { window.LVS_FIT = Math.min(1.19, Math.max(0.3, (document.documentElement.clientWidth - 34) / 1180)); }
  fit(); window.addEventListener('resize', function () { fit(); schedule(); });
})();
