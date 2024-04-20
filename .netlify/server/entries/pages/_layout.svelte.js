import { l as set_current_component, r as run_all, o as current_component, c as create_ssr_component, p as add_attribute, q as onDestroy, t as get_store_value, u as createEventDispatcher, b as setContext, g as getContext, d as compute_rest_props, f as spread, j as escape_object, h as escape_attribute_value, s as subscribe, n as noop$1, e as escape, v as validate_component, w as set_store_value, x as identity, k as each } from "../../chunks/ssr.js";
import { d as derived, w as writable, r as readable, a as readonly } from "../../chunks/index.js";
import { dequal } from "dequal";
import { o as onMount } from "../../chunks/hooks.server.js";
import { nanoid } from "nanoid/non-secure";
import { flip, offset, shift, arrow, size, autoUpdate, computePosition } from "@floating-ui/dom";
import { createFocusTrap as createFocusTrap$1 } from "focus-trap";
import "clsx";
import { tv } from "tailwind-variants";
import { c as cn, f as flyAndScale, a as cubicOut } from "../../chunks/utils.js";
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
function is_void(name2) {
  return void_element_names.test(name2) || name2.toLowerCase() === "!doctype";
}
let timeoutAction;
let timeoutEnable;
function withoutTransition(action) {
  if (typeof document === "undefined")
    return;
  clearTimeout(timeoutAction);
  clearTimeout(timeoutEnable);
  const style = document.createElement("style");
  const css = document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);
  style.appendChild(css);
  const disable = () => document.head.appendChild(style);
  const enable = () => document.head.removeChild(style);
  if (typeof window.getComputedStyle !== "undefined") {
    disable();
    action();
    window.getComputedStyle(style).opacity;
    enable();
    return;
  }
  if (typeof window.requestAnimationFrame !== "undefined") {
    disable();
    action();
    window.requestAnimationFrame(enable);
    return;
  }
  disable();
  timeoutAction = window.setTimeout(() => {
    action();
    timeoutEnable = window.setTimeout(enable, 120);
  }, 120);
}
const noopStorage = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getItem: (_key) => null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setItem: (_key, _value) => {
  }
};
const isBrowser$2 = typeof document !== "undefined";
const modes = ["dark", "light", "system"];
const localStorageKey = "mode-watcher-mode";
const userPrefersMode = createUserPrefersMode();
const systemPrefersMode = createSystemMode();
const themeColors = writable(void 0);
const disableTransitions = writable(true);
createDerivedMode();
function createUserPrefersMode() {
  const defaultValue = "system";
  const storage = isBrowser$2 ? localStorage : noopStorage;
  const initialValue = storage.getItem(localStorageKey);
  let value = isValidMode(initialValue) ? initialValue : defaultValue;
  const { subscribe: subscribe2, set: _set } = writable(value, () => {
    if (!isBrowser$2)
      return;
    const handler = (e) => {
      if (e.key !== localStorageKey)
        return;
      const newValue = e.newValue;
      if (isValidMode(newValue)) {
        _set(value = newValue);
      } else {
        _set(value = defaultValue);
      }
    };
    addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  });
  function set(v) {
    _set(value = v);
    storage.setItem(localStorageKey, value);
  }
  return {
    subscribe: subscribe2,
    set
  };
}
function createSystemMode() {
  const defaultValue = void 0;
  let track = true;
  const { subscribe: subscribe2, set } = writable(defaultValue, () => {
    if (!isBrowser$2)
      return;
    const handler = (e) => {
      if (!track)
        return;
      set(e.matches ? "light" : "dark");
    };
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    mediaQueryState.addEventListener("change", handler);
    return () => mediaQueryState.removeEventListener("change", handler);
  });
  function query() {
    if (!isBrowser$2)
      return;
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    set(mediaQueryState.matches ? "light" : "dark");
  }
  function tracking(active) {
    track = active;
  }
  return {
    subscribe: subscribe2,
    query,
    tracking
  };
}
function createDerivedMode() {
  const { subscribe: subscribe2 } = derived([userPrefersMode, systemPrefersMode, themeColors, disableTransitions], ([$userPrefersMode, $systemPrefersMode, $themeColors, $disableTransitions]) => {
    if (!isBrowser$2)
      return void 0;
    const derivedMode = $userPrefersMode === "system" ? $systemPrefersMode : $userPrefersMode;
    function update2() {
      const htmlEl = document.documentElement;
      const themeColorEl = document.querySelector('meta[name="theme-color"]');
      if (derivedMode === "light") {
        htmlEl.classList.remove("dark");
        htmlEl.style.colorScheme = "light";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.light);
        }
      } else {
        htmlEl.classList.add("dark");
        htmlEl.style.colorScheme = "dark";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.dark);
        }
      }
    }
    if ($disableTransitions) {
      withoutTransition(update2);
    } else {
      update2();
    }
    return derivedMode;
  });
  return {
    subscribe: subscribe2
  };
}
function isValidMode(value) {
  if (typeof value !== "string")
    return false;
  return modes.includes(value);
}
function setInitialMode(defaultMode, themeColors2) {
  const rootEl = document.documentElement;
  const mode = localStorage.getItem("mode-watcher-mode") || defaultMode;
  const light = mode === "light" || mode === "system" && window.matchMedia("(prefers-color-scheme: light)").matches;
  rootEl.classList[light ? "remove" : "add"]("dark");
  rootEl.style.colorScheme = light ? "light" : "dark";
  if (themeColors2) {
    const themeMetaEl = document.querySelector('meta[name="theme-color"]');
    if (themeMetaEl) {
      themeMetaEl.setAttribute("content", mode === "light" ? themeColors2.light : themeColors2.dark);
    }
  }
  localStorage.setItem("mode-watcher-mode", mode);
}
const Mode_watcher = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { track = true } = $$props;
  let { defaultMode = "system" } = $$props;
  let { themeColors: themeColors$1 = void 0 } = $$props;
  let { disableTransitions: disableTransitions$1 = true } = $$props;
  themeColors.set(themeColors$1);
  disableTransitions.set(disableTransitions$1);
  const args = `"${defaultMode}"${themeColors$1 ? `, ${JSON.stringify(themeColors$1)}` : ""}`;
  if ($$props.track === void 0 && $$bindings.track && track !== void 0)
    $$bindings.track(track);
  if ($$props.defaultMode === void 0 && $$bindings.defaultMode && defaultMode !== void 0)
    $$bindings.defaultMode(defaultMode);
  if ($$props.themeColors === void 0 && $$bindings.themeColors && themeColors$1 !== void 0)
    $$bindings.themeColors(themeColors$1);
  if ($$props.disableTransitions === void 0 && $$bindings.disableTransitions && disableTransitions$1 !== void 0)
    $$bindings.disableTransitions(disableTransitions$1);
  return `${$$result.head += `<!-- HEAD_svelte-cpyj77_START -->${themeColors$1 ? `   <meta name="theme-color"${add_attribute("content", themeColors$1.dark, 0)}>` : ``}<!-- HTML_TAG_START -->${`<script nonce="%sveltekit.nonce%">(` + setInitialMode.toString() + `)(` + args + `);<\/script>`}<!-- HTML_TAG_END --><!-- HEAD_svelte-cpyj77_END -->`, ""}`;
});
function back(array, index, increment, loop = true) {
  const previousIndex = index - increment;
  if (previousIndex <= 0) {
    return loop ? array[array.length - 1] : array[0];
  }
  return array[previousIndex];
}
function forward(array, index, increment, loop = true) {
  const nextIndex = index + increment;
  if (nextIndex > array.length - 1) {
    return loop ? array[0] : array[array.length - 1];
  }
  return array[nextIndex];
}
function next(array, index, loop = true) {
  if (index === array.length - 1) {
    return loop ? array[0] : array[index];
  }
  return array[index + 1];
}
function prev(array, currentIndex, loop = true) {
  if (currentIndex <= 0) {
    return loop ? array[array.length - 1] : array[0];
  }
  return array[currentIndex - 1];
}
function last(array) {
  return array[array.length - 1];
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function toggle(item, array, compare = dequal) {
  const itemIdx = array.findIndex((innerItem) => compare(innerItem, item));
  if (itemIdx !== -1) {
    array.splice(itemIdx, 1);
  } else {
    array.push(item);
  }
  return array;
}
function styleToString$3(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
function disabledAttr(disabled) {
  return disabled ? true : void 0;
}
({
  type: "hidden",
  "aria-hidden": true,
  hidden: true,
  tabIndex: -1,
  style: styleToString$3({
    position: "absolute",
    opacity: 0,
    "pointer-events": "none",
    margin: 0,
    transform: "translateX(-100%)"
  })
});
function portalAttr(portal) {
  if (portal !== null) {
    return "";
  }
  return void 0;
}
function lightable(value) {
  function subscribe2(run) {
    run(value);
    return () => {
    };
  }
  return { subscribe: subscribe2 };
}
function getElementByMeltId(id) {
  if (!isBrowser$1)
    return null;
  const el = document.querySelector(`[data-melt-id="${id}"]`);
  return isHTMLElement$1(el) ? el : null;
}
const hiddenAction = (obj) => {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((key) => key !== "action");
    }
  });
};
const isFunctionWithParams = (fn) => {
  return typeof fn === "function";
};
makeElement("empty");
function makeElement(name2, args) {
  const { stores, action, returned } = args ?? {};
  const derivedStore = (() => {
    if (stores && returned) {
      return derived(stores, (values) => {
        const result = returned(values);
        if (isFunctionWithParams(result)) {
          const fn = (...args2) => {
            return hiddenAction({
              ...result(...args2),
              [`data-melt-${name2}`]: "",
              action: action ?? noop
            });
          };
          fn.action = action ?? noop;
          return fn;
        }
        return hiddenAction({
          ...result,
          [`data-melt-${name2}`]: "",
          action: action ?? noop
        });
      });
    } else {
      const returnedFn = returned;
      const result = returnedFn?.();
      if (isFunctionWithParams(result)) {
        const resultFn = (...args2) => {
          return hiddenAction({
            ...result(...args2),
            [`data-melt-${name2}`]: "",
            action: action ?? noop
          });
        };
        resultFn.action = action ?? noop;
        return lightable(resultFn);
      }
      return lightable(hiddenAction({
        ...result,
        [`data-melt-${name2}`]: "",
        action: action ?? noop
      }));
    }
  })();
  const actionFn = action ?? (() => {
  });
  actionFn.subscribe = derivedStore.subscribe;
  return actionFn;
}
function createElHelpers(prefix) {
  const name2 = (part) => part ? `${prefix}-${part}` : prefix;
  const attribute = (part) => `data-melt-${prefix}${part ? `-${part}` : ""}`;
  const selector = (part) => `[data-melt-${prefix}${part ? `-${part}` : ""}]`;
  const getEl = (part) => document.querySelector(selector(part));
  return {
    name: name2,
    attribute,
    selector,
    getEl
  };
}
const isBrowser$1 = typeof document !== "undefined";
const isFunction = (v) => typeof v === "function";
function isElement(element) {
  return element instanceof Element;
}
function isHTMLElement$1(element) {
  return element instanceof HTMLElement;
}
function isHTMLInputElement(element) {
  return element instanceof HTMLInputElement;
}
function isHTMLLabelElement(element) {
  return element instanceof HTMLLabelElement;
}
function isHTMLButtonElement(element) {
  return element instanceof HTMLButtonElement;
}
function isElementDisabled(element) {
  const ariaDisabled = element.getAttribute("aria-disabled");
  const disabled = element.getAttribute("disabled");
  const dataDisabled = element.hasAttribute("data-disabled");
  if (ariaDisabled === "true" || disabled !== null || dataDisabled) {
    return true;
  }
  return false;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isReadable(value) {
  return isObject(value) && "subscribe" in value;
}
function executeCallbacks$1(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function noop() {
}
function addEventListener$3(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
function addMeltEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  if (typeof handler === "function") {
    const handlerWithMelt = withMelt((_event) => handler(_event));
    events.forEach((_event) => target.addEventListener(_event, handlerWithMelt, options));
    return () => {
      events.forEach((_event) => target.removeEventListener(_event, handlerWithMelt, options));
    };
  }
  return () => noop();
}
function dispatchMeltEvent(originalEvent) {
  const node = originalEvent.currentTarget;
  if (!isHTMLElement$1(node))
    return null;
  const customMeltEvent = new CustomEvent(`m-${originalEvent.type}`, {
    detail: {
      originalEvent
    },
    cancelable: true
  });
  node.dispatchEvent(customMeltEvent);
  return customMeltEvent;
}
function withMelt(handler) {
  return (event) => {
    const customEvent = dispatchMeltEvent(event);
    if (customEvent?.defaultPrevented)
      return;
    return handler(event);
  };
}
function addHighlight(element) {
  element.setAttribute("data-highlighted", "");
}
function removeHighlight(element) {
  element.removeAttribute("data-highlighted");
}
const safeOnMount = (fn) => {
  try {
    onMount(fn);
  } catch {
    return fn;
  }
};
const safeOnDestroy = (fn) => {
  try {
    onDestroy(fn);
  } catch {
    return fn;
  }
};
function getOptions(el) {
  return Array.from(el.querySelectorAll('[role="option"]:not([data-disabled])')).filter((el2) => isHTMLElement$1(el2));
}
function omit$1(obj, ...keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
function stripValues(inputObject, toStrip, recursive) {
  return Object.fromEntries(Object.entries(inputObject).filter(([_, value]) => !dequal(value, toStrip)));
}
function removeUndefined$2(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function withGet(store) {
  return {
    ...store,
    get: () => get_store_value(store)
  };
}
withGet.writable = function(initial) {
  const internal = writable(initial);
  let value = initial;
  return {
    subscribe: internal.subscribe,
    set(newValue) {
      internal.set(newValue);
      value = newValue;
    },
    update(updater) {
      const newValue = updater(value);
      internal.set(newValue);
      value = newValue;
    },
    get() {
      return value;
    }
  };
};
withGet.derived = function(stores, fn) {
  const subscribers = /* @__PURE__ */ new Map();
  const get = () => {
    const values = Array.isArray(stores) ? stores.map((store) => store.get()) : stores.get();
    return fn(values);
  };
  const subscribe2 = (subscriber) => {
    const unsubscribers = [];
    const storesArr = Array.isArray(stores) ? stores : [stores];
    storesArr.forEach((store) => {
      unsubscribers.push(store.subscribe(() => {
        subscriber(get());
      }));
    });
    subscriber(get());
    subscribers.set(subscriber, unsubscribers);
    return () => {
      const unsubscribers2 = subscribers.get(subscriber);
      if (unsubscribers2) {
        for (const unsubscribe of unsubscribers2) {
          unsubscribe();
        }
      }
      subscribers.delete(subscriber);
    };
  };
  return {
    get,
    subscribe: subscribe2
  };
};
const overridable = (_store, onChange) => {
  const store = withGet(_store);
  const update2 = (updater, sideEffect) => {
    store.update((curr) => {
      const next2 = updater(curr);
      let res = next2;
      if (onChange) {
        res = onChange({ curr, next: next2 });
      }
      sideEffect?.(res);
      return res;
    });
  };
  const set = (curr) => {
    update2(() => curr);
  };
  return {
    ...store,
    update: update2,
    set
  };
};
function sleep$1(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function generateId$1() {
  return nanoid(10);
}
function generateIds(args) {
  return args.reduce((acc, curr) => {
    acc[curr] = generateId$1();
    return acc;
  }, {});
}
const kbd$2 = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*",
  A: "a",
  P: "p"
};
const FIRST_KEYS = [kbd$2.ARROW_DOWN, kbd$2.PAGE_UP, kbd$2.HOME];
const LAST_KEYS = [kbd$2.ARROW_UP, kbd$2.PAGE_DOWN, kbd$2.END];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SELECTION_KEYS = [kbd$2.ENTER, kbd$2.SPACE];
function debounce(fn, wait = 500) {
  let timeout = null;
  return function(...args) {
    const later = () => {
      timeout = null;
      fn(...args);
    };
    timeout && clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
const isDom = () => typeof window !== "undefined";
function getPlatform() {
  const agent = navigator.userAgentData;
  return agent?.platform ?? navigator.platform;
}
const pt = (v) => isDom() && v.test(getPlatform().toLowerCase());
const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
const isMac = () => pt(/^mac/) && !isTouchDevice();
const isApple = () => pt(/mac|iphone|ipad|ipod/i);
const isIos = () => isApple() && !isMac();
const LOCK_CLASSNAME = "data-melt-scroll-lock";
function assignStyle(el, style) {
  if (!el)
    return;
  const previousStyle = el.style.cssText;
  Object.assign(el.style, style);
  return () => {
    el.style.cssText = previousStyle;
  };
}
function setCSSProperty(el, property, value) {
  if (!el)
    return;
  const previousValue = el.style.getPropertyValue(property);
  el.style.setProperty(property, value);
  return () => {
    if (previousValue) {
      el.style.setProperty(property, previousValue);
    } else {
      el.style.removeProperty(property);
    }
  };
}
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function removeScroll(_document) {
  const doc = _document ?? document;
  const win = doc.defaultView ?? window;
  const { documentElement, body } = doc;
  const locked = body.hasAttribute(LOCK_CLASSNAME);
  if (locked)
    return noop;
  body.setAttribute(LOCK_CLASSNAME, "");
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  const setScrollbarWidthProperty = () => setCSSProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const scrollbarSidePadding = win.getComputedStyle(body)[paddingProperty];
  const setStyle = () => assignStyle(body, {
    overflow: "hidden",
    [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
  });
  const setIOSStyle = () => {
    const { scrollX, scrollY, visualViewport } = win;
    const offsetLeft = visualViewport?.offsetLeft ?? 0;
    const offsetTop = visualViewport?.offsetTop ?? 0;
    const restoreStyle = assignStyle(body, {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0",
      [paddingProperty]: `calc(${scrollbarSidePadding} + ${scrollbarWidth}px)`
    });
    return () => {
      restoreStyle?.();
      win.scrollTo(scrollX, scrollY);
    };
  };
  const cleanups = [setScrollbarWidthProperty(), isIos() ? setIOSStyle() : setStyle()];
  return () => {
    cleanups.forEach((fn) => fn?.());
    body.removeAttribute(LOCK_CLASSNAME);
  };
}
function derivedVisible(obj) {
  const { open, forceVisible, activeTrigger } = obj;
  return derived([open, forceVisible, activeTrigger], ([$open, $forceVisible, $activeTrigger]) => ($open || $forceVisible) && $activeTrigger !== null);
}
function effect$1(stores, fn) {
  let cb = void 0;
  const destroy = derived(stores, (stores2) => {
    cb?.();
    cb = fn(stores2);
  }).subscribe(noop);
  const unsub = () => {
    destroy();
    cb?.();
  };
  safeOnDestroy(unsub);
  return unsub;
}
function toWritableStores$1(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = withGet(writable(value));
  });
  return result;
}
function handleRovingFocus(nextElement) {
  if (!isBrowser$1)
    return;
  sleep$1(1).then(() => {
    const currentFocusedElement = document.activeElement;
    if (!isHTMLElement$1(currentFocusedElement) || currentFocusedElement === nextElement)
      return;
    currentFocusedElement.tabIndex = -1;
    if (nextElement) {
      nextElement.tabIndex = 0;
      nextElement.focus();
    }
  });
}
function getFocusableElements() {
  return Array.from(document.querySelectorAll('a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'));
}
function getNextFocusable(currentElement) {
  const focusableElements = getFocusableElements();
  const currentIndex = focusableElements.indexOf(currentElement);
  const nextIndex = currentIndex + 1;
  const nextElement = focusableElements[nextIndex];
  if (nextIndex < focusableElements.length && isHTMLElement$1(nextElement)) {
    return nextElement;
  }
  return null;
}
function getPreviousFocusable(currentElement) {
  const focusableElements = getFocusableElements();
  const currentIndex = focusableElements.indexOf(currentElement);
  const previousIndex = currentIndex - 1;
  const prevElement = focusableElements[previousIndex];
  if (previousIndex >= 0 && isHTMLElement$1(prevElement)) {
    return prevElement;
  }
  return null;
}
const ignoredKeys = /* @__PURE__ */ new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock"]);
const defaults$b = {
  onMatch: handleRovingFocus,
  getCurrentItem: () => document.activeElement
};
function createTypeaheadSearch(args = {}) {
  const withDefaults = { ...defaults$b, ...args };
  const typed = withGet(writable([]));
  const resetTyped = debounce(() => {
    typed.update(() => []);
  });
  const handleTypeaheadSearch = (key, items) => {
    if (ignoredKeys.has(key))
      return;
    const currentItem = withDefaults.getCurrentItem();
    const $typed = get_store_value(typed);
    if (!Array.isArray($typed)) {
      return;
    }
    $typed.push(key.toLowerCase());
    typed.set($typed);
    const candidateItems = items.filter((item) => {
      if (item.getAttribute("disabled") === "true" || item.getAttribute("aria-disabled") === "true" || item.hasAttribute("data-disabled")) {
        return false;
      }
      return true;
    });
    const isRepeated = $typed.length > 1 && $typed.every((char) => char === $typed[0]);
    const normalizeSearch = isRepeated ? $typed[0] : $typed.join("");
    const currentItemIndex = isHTMLElement$1(currentItem) ? candidateItems.indexOf(currentItem) : -1;
    let wrappedItems = wrapArray(candidateItems, Math.max(currentItemIndex, 0));
    const excludeCurrentItem = normalizeSearch.length === 1;
    if (excludeCurrentItem) {
      wrappedItems = wrappedItems.filter((v) => v !== currentItem);
    }
    const nextItem = wrappedItems.find((item) => item?.innerText && item.innerText.toLowerCase().startsWith(normalizeSearch.toLowerCase()));
    if (isHTMLElement$1(nextItem) && nextItem !== currentItem) {
      withDefaults.onMatch(nextItem);
    }
    resetTyped();
  };
  return {
    typed,
    resetTyped,
    handleTypeaheadSearch
  };
}
function getPortalParent(node) {
  let parent = node.parentElement;
  while (isHTMLElement$1(parent) && !parent.hasAttribute("data-portal")) {
    parent = parent.parentElement;
  }
  return parent || "body";
}
function getPortalDestination(node, portalProp) {
  if (portalProp !== void 0)
    return portalProp;
  const portalParent = getPortalParent(node);
  if (portalParent === "body")
    return document.body;
  return null;
}
function createClickOutsideIgnore(meltId) {
  return (e) => {
    const target = e.target;
    const triggerEl = getElementByMeltId(meltId);
    if (!triggerEl || !isElement(target))
      return false;
    const id = triggerEl.id;
    if (isHTMLLabelElement(target) && id === target.htmlFor) {
      return true;
    }
    if (target.closest(`label[for="${id}"]`)) {
      return true;
    }
    return false;
  };
}
async function handleFocus(args) {
  const { prop, defaultEl } = args;
  await Promise.all([sleep$1(1), tick]);
  if (prop === void 0) {
    defaultEl?.focus();
    return;
  }
  const returned = isFunction(prop) ? prop(defaultEl) : prop;
  if (typeof returned === "string") {
    const el = document.querySelector(returned);
    if (!isHTMLElement$1(el))
      return;
    el.focus();
  } else if (isHTMLElement$1(returned)) {
    returned.focus();
  }
}
const defaults$a = {
  src: "",
  delayMs: 0,
  onLoadingStatusChange: void 0
};
const createAvatar = (props) => {
  const withDefaults = { ...defaults$a, ...props };
  const options = toWritableStores$1(omit$1(withDefaults, "loadingStatus", "onLoadingStatusChange"));
  const { src, delayMs } = options;
  const loadingStatusWritable = withDefaults.loadingStatus ?? writable("loading");
  const loadingStatus = overridable(loadingStatusWritable, withDefaults?.onLoadingStatusChange);
  effect$1([src, delayMs], ([$src, $delayMs]) => {
    if (isBrowser$1) {
      const image2 = new Image();
      image2.src = $src;
      image2.onload = () => {
        if (delayMs !== void 0) {
          const timerId = window.setTimeout(() => {
            loadingStatus.set("loaded");
          }, $delayMs);
          return () => window.clearTimeout(timerId);
        } else {
          loadingStatus.set("loaded");
        }
      };
      image2.onerror = () => {
        loadingStatus.set("error");
      };
    }
  });
  const image = makeElement("avatar-image", {
    stores: [src, loadingStatus],
    returned: ([$src, $loadingStatus]) => {
      const imageStyles = styleToString$3({
        display: $loadingStatus === "loaded" ? "block" : "none"
      });
      return {
        src: $src,
        style: imageStyles
      };
    }
  });
  const fallback = makeElement("avatar-fallback", {
    stores: [loadingStatus],
    returned: ([$loadingStatus]) => {
      return {
        style: $loadingStatus === "loaded" ? styleToString$3({
          display: "none"
        }) : void 0,
        hidden: $loadingStatus === "loaded" ? true : void 0
      };
    }
  });
  return {
    elements: {
      image,
      fallback
    },
    states: {
      loadingStatus
    },
    options
  };
};
readable(void 0, (set) => {
  function clicked(event) {
    set(event);
    set(void 0);
  }
  const unsubscribe = addEventListener$3(document, "pointerup", clicked, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
const documentEscapeKeyStore = readable(void 0, (set) => {
  function keydown(event) {
    if (event && event.key === kbd$2.ESCAPE) {
      set(event);
    }
    set(void 0);
  }
  const unsubscribe = addEventListener$3(document, "keydown", keydown, {
    passive: false
  });
  return unsubscribe;
});
const useEscapeKeydown = (node, config = {}) => {
  let unsub = noop;
  function update2(config2 = {}) {
    unsub();
    const options = { enabled: true, ...config2 };
    const enabled = isReadable(options.enabled) ? options.enabled : readable(options.enabled);
    unsub = executeCallbacks$1(
      // Handle escape keydowns
      documentEscapeKeyStore.subscribe((e) => {
        if (!e || !get_store_value(enabled))
          return;
        const target = e.target;
        if (!isHTMLElement$1(target) || target.closest("[data-escapee]") !== node) {
          return;
        }
        e.preventDefault();
        if (options.ignore) {
          if (isFunction(options.ignore)) {
            if (options.ignore(e))
              return;
          } else if (Array.isArray(options.ignore)) {
            if (options.ignore.length > 0 && options.ignore.some((ignoreEl) => {
              return ignoreEl && target === ignoreEl;
            }))
              return;
          }
        }
        options.handler?.(e);
      }),
      effect$1(enabled, ($enabled) => {
        if ($enabled) {
          node.dataset.escapee = "";
        } else {
          delete node.dataset.escapee;
        }
      })
    );
  }
  update2(config);
  return {
    update: update2,
    destroy() {
      node.removeAttribute("data-escapee");
      unsub();
    }
  };
};
const defaultConfig$1 = {
  strategy: "absolute",
  placement: "top",
  gutter: 5,
  flip: true,
  sameWidth: false,
  overflowPadding: 8
};
const ARROW_TRANSFORM = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)"
};
function useFloating(reference, floating, opts = {}) {
  if (!floating || !reference || opts === null)
    return {
      destroy: noop
    };
  const options = { ...defaultConfig$1, ...opts };
  const arrowEl = floating.querySelector("[data-arrow=true]");
  const middleware = [];
  if (options.flip) {
    middleware.push(flip({
      boundary: options.boundary,
      padding: options.overflowPadding
    }));
  }
  const arrowOffset = isHTMLElement$1(arrowEl) ? arrowEl.offsetHeight / 2 : 0;
  if (options.gutter || options.offset) {
    const data = options.gutter ? { mainAxis: options.gutter } : options.offset;
    if (data?.mainAxis != null) {
      data.mainAxis += arrowOffset;
    }
    middleware.push(offset(data));
  }
  middleware.push(shift({
    boundary: options.boundary,
    crossAxis: options.overlap,
    padding: options.overflowPadding
  }));
  if (arrowEl) {
    middleware.push(arrow({ element: arrowEl, padding: 8 }));
  }
  middleware.push(size({
    padding: options.overflowPadding,
    apply({ rects, availableHeight, availableWidth }) {
      if (options.sameWidth) {
        Object.assign(floating.style, {
          width: `${Math.round(rects.reference.width)}px`,
          minWidth: "unset"
        });
      }
      if (options.fitViewport) {
        Object.assign(floating.style, {
          maxWidth: `${availableWidth}px`,
          maxHeight: `${availableHeight}px`
        });
      }
    }
  }));
  function compute() {
    if (!reference || !floating)
      return;
    if (isHTMLElement$1(reference) && !reference.ownerDocument.documentElement.contains(reference))
      return;
    const { placement, strategy } = options;
    computePosition(reference, floating, {
      placement,
      middleware,
      strategy
    }).then((data) => {
      const x = Math.round(data.x);
      const y = Math.round(data.y);
      const [side, align] = getSideAndAlignFromPlacement(data.placement);
      floating.setAttribute("data-side", side);
      floating.setAttribute("data-align", align);
      Object.assign(floating.style, {
        position: options.strategy,
        top: `${y}px`,
        left: `${x}px`
      });
      if (isHTMLElement$1(arrowEl) && data.middlewareData.arrow) {
        const { x: x2, y: y2 } = data.middlewareData.arrow;
        const dir = data.placement.split("-")[0];
        arrowEl.setAttribute("data-side", dir);
        Object.assign(arrowEl.style, {
          position: "absolute",
          left: x2 != null ? `${x2}px` : "",
          top: y2 != null ? `${y2}px` : "",
          [dir]: `calc(100% - ${arrowOffset}px)`,
          transform: ARROW_TRANSFORM[dir],
          backgroundColor: "inherit",
          zIndex: "inherit"
        });
      }
      return data;
    });
  }
  Object.assign(floating.style, {
    position: options.strategy
  });
  return {
    destroy: autoUpdate(reference, floating, compute)
  };
}
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
function createFocusTrap(config = {}) {
  let trap;
  const { immediate, ...focusTrapOptions } = config;
  const hasFocus = writable(false);
  const isPaused = writable(false);
  const activate = (opts) => trap?.activate(opts);
  const deactivate = (opts) => {
    trap?.deactivate(opts);
  };
  const pause = () => {
    if (trap) {
      trap.pause();
      isPaused.set(true);
    }
  };
  const unpause = () => {
    if (trap) {
      trap.unpause();
      isPaused.set(false);
    }
  };
  const useFocusTrap = (node) => {
    trap = createFocusTrap$1(node, {
      ...focusTrapOptions,
      onActivate() {
        hasFocus.set(true);
        config.onActivate?.();
      },
      onDeactivate() {
        hasFocus.set(false);
        config.onDeactivate?.();
      }
    });
    if (immediate) {
      activate();
    }
    return {
      destroy() {
        deactivate();
        trap = void 0;
      }
    };
  };
  return {
    useFocusTrap,
    hasFocus: readonly(hasFocus),
    isPaused: readonly(isPaused),
    activate,
    deactivate,
    pause,
    unpause
  };
}
const visibleModals = [];
const useModal = (node, config) => {
  let unsubInteractOutside = noop;
  function removeNodeFromVisibleModals() {
    const index = visibleModals.indexOf(node);
    if (index >= 0) {
      visibleModals.splice(index, 1);
    }
  }
  function update2(config2) {
    unsubInteractOutside();
    const { open, onClose, shouldCloseOnInteractOutside, closeOnInteractOutside } = config2;
    sleep$1(100).then(() => {
      if (open) {
        visibleModals.push(node);
      } else {
        removeNodeFromVisibleModals();
      }
    });
    function isLastModal() {
      return last(visibleModals) === node;
    }
    function closeModal() {
      if (isLastModal() && onClose) {
        onClose();
        removeNodeFromVisibleModals();
      }
    }
    function onInteractOutsideStart(e) {
      const target = e.target;
      if (!isElement(target))
        return;
      if (target && isLastModal()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
    function onInteractOutside(e) {
      if (shouldCloseOnInteractOutside?.(e) && isLastModal()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        closeModal();
      }
    }
    unsubInteractOutside = useInteractOutside(node, {
      onInteractOutsideStart,
      onInteractOutside: closeOnInteractOutside ? onInteractOutside : void 0,
      enabled: open
    }).destroy;
  }
  update2(config);
  return {
    update: update2,
    destroy() {
      removeNodeFromVisibleModals();
      unsubInteractOutside();
    }
  };
};
const defaultConfig = {
  floating: {},
  focusTrap: {},
  modal: {},
  escapeKeydown: {},
  portal: "body"
};
const usePopper = (popperElement, args) => {
  popperElement.dataset.escapee = "";
  const { anchorElement, open, options } = args;
  if (!anchorElement || !open || !options) {
    return { destroy: noop };
  }
  const opts = { ...defaultConfig, ...options };
  const callbacks = [];
  if (opts.portal !== null) {
    callbacks.push(usePortal(popperElement, opts.portal).destroy);
  }
  callbacks.push(useFloating(anchorElement, popperElement, opts.floating).destroy);
  if (opts.focusTrap !== null) {
    const { useFocusTrap } = createFocusTrap({
      immediate: true,
      escapeDeactivates: false,
      allowOutsideClick: true,
      returnFocusOnDeactivate: false,
      fallbackFocus: popperElement,
      ...opts.focusTrap
    });
    callbacks.push(useFocusTrap(popperElement).destroy);
  }
  if (opts.modal !== null) {
    callbacks.push(useModal(popperElement, {
      onClose: () => {
        if (isHTMLElement$1(anchorElement)) {
          open.set(false);
          anchorElement.focus();
        }
      },
      shouldCloseOnInteractOutside: (e) => {
        if (e.defaultPrevented)
          return false;
        if (isHTMLElement$1(anchorElement) && anchorElement.contains(e.target)) {
          return false;
        }
        return true;
      },
      ...opts.modal
    }).destroy);
  }
  if (opts.escapeKeydown !== null) {
    callbacks.push(useEscapeKeydown(popperElement, {
      enabled: open,
      handler: () => {
        open.set(false);
      },
      ...opts.escapeKeydown
    }).destroy);
  }
  const unsubscribe = executeCallbacks$1(...callbacks);
  return {
    destroy() {
      unsubscribe();
    }
  };
};
const usePortal = (el, target = "body") => {
  let targetEl;
  if (!isHTMLElement$1(target) && typeof target !== "string") {
    return {
      destroy: noop
    };
  }
  async function update2(newTarget) {
    target = newTarget;
    if (typeof target === "string") {
      targetEl = document.querySelector(target);
      if (targetEl === null) {
        await tick();
        targetEl = document.querySelector(target);
      }
      if (targetEl === null) {
        throw new Error(`No element found matching css selector: "${target}"`);
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    } else {
      throw new TypeError(`Unknown portal target type: ${target === null ? "null" : typeof target}. Allowed types: string (CSS selector) or HTMLElement.`);
    }
    el.dataset.portal = "";
    targetEl.appendChild(el);
    el.hidden = false;
  }
  function destroy() {
    el.remove();
  }
  update2(target);
  return {
    update: update2,
    destroy
  };
};
const useInteractOutside = (node, config) => {
  let unsub = noop;
  let unsubClick = noop;
  let isPointerDown = false;
  let isPointerDownInside = false;
  let ignoreEmulatedMouseEvents = false;
  function update2(config2) {
    unsub();
    unsubClick();
    const { onInteractOutside, onInteractOutsideStart, enabled } = config2;
    if (!enabled)
      return;
    function onPointerDown(e) {
      if (onInteractOutside && isValidEvent(e, node)) {
        onInteractOutsideStart?.(e);
      }
      const target = e.target;
      if (isElement(target) && isOrContainsTarget(node, target)) {
        isPointerDownInside = true;
      }
      isPointerDown = true;
    }
    function triggerInteractOutside(e) {
      onInteractOutside?.(e);
    }
    const documentObj = getOwnerDocument(node);
    if (typeof PointerEvent !== "undefined") {
      const onPointerUp = (e) => {
        unsubClick();
        const handler = (e2) => {
          if (shouldTriggerInteractOutside(e2)) {
            triggerInteractOutside(e2);
          }
          resetPointerState();
        };
        if (e.pointerType === "touch") {
          unsubClick = addEventListener$3(documentObj, "click", handler, {
            capture: true,
            once: true
          });
          return;
        }
        handler(e);
      };
      unsub = executeCallbacks$1(addEventListener$3(documentObj, "pointerdown", onPointerDown, true), addEventListener$3(documentObj, "pointerup", onPointerUp, true));
    } else {
      const onMouseUp = (e) => {
        if (ignoreEmulatedMouseEvents) {
          ignoreEmulatedMouseEvents = false;
        } else if (shouldTriggerInteractOutside(e)) {
          triggerInteractOutside(e);
        }
        resetPointerState();
      };
      const onTouchEnd = (e) => {
        ignoreEmulatedMouseEvents = true;
        if (shouldTriggerInteractOutside(e)) {
          triggerInteractOutside(e);
        }
        resetPointerState();
      };
      unsub = executeCallbacks$1(addEventListener$3(documentObj, "mousedown", onPointerDown, true), addEventListener$3(documentObj, "mouseup", onMouseUp, true), addEventListener$3(documentObj, "touchstart", onPointerDown, true), addEventListener$3(documentObj, "touchend", onTouchEnd, true));
    }
  }
  function shouldTriggerInteractOutside(e) {
    if (isPointerDown && !isPointerDownInside && isValidEvent(e, node)) {
      return true;
    }
    return false;
  }
  function resetPointerState() {
    isPointerDown = false;
    isPointerDownInside = false;
  }
  update2(config);
  return {
    update: update2,
    destroy() {
      unsub();
      unsubClick();
    }
  };
};
function isValidEvent(e, node) {
  if ("button" in e && e.button > 0)
    return false;
  const target = e.target;
  if (!isElement(target))
    return false;
  const ownerDocument = target.ownerDocument;
  if (!ownerDocument || !ownerDocument.documentElement.contains(target)) {
    return false;
  }
  return node && !isOrContainsTarget(node, target);
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
function toReadableStores(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    if (isReadable(value)) {
      result[propertyKey] = withGet(value);
    } else {
      result[propertyKey] = withGet(readable(value));
    }
  });
  return result;
}
const defaults$9 = {
  prefix: "",
  disabled: readable(false),
  required: readable(false),
  name: readable(void 0)
};
function createHiddenInput(props) {
  const withDefaults = {
    ...defaults$9,
    ...removeUndefined$2(props)
  };
  const { name: elName } = createElHelpers(withDefaults.prefix);
  const { value, name: name2, disabled, required } = toReadableStores(omit$1(withDefaults, "prefix"));
  const nameStore = name2;
  const hiddenInput = makeElement(elName("hidden-input"), {
    stores: [value, nameStore, disabled, required],
    returned: ([$value, $name, $disabled, $required]) => {
      return {
        name: $name,
        value: $value?.toString(),
        "aria-hidden": "true",
        hidden: true,
        disabled: $disabled,
        required: $required,
        tabIndex: -1,
        style: styleToString$3({
          position: "absolute",
          opacity: 0,
          "pointer-events": "none",
          margin: 0,
          transform: "translateX(-100%)"
        })
      };
    },
    action: (node) => {
      const unsub = value.subscribe((newValue) => {
        node.value = newValue;
        node.dispatchEvent(new Event("change", { bubbles: true }));
      });
      return {
        destroy: unsub
      };
    }
  });
  return hiddenInput;
}
function createLabel() {
  const root = makeElement("label", {
    action: (node) => {
      const mouseDown = addMeltEventListener(node, "mousedown", (e) => {
        if (!e.defaultPrevented && e.detail > 1) {
          e.preventDefault();
        }
      });
      return {
        destroy: mouseDown
      };
    }
  });
  return {
    elements: {
      root
    }
  };
}
const INTERACTION_KEYS = [kbd$2.ARROW_LEFT, kbd$2.ESCAPE, kbd$2.ARROW_RIGHT, kbd$2.SHIFT, kbd$2.CAPS_LOCK, kbd$2.CONTROL, kbd$2.ALT, kbd$2.META, kbd$2.ENTER, kbd$2.F1, kbd$2.F2, kbd$2.F3, kbd$2.F4, kbd$2.F5, kbd$2.F6, kbd$2.F7, kbd$2.F8, kbd$2.F9, kbd$2.F10, kbd$2.F11, kbd$2.F12];
const defaults$8 = {
  positioning: {
    placement: "bottom",
    sameWidth: true
  },
  scrollAlignment: "nearest",
  loop: true,
  defaultOpen: false,
  closeOnOutsideClick: true,
  preventScroll: true,
  closeOnEscape: true,
  forceVisible: false,
  portal: void 0,
  builder: "listbox",
  disabled: false,
  required: false,
  name: void 0,
  typeahead: true,
  highlightOnHover: true,
  onOutsideClick: void 0
};
const listboxIdParts = ["trigger", "menu", "label"];
function createListbox(props) {
  const withDefaults = { ...defaults$8, ...props };
  const activeTrigger = withGet(writable(null));
  const highlightedItem = withGet(writable(null));
  const selectedWritable = withDefaults.selected ?? writable(withDefaults.defaultSelected);
  const selected = overridable(selectedWritable, withDefaults?.onSelectedChange);
  const highlighted = derived(highlightedItem, ($highlightedItem) => $highlightedItem ? getOptionProps($highlightedItem) : void 0);
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const options = toWritableStores$1({
    ...omit$1(withDefaults, "open", "defaultOpen", "builder", "ids"),
    multiple: withDefaults.multiple ?? false
  });
  const { scrollAlignment, loop, closeOnOutsideClick, closeOnEscape, preventScroll, portal, forceVisible, positioning, multiple, arrowSize, disabled, required, typeahead, name: nameProp, highlightOnHover, onOutsideClick } = options;
  const { name: name2, selector } = createElHelpers(withDefaults.builder);
  const ids = toWritableStores$1({ ...generateIds(listboxIdParts), ...withDefaults.ids });
  const { handleTypeaheadSearch } = createTypeaheadSearch({
    onMatch: (element) => {
      highlightedItem.set(element);
      element.scrollIntoView({ block: scrollAlignment.get() });
    },
    getCurrentItem() {
      return highlightedItem.get();
    }
  });
  function getOptionProps(el) {
    const value = el.getAttribute("data-value");
    const label2 = el.getAttribute("data-label");
    const disabled2 = el.hasAttribute("data-disabled");
    return {
      value: value ? JSON.parse(value) : value,
      label: label2 ?? el.textContent ?? void 0,
      disabled: disabled2 ? true : false
    };
  }
  const setOption = (newOption) => {
    selected.update(($option) => {
      const $multiple = multiple.get();
      if ($multiple) {
        const optionArr = Array.isArray($option) ? [...$option] : [];
        return toggle(newOption, optionArr, (itemA, itemB) => dequal(itemA.value, itemB.value));
      }
      return newOption;
    });
  };
  function selectItem(item) {
    const props2 = getOptionProps(item);
    setOption(props2);
  }
  async function openMenu() {
    open.set(true);
    const triggerEl = document.getElementById(ids.trigger.get());
    if (!triggerEl)
      return;
    if (triggerEl !== activeTrigger.get())
      activeTrigger.set(triggerEl);
    await tick();
    const menuElement = document.getElementById(ids.menu.get());
    if (!isHTMLElement$1(menuElement))
      return;
    const selectedItem = menuElement.querySelector("[aria-selected=true]");
    if (!isHTMLElement$1(selectedItem))
      return;
    highlightedItem.set(selectedItem);
  }
  function closeMenu() {
    open.set(false);
    highlightedItem.set(null);
  }
  const isVisible = derivedVisible({ open, forceVisible, activeTrigger });
  const isSelected = derived([selected], ([$selected]) => {
    return (value) => {
      if (Array.isArray($selected)) {
        return $selected.some((o) => dequal(o.value, value));
      }
      if (isObject(value)) {
        return dequal($selected?.value, stripValues(value, void 0));
      }
      return dequal($selected?.value, value);
    };
  });
  const isHighlighted = derived([highlighted], ([$value]) => {
    return (item) => {
      return dequal($value?.value, item);
    };
  });
  const trigger = makeElement(name2("trigger"), {
    stores: [open, highlightedItem, disabled, ids.menu, ids.trigger, ids.label],
    returned: ([$open, $highlightedItem, $disabled, $menuId, $triggerId, $labelId]) => {
      return {
        "aria-activedescendant": $highlightedItem?.id,
        "aria-autocomplete": "list",
        "aria-controls": $menuId,
        "aria-expanded": $open,
        "aria-labelledby": $labelId,
        // autocomplete: 'off',
        id: $triggerId,
        role: "combobox",
        disabled: disabledAttr($disabled),
        type: withDefaults.builder === "select" ? "button" : void 0
      };
    },
    action: (node) => {
      const isInput = isHTMLInputElement(node);
      const unsubscribe = executeCallbacks$1(
        addMeltEventListener(node, "click", () => {
          node.focus();
          const $open = open.get();
          if ($open) {
            closeMenu();
          } else {
            openMenu();
          }
        }),
        // Handle all input key events including typing, meta, and navigation.
        addMeltEventListener(node, "keydown", (e) => {
          const $open = open.get();
          if (!$open) {
            if (INTERACTION_KEYS.includes(e.key)) {
              return;
            }
            if (e.key === kbd$2.TAB) {
              return;
            }
            if (e.key === kbd$2.BACKSPACE && isInput && node.value === "") {
              return;
            }
            if (e.key === kbd$2.SPACE && isHTMLButtonElement(node)) {
              return;
            }
            openMenu();
            tick().then(() => {
              const $selectedItem = selected.get();
              if ($selectedItem)
                return;
              const menuEl = document.getElementById(ids.menu.get());
              if (!isHTMLElement$1(menuEl))
                return;
              const enabledItems = Array.from(menuEl.querySelectorAll(`${selector("item")}:not([data-disabled]):not([data-hidden])`)).filter((item) => isHTMLElement$1(item));
              if (!enabledItems.length)
                return;
              if (e.key === kbd$2.ARROW_DOWN) {
                highlightedItem.set(enabledItems[0]);
                enabledItems[0].scrollIntoView({ block: scrollAlignment.get() });
              } else if (e.key === kbd$2.ARROW_UP) {
                highlightedItem.set(last(enabledItems));
                last(enabledItems).scrollIntoView({ block: scrollAlignment.get() });
              }
            });
          }
          if (e.key === kbd$2.TAB) {
            closeMenu();
            return;
          }
          if (e.key === kbd$2.ENTER && !e.isComposing || e.key === kbd$2.SPACE && isHTMLButtonElement(node)) {
            e.preventDefault();
            const $highlightedItem = highlightedItem.get();
            if ($highlightedItem) {
              selectItem($highlightedItem);
            }
            if (!multiple.get()) {
              closeMenu();
            }
          }
          if (e.key === kbd$2.ARROW_UP && e.altKey) {
            closeMenu();
          }
          if (FIRST_LAST_KEYS.includes(e.key)) {
            e.preventDefault();
            const menuElement = document.getElementById(ids.menu.get());
            if (!isHTMLElement$1(menuElement))
              return;
            const itemElements = getOptions(menuElement);
            if (!itemElements.length)
              return;
            const candidateNodes = itemElements.filter((opt) => !isElementDisabled(opt) && opt.dataset.hidden === void 0);
            const $currentItem = highlightedItem.get();
            const currentIndex = $currentItem ? candidateNodes.indexOf($currentItem) : -1;
            const $loop = loop.get();
            const $scrollAlignment = scrollAlignment.get();
            let nextItem;
            switch (e.key) {
              case kbd$2.ARROW_DOWN:
                nextItem = next(candidateNodes, currentIndex, $loop);
                break;
              case kbd$2.ARROW_UP:
                nextItem = prev(candidateNodes, currentIndex, $loop);
                break;
              case kbd$2.PAGE_DOWN:
                nextItem = forward(candidateNodes, currentIndex, 10, $loop);
                break;
              case kbd$2.PAGE_UP:
                nextItem = back(candidateNodes, currentIndex, 10, $loop);
                break;
              case kbd$2.HOME:
                nextItem = candidateNodes[0];
                break;
              case kbd$2.END:
                nextItem = last(candidateNodes);
                break;
              default:
                return;
            }
            highlightedItem.set(nextItem);
            nextItem?.scrollIntoView({ block: $scrollAlignment });
          } else if (typeahead.get()) {
            const menuEl = document.getElementById(ids.menu.get());
            if (!isHTMLElement$1(menuEl))
              return;
            handleTypeaheadSearch(e.key, getOptions(menuEl));
          }
        })
      );
      let unsubEscapeKeydown = noop;
      const escape2 = useEscapeKeydown(node, {
        handler: closeMenu,
        enabled: derived([open, closeOnEscape], ([$open, $closeOnEscape]) => {
          return $open && $closeOnEscape;
        })
      });
      if (escape2 && escape2.destroy) {
        unsubEscapeKeydown = escape2.destroy;
      }
      return {
        destroy() {
          unsubscribe();
          unsubEscapeKeydown();
        }
      };
    }
  });
  const menu = makeElement(name2("menu"), {
    stores: [isVisible, ids.menu],
    returned: ([$isVisible, $menuId]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        id: $menuId,
        role: "listbox",
        style: styleToString$3({ display: $isVisible ? void 0 : "none" })
      };
    },
    action: (node) => {
      let unsubPopper = noop;
      const unsubscribe = executeCallbacks$1(
        // Bind the popper portal to the input element.
        effect$1([isVisible, portal, closeOnOutsideClick, positioning, activeTrigger], ([$isVisible, $portal, $closeOnOutsideClick, $positioning, $activeTrigger]) => {
          unsubPopper();
          if (!$isVisible || !$activeTrigger)
            return;
          tick().then(() => {
            unsubPopper();
            const ignoreHandler = createClickOutsideIgnore(ids.trigger.get());
            unsubPopper = usePopper(node, {
              anchorElement: $activeTrigger,
              open,
              options: {
                floating: $positioning,
                focusTrap: null,
                modal: {
                  closeOnInteractOutside: $closeOnOutsideClick,
                  onClose: closeMenu,
                  open: $isVisible,
                  shouldCloseOnInteractOutside: (e) => {
                    onOutsideClick.get()?.(e);
                    if (e.defaultPrevented)
                      return false;
                    const target = e.target;
                    if (!isElement(target))
                      return false;
                    if (target === $activeTrigger || $activeTrigger.contains(target)) {
                      return false;
                    }
                    if (ignoreHandler(e))
                      return false;
                    return true;
                  }
                },
                escapeKeydown: null,
                portal: getPortalDestination(node, $portal)
              }
            }).destroy;
          });
        })
      );
      return {
        destroy: () => {
          unsubscribe();
          unsubPopper();
        }
      };
    }
  });
  const { elements: { root: labelBuilder } } = createLabel();
  const { action: labelAction } = get_store_value(labelBuilder);
  const label = makeElement(name2("label"), {
    stores: [ids.label, ids.trigger],
    returned: ([$labelId, $triggerId]) => {
      return {
        id: $labelId,
        for: $triggerId
      };
    },
    action: labelAction
  });
  const option = makeElement(name2("option"), {
    stores: [isSelected],
    returned: ([$isSelected]) => (props2) => {
      const selected2 = $isSelected(props2.value);
      return {
        "data-value": JSON.stringify(props2.value),
        "data-label": props2.label,
        "data-disabled": disabledAttr(props2.disabled),
        "aria-disabled": props2.disabled ? true : void 0,
        "aria-selected": selected2,
        "data-selected": selected2 ? "" : void 0,
        id: generateId$1(),
        role: "option"
      };
    },
    action: (node) => {
      const unsubscribe = executeCallbacks$1(addMeltEventListener(node, "click", (e) => {
        if (isElementDisabled(node)) {
          e.preventDefault();
          return;
        }
        selectItem(node);
        if (!multiple.get()) {
          closeMenu();
        }
      }), effect$1(highlightOnHover, ($highlightOnHover) => {
        if (!$highlightOnHover)
          return;
        const unsub = executeCallbacks$1(addMeltEventListener(node, "mouseover", () => {
          highlightedItem.set(node);
        }), addMeltEventListener(node, "mouseleave", () => {
          highlightedItem.set(null);
        }));
        return unsub;
      }));
      return { destroy: unsubscribe };
    }
  });
  const group = makeElement(name2("group"), {
    returned: () => {
      return (groupId) => ({
        role: "group",
        "aria-labelledby": groupId
      });
    }
  });
  const groupLabel = makeElement(name2("group-label"), {
    returned: () => {
      return (groupId) => ({
        id: groupId
      });
    }
  });
  const hiddenInput = createHiddenInput({
    value: derived([selected], ([$selected]) => {
      const value = Array.isArray($selected) ? $selected.map((o) => o.value) : $selected?.value;
      return typeof value === "string" ? value : JSON.stringify(value);
    }),
    name: readonly(nameProp),
    required,
    prefix: withDefaults.builder
  });
  const arrow2 = makeElement(name2("arrow"), {
    stores: arrowSize,
    returned: ($arrowSize) => ({
      "data-arrow": true,
      style: styleToString$3({
        position: "absolute",
        width: `var(--arrow-size, ${$arrowSize}px)`,
        height: `var(--arrow-size, ${$arrowSize}px)`
      })
    })
  });
  safeOnMount(() => {
    if (!isBrowser$1)
      return;
    const menuEl = document.getElementById(ids.menu.get());
    const triggerEl = document.getElementById(ids.trigger.get());
    if (triggerEl) {
      activeTrigger.set(triggerEl);
    }
    if (!menuEl)
      return;
    const selectedEl = menuEl.querySelector("[data-selected]");
    if (!isHTMLElement$1(selectedEl))
      return;
  });
  effect$1([highlightedItem], ([$highlightedItem]) => {
    if (!isBrowser$1)
      return;
    const menuElement = document.getElementById(ids.menu.get());
    if (!isHTMLElement$1(menuElement))
      return;
    getOptions(menuElement).forEach((node) => {
      if (node === $highlightedItem) {
        addHighlight(node);
      } else {
        removeHighlight(node);
      }
    });
  });
  effect$1([open], ([$open]) => {
    if (!isBrowser$1)
      return;
    let unsubScroll = noop;
    if (preventScroll.get() && $open) {
      unsubScroll = removeScroll();
    }
    return () => {
      unsubScroll();
    };
  });
  return {
    ids,
    elements: {
      trigger,
      group,
      option,
      menu,
      groupLabel,
      label,
      hiddenInput,
      arrow: arrow2
    },
    states: {
      open,
      selected,
      highlighted,
      highlightedItem
    },
    helpers: {
      isSelected,
      isHighlighted,
      closeMenu
    },
    options
  };
}
const SUB_OPEN_KEYS = {
  ltr: [...SELECTION_KEYS, kbd$2.ARROW_RIGHT],
  rtl: [...SELECTION_KEYS, kbd$2.ARROW_LEFT]
};
const SUB_CLOSE_KEYS = {
  ltr: [kbd$2.ARROW_LEFT],
  rtl: [kbd$2.ARROW_RIGHT]
};
const menuIdParts = ["menu", "trigger"];
const defaults$7 = {
  arrowSize: 8,
  positioning: {
    placement: "bottom"
  },
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  portal: void 0,
  loop: false,
  dir: "ltr",
  defaultOpen: false,
  typeahead: true,
  closeOnItemClick: true,
  onOutsideClick: void 0
};
function createMenuBuilder(opts) {
  const { name: name2, selector } = createElHelpers(opts.selector);
  const { preventScroll, arrowSize, positioning, closeOnEscape, closeOnOutsideClick, portal, forceVisible, typeahead, loop, closeFocus, disableFocusFirstItem, closeOnItemClick, onOutsideClick } = opts.rootOptions;
  const rootOpen = opts.rootOpen;
  const rootActiveTrigger = opts.rootActiveTrigger;
  const nextFocusable = opts.nextFocusable;
  const prevFocusable = opts.prevFocusable;
  const isUsingKeyboard = withGet.writable(false);
  const lastPointerX = withGet(writable(0));
  const pointerGraceIntent = withGet(writable(null));
  const pointerDir = withGet(writable("right"));
  const currentFocusedItem = withGet(writable(null));
  const pointerMovingToSubmenu = withGet(derived([pointerDir, pointerGraceIntent], ([$pointerDir, $pointerGraceIntent]) => {
    return (e) => {
      const isMovingTowards = $pointerDir === $pointerGraceIntent?.side;
      return isMovingTowards && isPointerInGraceArea(e, $pointerGraceIntent?.area);
    };
  }));
  const { typed, handleTypeaheadSearch } = createTypeaheadSearch();
  const rootIds = toWritableStores$1({ ...generateIds(menuIdParts), ...opts.ids });
  const isVisible = derivedVisible({
    open: rootOpen,
    forceVisible,
    activeTrigger: rootActiveTrigger
  });
  const rootMenu = makeElement(name2(), {
    stores: [isVisible, portal, rootIds.menu, rootIds.trigger],
    returned: ([$isVisible, $portal, $rootMenuId, $rootTriggerId]) => {
      return {
        role: "menu",
        hidden: $isVisible ? void 0 : true,
        style: styleToString$3({
          display: $isVisible ? void 0 : "none"
        }),
        id: $rootMenuId,
        "aria-labelledby": $rootTriggerId,
        "data-state": $isVisible ? "open" : "closed",
        "data-portal": portalAttr($portal),
        tabindex: -1
      };
    },
    action: (node) => {
      let unsubPopper = noop;
      const unsubDerived = effect$1([isVisible, rootActiveTrigger, positioning, closeOnOutsideClick, portal, closeOnEscape], ([$isVisible, $rootActiveTrigger, $positioning, $closeOnOutsideClick, $portal, $closeOnEscape]) => {
        unsubPopper();
        if (!$isVisible || !$rootActiveTrigger)
          return;
        tick().then(() => {
          unsubPopper();
          setMeltMenuAttribute(node, selector);
          unsubPopper = usePopper(node, {
            anchorElement: $rootActiveTrigger,
            open: rootOpen,
            options: {
              floating: $positioning,
              modal: {
                closeOnInteractOutside: $closeOnOutsideClick,
                shouldCloseOnInteractOutside: (e) => {
                  onOutsideClick.get()?.(e);
                  if (e.defaultPrevented)
                    return false;
                  if (isHTMLElement$1($rootActiveTrigger) && $rootActiveTrigger.contains(e.target)) {
                    return false;
                  }
                  return true;
                },
                onClose: () => {
                  rootOpen.set(false);
                  $rootActiveTrigger.focus();
                },
                open: $isVisible
              },
              portal: getPortalDestination(node, $portal),
              escapeKeydown: $closeOnEscape ? void 0 : null
            }
          }).destroy;
        });
      });
      const unsubEvents = executeCallbacks$1(addMeltEventListener(node, "keydown", (e) => {
        const target = e.target;
        const menuEl = e.currentTarget;
        if (!isHTMLElement$1(target) || !isHTMLElement$1(menuEl))
          return;
        const isKeyDownInside = target.closest('[role="menu"]') === menuEl;
        if (!isKeyDownInside)
          return;
        if (FIRST_LAST_KEYS.includes(e.key)) {
          handleMenuNavigation(e, loop.get() ?? false);
        }
        if (e.key === kbd$2.TAB) {
          e.preventDefault();
          rootOpen.set(false);
          handleTabNavigation(e, nextFocusable, prevFocusable);
          return;
        }
        const isCharacterKey = e.key.length === 1;
        const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
        if (!isModifierKey && isCharacterKey && typeahead.get() === true) {
          handleTypeaheadSearch(e.key, getMenuItems(menuEl));
        }
      }));
      return {
        destroy() {
          unsubDerived();
          unsubEvents();
          unsubPopper();
        }
      };
    }
  });
  const rootTrigger = makeElement(name2("trigger"), {
    stores: [rootOpen, rootIds.menu, rootIds.trigger],
    returned: ([$rootOpen, $rootMenuId, $rootTriggerId]) => {
      return {
        "aria-controls": $rootMenuId,
        "aria-expanded": $rootOpen,
        "data-state": $rootOpen ? "open" : "closed",
        id: $rootTriggerId,
        tabindex: 0
      };
    },
    action: (node) => {
      applyAttrsIfDisabled(node);
      rootActiveTrigger.update((p) => {
        if (p)
          return p;
        return node;
      });
      const unsub = executeCallbacks$1(addMeltEventListener(node, "click", (e) => {
        const $rootOpen = rootOpen.get();
        const triggerEl = e.currentTarget;
        if (!isHTMLElement$1(triggerEl))
          return;
        handleOpen(triggerEl);
        if (!$rootOpen)
          e.preventDefault();
      }), addMeltEventListener(node, "keydown", (e) => {
        const triggerEl = e.currentTarget;
        if (!isHTMLElement$1(triggerEl))
          return;
        if (!(SELECTION_KEYS.includes(e.key) || e.key === kbd$2.ARROW_DOWN))
          return;
        e.preventDefault();
        handleOpen(triggerEl);
        const menuId = triggerEl.getAttribute("aria-controls");
        if (!menuId)
          return;
        const menu = document.getElementById(menuId);
        if (!menu)
          return;
        const menuItems = getMenuItems(menu);
        if (!menuItems.length)
          return;
        handleRovingFocus(menuItems[0]);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const rootArrow = makeElement(name2("arrow"), {
    stores: arrowSize,
    returned: ($arrowSize) => ({
      "data-arrow": true,
      style: styleToString$3({
        position: "absolute",
        width: `var(--arrow-size, ${$arrowSize}px)`,
        height: `var(--arrow-size, ${$arrowSize}px)`
      })
    })
  });
  const overlay = makeElement(name2("overlay"), {
    stores: [isVisible],
    returned: ([$isVisible]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString$3({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": "true",
        "data-state": stateAttr$1($isVisible)
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop;
      if (closeOnEscape.get()) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            rootOpen.set(false);
            const $rootActiveTrigger = rootActiveTrigger.get();
            if ($rootActiveTrigger)
              $rootActiveTrigger.focus();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      const unsubPortal = effect$1([portal], ([$portal]) => {
        if ($portal === null)
          return noop;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return noop;
        return usePortal(node, portalDestination).destroy;
      });
      return {
        destroy() {
          unsubEscapeKeydown();
          unsubPortal();
        }
      };
    }
  });
  const item = makeElement(name2("item"), {
    returned: () => {
      return {
        role: "menuitem",
        tabindex: -1,
        "data-orientation": "vertical"
      };
    },
    action: (node) => {
      setMeltMenuAttribute(node, selector);
      applyAttrsIfDisabled(node);
      const unsub = executeCallbacks$1(addMeltEventListener(node, "pointerdown", (e) => {
        const itemEl = e.currentTarget;
        if (!isHTMLElement$1(itemEl))
          return;
        if (isElementDisabled(itemEl)) {
          e.preventDefault();
          return;
        }
      }), addMeltEventListener(node, "click", (e) => {
        const itemEl = e.currentTarget;
        if (!isHTMLElement$1(itemEl))
          return;
        if (isElementDisabled(itemEl)) {
          e.preventDefault();
          return;
        }
        if (e.defaultPrevented) {
          handleRovingFocus(itemEl);
          return;
        }
        if (closeOnItemClick.get()) {
          sleep$1(1).then(() => {
            rootOpen.set(false);
          });
        }
      }), addMeltEventListener(node, "keydown", (e) => {
        onItemKeyDown(e);
      }), addMeltEventListener(node, "pointermove", (e) => {
        onMenuItemPointerMove(e);
      }), addMeltEventListener(node, "pointerleave", (e) => {
        onMenuItemPointerLeave(e);
      }), addMeltEventListener(node, "focusin", (e) => {
        onItemFocusIn(e);
      }), addMeltEventListener(node, "focusout", (e) => {
        onItemFocusOut(e);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const group = makeElement(name2("group"), {
    returned: () => {
      return (groupId) => ({
        role: "group",
        "aria-labelledby": groupId
      });
    }
  });
  const groupLabel = makeElement(name2("group-label"), {
    returned: () => {
      return (groupId) => ({
        id: groupId
      });
    }
  });
  const checkboxItemDefaults = {
    defaultChecked: false,
    disabled: false
  };
  const createCheckboxItem = (props) => {
    const withDefaults = { ...checkboxItemDefaults, ...props };
    const checkedWritable = withDefaults.checked ?? writable(withDefaults.defaultChecked ?? null);
    const checked = overridable(checkedWritable, withDefaults.onCheckedChange);
    const disabled = writable(withDefaults.disabled);
    const checkboxItem = makeElement(name2("checkbox-item"), {
      stores: [checked, disabled],
      returned: ([$checked, $disabled]) => {
        return {
          role: "menuitemcheckbox",
          tabindex: -1,
          "data-orientation": "vertical",
          "aria-checked": isIndeterminate($checked) ? "mixed" : $checked ? "true" : "false",
          "data-disabled": disabledAttr($disabled),
          "data-state": getCheckedState($checked)
        };
      },
      action: (node) => {
        setMeltMenuAttribute(node, selector);
        applyAttrsIfDisabled(node);
        const unsub = executeCallbacks$1(addMeltEventListener(node, "pointerdown", (e) => {
          const itemEl = e.currentTarget;
          if (!isHTMLElement$1(itemEl))
            return;
          if (isElementDisabled(itemEl)) {
            e.preventDefault();
            return;
          }
        }), addMeltEventListener(node, "click", (e) => {
          const itemEl = e.currentTarget;
          if (!isHTMLElement$1(itemEl))
            return;
          if (isElementDisabled(itemEl)) {
            e.preventDefault();
            return;
          }
          if (e.defaultPrevented) {
            handleRovingFocus(itemEl);
            return;
          }
          checked.update((prev2) => {
            if (isIndeterminate(prev2))
              return true;
            return !prev2;
          });
          if (closeOnItemClick.get()) {
            tick().then(() => {
              rootOpen.set(false);
            });
          }
        }), addMeltEventListener(node, "keydown", (e) => {
          onItemKeyDown(e);
        }), addMeltEventListener(node, "pointermove", (e) => {
          const itemEl = e.currentTarget;
          if (!isHTMLElement$1(itemEl))
            return;
          if (isElementDisabled(itemEl)) {
            onItemLeave(e);
            return;
          }
          onMenuItemPointerMove(e, itemEl);
        }), addMeltEventListener(node, "pointerleave", (e) => {
          onMenuItemPointerLeave(e);
        }), addMeltEventListener(node, "focusin", (e) => {
          onItemFocusIn(e);
        }), addMeltEventListener(node, "focusout", (e) => {
          onItemFocusOut(e);
        }));
        return {
          destroy: unsub
        };
      }
    });
    const isChecked = derived(checked, ($checked) => $checked === true);
    const _isIndeterminate = derived(checked, ($checked) => $checked === "indeterminate");
    return {
      elements: {
        checkboxItem
      },
      states: {
        checked
      },
      helpers: {
        isChecked,
        isIndeterminate: _isIndeterminate
      },
      options: {
        disabled
      }
    };
  };
  const createMenuRadioGroup = (args = {}) => {
    const valueWritable = args.value ?? writable(args.defaultValue ?? null);
    const value = overridable(valueWritable, args.onValueChange);
    const radioGroup = makeElement(name2("radio-group"), {
      returned: () => ({
        role: "group"
      })
    });
    const radioItemDefaults = {
      disabled: false
    };
    const radioItem = makeElement(name2("radio-item"), {
      stores: [value],
      returned: ([$value]) => {
        return (itemProps) => {
          const { value: itemValue, disabled } = { ...radioItemDefaults, ...itemProps };
          const checked = $value === itemValue;
          return {
            disabled,
            role: "menuitemradio",
            "data-state": checked ? "checked" : "unchecked",
            "aria-checked": checked,
            "data-disabled": disabledAttr(disabled),
            "data-value": itemValue,
            "data-orientation": "vertical",
            tabindex: -1
          };
        };
      },
      action: (node) => {
        setMeltMenuAttribute(node, selector);
        const unsub = executeCallbacks$1(addMeltEventListener(node, "pointerdown", (e) => {
          const itemEl = e.currentTarget;
          if (!isHTMLElement$1(itemEl))
            return;
          const itemValue = node.dataset.value;
          const disabled = node.dataset.disabled;
          if (disabled || itemValue === void 0) {
            e.preventDefault();
            return;
          }
        }), addMeltEventListener(node, "click", (e) => {
          const itemEl = e.currentTarget;
          if (!isHTMLElement$1(itemEl))
            return;
          const itemValue = node.dataset.value;
          const disabled = node.dataset.disabled;
          if (disabled || itemValue === void 0) {
            e.preventDefault();
            return;
          }
          if (e.defaultPrevented) {
            if (!isHTMLElement$1(itemEl))
              return;
            handleRovingFocus(itemEl);
            return;
          }
          value.set(itemValue);
          if (closeOnItemClick.get()) {
            tick().then(() => {
              rootOpen.set(false);
            });
          }
        }), addMeltEventListener(node, "keydown", (e) => {
          onItemKeyDown(e);
        }), addMeltEventListener(node, "pointermove", (e) => {
          const itemEl = e.currentTarget;
          if (!isHTMLElement$1(itemEl))
            return;
          const itemValue = node.dataset.value;
          const disabled = node.dataset.disabled;
          if (disabled || itemValue === void 0) {
            onItemLeave(e);
            return;
          }
          onMenuItemPointerMove(e, itemEl);
        }), addMeltEventListener(node, "pointerleave", (e) => {
          onMenuItemPointerLeave(e);
        }), addMeltEventListener(node, "focusin", (e) => {
          onItemFocusIn(e);
        }), addMeltEventListener(node, "focusout", (e) => {
          onItemFocusOut(e);
        }));
        return {
          destroy: unsub
        };
      }
    });
    const isChecked = derived(value, ($value) => {
      return (itemValue) => {
        return $value === itemValue;
      };
    });
    return {
      elements: {
        radioGroup,
        radioItem
      },
      states: {
        value
      },
      helpers: {
        isChecked
      }
    };
  };
  const { elements: { root: separator } } = createSeparator({
    orientation: "horizontal"
  });
  const subMenuDefaults = {
    ...defaults$7,
    disabled: false,
    positioning: {
      placement: "right-start",
      gutter: 8
    }
  };
  const createSubmenu = (args) => {
    const withDefaults = { ...subMenuDefaults, ...args };
    const subOpenWritable = withDefaults.open ?? writable(false);
    const subOpen = overridable(subOpenWritable, withDefaults?.onOpenChange);
    const options = toWritableStores$1(omit$1(withDefaults, "ids"));
    const { positioning: positioning2, arrowSize: arrowSize2, disabled } = options;
    const subActiveTrigger = withGet(writable(null));
    const subOpenTimer = withGet(writable(null));
    const pointerGraceTimer = withGet(writable(0));
    const subIds = toWritableStores$1({ ...generateIds(menuIdParts), ...withDefaults.ids });
    safeOnMount(() => {
      const subTrigger2 = document.getElementById(subIds.trigger.get());
      if (subTrigger2) {
        subActiveTrigger.set(subTrigger2);
      }
    });
    const subIsVisible = derivedVisible({
      open: subOpen,
      forceVisible,
      activeTrigger: subActiveTrigger
    });
    const subMenu = makeElement(name2("submenu"), {
      stores: [subIsVisible, subIds.menu, subIds.trigger],
      returned: ([$subIsVisible, $subMenuId, $subTriggerId]) => {
        return {
          role: "menu",
          hidden: $subIsVisible ? void 0 : true,
          style: styleToString$3({
            display: $subIsVisible ? void 0 : "none"
          }),
          id: $subMenuId,
          "aria-labelledby": $subTriggerId,
          "data-state": $subIsVisible ? "open" : "closed",
          // unit tests fail on `.closest` if the id starts with a number
          // so using a data attribute
          "data-id": $subMenuId,
          tabindex: -1
        };
      },
      action: (node) => {
        let unsubPopper = noop;
        const unsubDerived = effect$1([subIsVisible, positioning2], ([$subIsVisible, $positioning]) => {
          unsubPopper();
          if (!$subIsVisible)
            return;
          const activeTrigger = subActiveTrigger.get();
          if (!activeTrigger)
            return;
          tick().then(() => {
            unsubPopper();
            const parentMenuEl = getParentMenu(activeTrigger);
            unsubPopper = usePopper(node, {
              anchorElement: activeTrigger,
              open: subOpen,
              options: {
                floating: $positioning,
                portal: isHTMLElement$1(parentMenuEl) ? parentMenuEl : void 0,
                modal: null,
                focusTrap: null,
                escapeKeydown: null
              }
            }).destroy;
          });
        });
        const unsubEvents = executeCallbacks$1(addMeltEventListener(node, "keydown", (e) => {
          if (e.key === kbd$2.ESCAPE) {
            return;
          }
          const target = e.target;
          const menuEl = e.currentTarget;
          if (!isHTMLElement$1(target) || !isHTMLElement$1(menuEl))
            return;
          const isKeyDownInside = target.closest('[role="menu"]') === menuEl;
          if (!isKeyDownInside)
            return;
          if (FIRST_LAST_KEYS.includes(e.key)) {
            e.stopImmediatePropagation();
            handleMenuNavigation(e, loop.get() ?? false);
            return;
          }
          const isCloseKey = SUB_CLOSE_KEYS["ltr"].includes(e.key);
          const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
          const isCharacterKey = e.key.length === 1;
          if (isCloseKey) {
            const $subActiveTrigger = subActiveTrigger.get();
            e.preventDefault();
            subOpen.update(() => {
              if ($subActiveTrigger) {
                handleRovingFocus($subActiveTrigger);
              }
              return false;
            });
            return;
          }
          if (e.key === kbd$2.TAB) {
            e.preventDefault();
            rootOpen.set(false);
            handleTabNavigation(e, nextFocusable, prevFocusable);
            return;
          }
          if (!isModifierKey && isCharacterKey && typeahead.get() === true) {
            handleTypeaheadSearch(e.key, getMenuItems(menuEl));
          }
        }), addMeltEventListener(node, "pointermove", (e) => {
          onMenuPointerMove(e);
        }), addMeltEventListener(node, "focusout", (e) => {
          const $subActiveTrigger = subActiveTrigger.get();
          if (isUsingKeyboard.get()) {
            const target = e.target;
            const submenuEl = document.getElementById(subIds.menu.get());
            if (!isHTMLElement$1(submenuEl) || !isHTMLElement$1(target))
              return;
            if (!submenuEl.contains(target) && target !== $subActiveTrigger) {
              subOpen.set(false);
            }
          } else {
            const menuEl = e.currentTarget;
            const relatedTarget = e.relatedTarget;
            if (!isHTMLElement$1(relatedTarget) || !isHTMLElement$1(menuEl))
              return;
            if (!menuEl.contains(relatedTarget) && relatedTarget !== $subActiveTrigger) {
              subOpen.set(false);
            }
          }
        }));
        return {
          destroy() {
            unsubDerived();
            unsubPopper();
            unsubEvents();
          }
        };
      }
    });
    const subTrigger = makeElement(name2("subtrigger"), {
      stores: [subOpen, disabled, subIds.menu, subIds.trigger],
      returned: ([$subOpen, $disabled, $subMenuId, $subTriggerId]) => {
        return {
          role: "menuitem",
          id: $subTriggerId,
          tabindex: -1,
          "aria-controls": $subMenuId,
          "aria-expanded": $subOpen,
          "data-state": $subOpen ? "open" : "closed",
          "data-disabled": disabledAttr($disabled),
          "aria-haspopop": "menu"
        };
      },
      action: (node) => {
        setMeltMenuAttribute(node, selector);
        applyAttrsIfDisabled(node);
        subActiveTrigger.update((p) => {
          if (p)
            return p;
          return node;
        });
        const unsubTimer = () => {
          clearTimerStore(subOpenTimer);
          window.clearTimeout(pointerGraceTimer.get());
          pointerGraceIntent.set(null);
        };
        const unsubEvents = executeCallbacks$1(addMeltEventListener(node, "click", (e) => {
          if (e.defaultPrevented)
            return;
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl) || isElementDisabled(triggerEl))
            return;
          handleRovingFocus(triggerEl);
          if (!subOpen.get()) {
            subOpen.update((prev2) => {
              const isAlreadyOpen = prev2;
              if (!isAlreadyOpen) {
                subActiveTrigger.set(triggerEl);
                return !prev2;
              }
              return prev2;
            });
          }
        }), addMeltEventListener(node, "keydown", (e) => {
          const $typed = typed.get();
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl) || isElementDisabled(triggerEl))
            return;
          const isTypingAhead = $typed.length > 0;
          if (isTypingAhead && e.key === kbd$2.SPACE)
            return;
          if (SUB_OPEN_KEYS["ltr"].includes(e.key)) {
            if (!subOpen.get()) {
              triggerEl.click();
              e.preventDefault();
              return;
            }
            const menuId = triggerEl.getAttribute("aria-controls");
            if (!menuId)
              return;
            const menuEl = document.getElementById(menuId);
            if (!isHTMLElement$1(menuEl))
              return;
            const firstItem = getMenuItems(menuEl)[0];
            handleRovingFocus(firstItem);
          }
        }), addMeltEventListener(node, "pointermove", (e) => {
          if (!isMouse(e))
            return;
          onItemEnter(e);
          if (e.defaultPrevented)
            return;
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl))
            return;
          if (!isFocusWithinSubmenu(subIds.menu.get())) {
            handleRovingFocus(triggerEl);
          }
          const openTimer = subOpenTimer.get();
          if (!subOpen.get() && !openTimer && !isElementDisabled(triggerEl)) {
            subOpenTimer.set(window.setTimeout(() => {
              subOpen.update(() => {
                subActiveTrigger.set(triggerEl);
                return true;
              });
              clearTimerStore(subOpenTimer);
            }, 100));
          }
        }), addMeltEventListener(node, "pointerleave", (e) => {
          if (!isMouse(e))
            return;
          clearTimerStore(subOpenTimer);
          const submenuEl = document.getElementById(subIds.menu.get());
          const contentRect = submenuEl?.getBoundingClientRect();
          if (contentRect) {
            const side = submenuEl?.dataset.side;
            const rightSide = side === "right";
            const bleed = rightSide ? -5 : 5;
            const contentNearEdge = contentRect[rightSide ? "left" : "right"];
            const contentFarEdge = contentRect[rightSide ? "right" : "left"];
            pointerGraceIntent.set({
              area: [
                // Apply a bleed on clientX to ensure that our exit point is
                // consistently within polygon bounds
                { x: e.clientX + bleed, y: e.clientY },
                { x: contentNearEdge, y: contentRect.top },
                { x: contentFarEdge, y: contentRect.top },
                { x: contentFarEdge, y: contentRect.bottom },
                { x: contentNearEdge, y: contentRect.bottom }
              ],
              side
            });
            window.clearTimeout(pointerGraceTimer.get());
            pointerGraceTimer.set(window.setTimeout(() => {
              pointerGraceIntent.set(null);
            }, 300));
          } else {
            onTriggerLeave(e);
            if (e.defaultPrevented)
              return;
            pointerGraceIntent.set(null);
          }
        }), addMeltEventListener(node, "focusout", (e) => {
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl))
            return;
          removeHighlight(triggerEl);
          const relatedTarget = e.relatedTarget;
          if (!isHTMLElement$1(relatedTarget))
            return;
          const menuId = triggerEl.getAttribute("aria-controls");
          if (!menuId)
            return;
          const menu = document.getElementById(menuId);
          if (menu && !menu.contains(relatedTarget)) {
            subOpen.set(false);
          }
        }), addMeltEventListener(node, "focusin", (e) => {
          onItemFocusIn(e);
        }));
        return {
          destroy() {
            unsubTimer();
            unsubEvents();
          }
        };
      }
    });
    const subArrow = makeElement(name2("subarrow"), {
      stores: arrowSize2,
      returned: ($arrowSize) => ({
        "data-arrow": true,
        style: styleToString$3({
          position: "absolute",
          width: `var(--arrow-size, ${$arrowSize}px)`,
          height: `var(--arrow-size, ${$arrowSize}px)`
        })
      })
    });
    effect$1([rootOpen], ([$rootOpen]) => {
      if (!$rootOpen) {
        subActiveTrigger.set(null);
        subOpen.set(false);
      }
    });
    effect$1([pointerGraceIntent], ([$pointerGraceIntent]) => {
      if (!isBrowser$1 || $pointerGraceIntent)
        return;
      window.clearTimeout(pointerGraceTimer.get());
    });
    effect$1([subOpen], ([$subOpen]) => {
      if (!isBrowser$1)
        return;
      if ($subOpen && isUsingKeyboard.get()) {
        sleep$1(1).then(() => {
          const menuEl = document.getElementById(subIds.menu.get());
          if (!menuEl)
            return;
          const menuItems = getMenuItems(menuEl);
          if (!menuItems.length)
            return;
          handleRovingFocus(menuItems[0]);
        });
      }
      if (!$subOpen) {
        const focusedItem = currentFocusedItem.get();
        const subTriggerEl = document.getElementById(subIds.trigger.get());
        if (focusedItem) {
          sleep$1(1).then(() => {
            const menuEl = document.getElementById(subIds.menu.get());
            if (!menuEl)
              return;
            if (menuEl.contains(focusedItem)) {
              removeHighlight(focusedItem);
            }
          });
        }
        if (!subTriggerEl || document.activeElement === subTriggerEl)
          return;
        removeHighlight(subTriggerEl);
      }
    });
    return {
      ids: subIds,
      elements: {
        subTrigger,
        subMenu,
        subArrow
      },
      states: {
        subOpen
      },
      options
    };
  };
  safeOnMount(() => {
    const triggerEl = document.getElementById(rootIds.trigger.get());
    if (isHTMLElement$1(triggerEl) && rootOpen.get()) {
      rootActiveTrigger.set(triggerEl);
    }
    const unsubs = [];
    const handlePointer = () => isUsingKeyboard.set(false);
    const handleKeyDown = () => {
      isUsingKeyboard.set(true);
      unsubs.push(executeCallbacks$1(addEventListener$3(document, "pointerdown", handlePointer, { capture: true, once: true }), addEventListener$3(document, "pointermove", handlePointer, { capture: true, once: true })));
    };
    const keydownListener = (e) => {
      if (e.key === kbd$2.ESCAPE && closeOnEscape.get()) {
        rootOpen.set(false);
        return;
      }
    };
    unsubs.push(addEventListener$3(document, "keydown", handleKeyDown, { capture: true }));
    unsubs.push(addEventListener$3(document, "keydown", keydownListener));
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  });
  effect$1([rootOpen, currentFocusedItem], ([$rootOpen, $currentFocusedItem]) => {
    if (!$rootOpen && $currentFocusedItem) {
      removeHighlight($currentFocusedItem);
    }
  });
  effect$1([rootOpen], ([$rootOpen]) => {
    if (!isBrowser$1)
      return;
    if (!$rootOpen) {
      const $rootActiveTrigger = rootActiveTrigger.get();
      if (!$rootActiveTrigger)
        return;
      const $closeFocus = closeFocus.get();
      if (!$rootOpen && $rootActiveTrigger) {
        handleFocus({ prop: $closeFocus, defaultEl: $rootActiveTrigger });
      }
    }
  });
  effect$1([rootOpen, preventScroll], ([$rootOpen, $preventScroll]) => {
    if (!isBrowser$1)
      return;
    const unsubs = [];
    if (opts.removeScroll && $rootOpen && $preventScroll) {
      unsubs.push(removeScroll());
    }
    sleep$1(1).then(() => {
      const menuEl = document.getElementById(rootIds.menu.get());
      if (menuEl && $rootOpen && isUsingKeyboard.get()) {
        if (disableFocusFirstItem.get()) {
          handleRovingFocus(menuEl);
          return;
        }
        const menuItems = getMenuItems(menuEl);
        if (!menuItems.length)
          return;
        handleRovingFocus(menuItems[0]);
      }
    });
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  });
  effect$1(rootOpen, ($rootOpen) => {
    if (!isBrowser$1)
      return;
    const handlePointer = () => isUsingKeyboard.set(false);
    const handleKeyDown = (e) => {
      isUsingKeyboard.set(true);
      if (e.key === kbd$2.ESCAPE && $rootOpen && closeOnEscape.get()) {
        rootOpen.set(false);
        return;
      }
    };
    return executeCallbacks$1(addEventListener$3(document, "pointerdown", handlePointer, { capture: true, once: true }), addEventListener$3(document, "pointermove", handlePointer, { capture: true, once: true }), addEventListener$3(document, "keydown", handleKeyDown, { capture: true }));
  });
  function handleOpen(triggerEl) {
    rootOpen.update((prev2) => {
      const isOpen = !prev2;
      if (isOpen) {
        nextFocusable.set(getNextFocusable(triggerEl));
        prevFocusable.set(getPreviousFocusable(triggerEl));
        rootActiveTrigger.set(triggerEl);
      }
      return isOpen;
    });
  }
  function onItemFocusIn(e) {
    const itemEl = e.currentTarget;
    if (!isHTMLElement$1(itemEl))
      return;
    const $currentFocusedItem = currentFocusedItem.get();
    if ($currentFocusedItem) {
      removeHighlight($currentFocusedItem);
    }
    addHighlight(itemEl);
    currentFocusedItem.set(itemEl);
  }
  function onItemFocusOut(e) {
    const itemEl = e.currentTarget;
    if (!isHTMLElement$1(itemEl))
      return;
    removeHighlight(itemEl);
  }
  function onItemEnter(e) {
    if (isPointerMovingToSubmenu(e)) {
      e.preventDefault();
    }
  }
  function onItemLeave(e) {
    if (isPointerMovingToSubmenu(e)) {
      return;
    }
    const target = e.target;
    if (!isHTMLElement$1(target))
      return;
    const parentMenuEl = getParentMenu(target);
    if (!parentMenuEl)
      return;
    handleRovingFocus(parentMenuEl);
  }
  function onTriggerLeave(e) {
    if (isPointerMovingToSubmenu(e)) {
      e.preventDefault();
    }
  }
  function onMenuPointerMove(e) {
    if (!isMouse(e))
      return;
    const target = e.target;
    const currentTarget = e.currentTarget;
    if (!isHTMLElement$1(currentTarget) || !isHTMLElement$1(target))
      return;
    const $lastPointerX = lastPointerX.get();
    const pointerXHasChanged = $lastPointerX !== e.clientX;
    if (currentTarget.contains(target) && pointerXHasChanged) {
      const newDir = e.clientX > $lastPointerX ? "right" : "left";
      pointerDir.set(newDir);
      lastPointerX.set(e.clientX);
    }
  }
  function onMenuItemPointerMove(e, currTarget = null) {
    if (!isMouse(e))
      return;
    onItemEnter(e);
    if (e.defaultPrevented)
      return;
    if (currTarget) {
      handleRovingFocus(currTarget);
      return;
    }
    const currentTarget = e.currentTarget;
    if (!isHTMLElement$1(currentTarget))
      return;
    handleRovingFocus(currentTarget);
  }
  function onMenuItemPointerLeave(e) {
    if (!isMouse(e))
      return;
    onItemLeave(e);
  }
  function onItemKeyDown(e) {
    const $typed = typed.get();
    const isTypingAhead = $typed.length > 0;
    if (isTypingAhead && e.key === kbd$2.SPACE) {
      e.preventDefault();
      return;
    }
    if (SELECTION_KEYS.includes(e.key)) {
      e.preventDefault();
      const itemEl = e.currentTarget;
      if (!isHTMLElement$1(itemEl))
        return;
      itemEl.click();
    }
  }
  function isIndeterminate(checked) {
    return checked === "indeterminate";
  }
  function getCheckedState(checked) {
    return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
  }
  function isPointerMovingToSubmenu(e) {
    return pointerMovingToSubmenu.get()(e);
  }
  function getParentMenu(element) {
    const parentMenuEl = element.closest('[role="menu"]');
    if (!isHTMLElement$1(parentMenuEl))
      return null;
    return parentMenuEl;
  }
  return {
    elements: {
      trigger: rootTrigger,
      menu: rootMenu,
      overlay,
      item,
      group,
      groupLabel,
      arrow: rootArrow,
      separator
    },
    builders: {
      createCheckboxItem,
      createSubmenu,
      createMenuRadioGroup
    },
    states: {
      open: rootOpen
    },
    helpers: {
      handleTypeaheadSearch
    },
    ids: rootIds,
    options: opts.rootOptions
  };
}
function handleTabNavigation(e, nextFocusable, prevFocusable) {
  if (e.shiftKey) {
    const $prevFocusable = prevFocusable.get();
    if ($prevFocusable) {
      e.preventDefault();
      sleep$1(1).then(() => $prevFocusable.focus());
      prevFocusable.set(null);
    }
  } else {
    const $nextFocusable = nextFocusable.get();
    if ($nextFocusable) {
      e.preventDefault();
      sleep$1(1).then(() => $nextFocusable.focus());
      nextFocusable.set(null);
    }
  }
}
function getMenuItems(menuElement) {
  return Array.from(menuElement.querySelectorAll(`[data-melt-menu-id="${menuElement.id}"]`)).filter((item) => isHTMLElement$1(item));
}
function applyAttrsIfDisabled(element) {
  if (!element || !isElementDisabled(element))
    return;
  element.setAttribute("data-disabled", "");
  element.setAttribute("aria-disabled", "true");
}
function clearTimerStore(timerStore) {
  if (!isBrowser$1)
    return;
  const timer = timerStore.get();
  if (timer) {
    window.clearTimeout(timer);
    timerStore.set(null);
  }
}
function isMouse(e) {
  return e.pointerType === "mouse";
}
function setMeltMenuAttribute(element, selector) {
  if (!element)
    return;
  const menuEl = element.closest(`${selector()}, ${selector("submenu")}`);
  if (!isHTMLElement$1(menuEl))
    return;
  element.setAttribute("data-melt-menu-id", menuEl.id);
}
function handleMenuNavigation(e, loop) {
  e.preventDefault();
  const currentFocusedItem = document.activeElement;
  const currentTarget = e.currentTarget;
  if (!isHTMLElement$1(currentFocusedItem) || !isHTMLElement$1(currentTarget))
    return;
  const menuItems = getMenuItems(currentTarget);
  if (!menuItems.length)
    return;
  const candidateNodes = menuItems.filter((item) => {
    if (item.hasAttribute("data-disabled") || item.getAttribute("disabled") === "true") {
      return false;
    }
    return true;
  });
  const currentIndex = candidateNodes.indexOf(currentFocusedItem);
  let nextIndex;
  switch (e.key) {
    case kbd$2.ARROW_DOWN:
      if (loop) {
        nextIndex = currentIndex < candidateNodes.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex < candidateNodes.length - 1 ? currentIndex + 1 : currentIndex;
      }
      break;
    case kbd$2.ARROW_UP:
      if (loop) {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : candidateNodes.length - 1;
      } else {
        nextIndex = currentIndex < 0 ? candidateNodes.length - 1 : currentIndex > 0 ? currentIndex - 1 : 0;
      }
      break;
    case kbd$2.HOME:
      nextIndex = 0;
      break;
    case kbd$2.END:
      nextIndex = candidateNodes.length - 1;
      break;
    default:
      return;
  }
  handleRovingFocus(candidateNodes[nextIndex]);
}
function isPointerInGraceArea(e, area) {
  if (!area)
    return false;
  const cursorPos = { x: e.clientX, y: e.clientY };
  return isPointInPolygon(cursorPos, area);
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect)
      inside = !inside;
  }
  return inside;
}
function isFocusWithinSubmenu(submenuId) {
  const activeEl = document.activeElement;
  if (!isHTMLElement$1(activeEl))
    return false;
  const submenuEl = activeEl.closest(`[data-id="${submenuId}"]`);
  return isHTMLElement$1(submenuEl);
}
function stateAttr$1(open) {
  return open ? "open" : "closed";
}
const defaults$6 = {
  isDateDisabled: void 0,
  isDateUnavailable: void 0,
  value: void 0,
  preventDeselect: false,
  numberOfMonths: 1,
  pagedNavigation: false,
  weekStartsOn: 0,
  fixedWeeks: false,
  calendarLabel: "Event Date",
  locale: "en",
  minValue: void 0,
  maxValue: void 0,
  disabled: false,
  readonly: false,
  weekdayFormat: "narrow"
};
({
  isDateDisabled: void 0,
  isDateUnavailable: void 0,
  value: void 0,
  positioning: {
    placement: "bottom"
  },
  closeOnEscape: true,
  closeOnOutsideClick: true,
  onOutsideClick: void 0,
  preventScroll: false,
  forceVisible: false,
  locale: "en",
  granularity: void 0,
  disabled: false,
  readonly: false,
  minValue: void 0,
  maxValue: void 0,
  weekdayFormat: "narrow",
  ...omit$1(defaults$6, "isDateDisabled", "isDateUnavailable", "value", "locale", "disabled", "readonly", "minValue", "maxValue", "weekdayFormat")
});
const { name: name$2 } = createElHelpers("dialog");
const defaults$5 = {
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  role: "dialog",
  defaultOpen: false,
  portal: void 0,
  forceVisible: false,
  openFocus: void 0,
  closeFocus: void 0,
  onOutsideClick: void 0
};
const dialogIdParts = ["content", "title", "description"];
function createDialog(props) {
  const withDefaults = { ...defaults$5, ...props };
  const options = toWritableStores$1(omit$1(withDefaults, "ids"));
  const { preventScroll, closeOnEscape, closeOnOutsideClick, role, portal, forceVisible, openFocus, closeFocus, onOutsideClick } = options;
  const activeTrigger = withGet.writable(null);
  const ids = toWritableStores$1({
    ...generateIds(dialogIdParts),
    ...withDefaults.ids
  });
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const isVisible = derived([open, forceVisible], ([$open, $forceVisible]) => {
    return $open || $forceVisible;
  });
  let unsubScroll = noop;
  function handleOpen(e) {
    const el = e.currentTarget;
    const triggerEl = e.currentTarget;
    if (!isHTMLElement$1(el) || !isHTMLElement$1(triggerEl))
      return;
    open.set(true);
    activeTrigger.set(triggerEl);
  }
  function handleClose() {
    open.set(false);
    handleFocus({
      prop: closeFocus.get(),
      defaultEl: activeTrigger.get()
    });
  }
  const trigger = makeElement(name$2("trigger"), {
    stores: [open],
    returned: ([$open]) => {
      return {
        "aria-haspopup": "dialog",
        "aria-expanded": $open,
        type: "button"
      };
    },
    action: (node) => {
      const unsub = executeCallbacks$1(addMeltEventListener(node, "click", (e) => {
        handleOpen(e);
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd$2.ENTER && e.key !== kbd$2.SPACE)
          return;
        e.preventDefault();
        handleOpen(e);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const overlay = makeElement(name$2("overlay"), {
    stores: [isVisible, open],
    returned: ([$isVisible, $open]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString$3({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": true,
        "data-state": $open ? "open" : "closed"
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop;
      if (closeOnEscape.get()) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      return {
        destroy() {
          unsubEscapeKeydown();
        }
      };
    }
  });
  const content = makeElement(name$2("content"), {
    stores: [isVisible, ids.content, ids.description, ids.title, open],
    returned: ([$isVisible, $contentId, $descriptionId, $titleId, $open]) => {
      return {
        id: $contentId,
        role: role.get(),
        "aria-describedby": $descriptionId,
        "aria-labelledby": $titleId,
        "aria-modal": $isVisible ? "true" : void 0,
        "data-state": $open ? "open" : "closed",
        tabindex: -1,
        hidden: $isVisible ? void 0 : true,
        style: styleToString$3({
          display: $isVisible ? void 0 : "none"
        })
      };
    },
    action: (node) => {
      let activate = noop;
      let deactivate = noop;
      const destroy = executeCallbacks$1(effect$1([open, closeOnOutsideClick, closeOnEscape], ([$open, $closeOnOutsideClick, $closeOnEscape]) => {
        if (!$open)
          return;
        const focusTrap = createFocusTrap({
          immediate: false,
          escapeDeactivates: $closeOnEscape,
          clickOutsideDeactivates: $closeOnOutsideClick,
          allowOutsideClick: true,
          returnFocusOnDeactivate: false,
          fallbackFocus: node
        });
        activate = focusTrap.activate;
        deactivate = focusTrap.deactivate;
        const ac = focusTrap.useFocusTrap(node);
        if (ac && ac.destroy) {
          return ac.destroy;
        } else {
          return focusTrap.deactivate;
        }
      }), effect$1([closeOnOutsideClick, open], ([$closeOnOutsideClick, $open]) => {
        return useModal(node, {
          open: $open,
          closeOnInteractOutside: $closeOnOutsideClick,
          onClose() {
            handleClose();
          },
          shouldCloseOnInteractOutside(e) {
            onOutsideClick.get()?.(e);
            if (e.defaultPrevented)
              return false;
            return true;
          }
        }).destroy;
      }), effect$1([closeOnEscape], ([$closeOnEscape]) => {
        if (!$closeOnEscape)
          return noop;
        return useEscapeKeydown(node, { handler: handleClose }).destroy;
      }), effect$1([isVisible], ([$isVisible]) => {
        tick().then(() => {
          if (!$isVisible) {
            deactivate();
          } else {
            activate();
          }
        });
      }));
      return {
        destroy: () => {
          unsubScroll();
          destroy();
        }
      };
    }
  });
  const portalled = makeElement(name$2("portalled"), {
    stores: portal,
    returned: ($portal) => ({
      "data-portal": portalAttr($portal)
    }),
    action: (node) => {
      const unsubPortal = effect$1([portal], ([$portal]) => {
        if ($portal === null)
          return noop;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return noop;
        return usePortal(node, portalDestination).destroy;
      });
      return {
        destroy() {
          unsubPortal();
        }
      };
    }
  });
  const title = makeElement(name$2("title"), {
    stores: [ids.title],
    returned: ([$titleId]) => ({
      id: $titleId
    })
  });
  const description = makeElement(name$2("description"), {
    stores: [ids.description],
    returned: ([$descriptionId]) => ({
      id: $descriptionId
    })
  });
  const close = makeElement(name$2("close"), {
    returned: () => ({
      type: "button"
    }),
    action: (node) => {
      const unsub = executeCallbacks$1(addMeltEventListener(node, "click", () => {
        handleClose();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd$2.SPACE && e.key !== kbd$2.ENTER)
          return;
        e.preventDefault();
        handleClose();
      }));
      return {
        destroy: unsub
      };
    }
  });
  effect$1([open, preventScroll], ([$open, $preventScroll]) => {
    if (!isBrowser$1)
      return;
    if ($preventScroll && $open)
      unsubScroll = removeScroll();
    if ($open) {
      const contentEl = document.getElementById(ids.content.get());
      handleFocus({ prop: openFocus.get(), defaultEl: contentEl });
    }
    return () => {
      if (!forceVisible.get()) {
        unsubScroll();
      }
    };
  });
  return {
    ids,
    elements: {
      content,
      trigger,
      title,
      description,
      overlay,
      close,
      portalled
    },
    states: {
      open
    },
    options
  };
}
const defaults$4 = {
  arrowSize: 8,
  positioning: {
    placement: "bottom"
  },
  preventScroll: true,
  closeOnEscape: true,
  closeOnOutsideClick: true,
  portal: void 0,
  loop: false,
  dir: "ltr",
  defaultOpen: false,
  forceVisible: false,
  typeahead: true,
  closeFocus: void 0,
  disableFocusFirstItem: false,
  closeOnItemClick: true,
  onOutsideClick: void 0
};
function createDropdownMenu(props) {
  const withDefaults = { ...defaults$4, ...props };
  const rootOptions = toWritableStores$1(omit$1(withDefaults, "ids"));
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const rootOpen = overridable(openWritable, withDefaults?.onOpenChange);
  const rootActiveTrigger = withGet(writable(null));
  const nextFocusable = withGet(writable(null));
  const prevFocusable = withGet(writable(null));
  const { elements, builders, ids, states, options } = createMenuBuilder({
    rootOptions,
    rootOpen,
    rootActiveTrigger: withGet(rootActiveTrigger),
    nextFocusable: withGet(nextFocusable),
    prevFocusable: withGet(prevFocusable),
    selector: "dropdown-menu",
    removeScroll: true,
    ids: withDefaults.ids
  });
  return {
    ids,
    elements,
    states,
    builders,
    options
  };
}
const MENUBAR_NAV_KEYS = [kbd$2.ARROW_LEFT, kbd$2.ARROW_RIGHT, kbd$2.HOME, kbd$2.END];
const { name: name$1 } = createElHelpers("menubar");
const defaults$3 = {
  loop: true,
  closeOnEscape: true,
  preventScroll: false
};
const menubarIdParts = ["menubar"];
function createMenubar(props) {
  const withDefaults = { ...defaults$3, ...props };
  const options = toWritableStores$1(omit$1(withDefaults, "ids"));
  const { loop, closeOnEscape, preventScroll } = options;
  const activeMenu = withGet(writable(""));
  const nextFocusable = withGet(writable(null));
  const prevFocusable = withGet(writable(null));
  const lastFocusedMenuTrigger = withGet(writable(null));
  const closeTimer = withGet(writable(0));
  let scrollRemoved = false;
  const ids = toWritableStores$1({ ...generateIds(menubarIdParts), ...withDefaults.ids });
  const menubar = makeElement(name$1(), {
    stores: [ids.menubar],
    returned([$menubarId]) {
      return {
        role: "menubar",
        "data-melt-menubar": "",
        "data-orientation": "horizontal",
        id: $menubarId
      };
    },
    action: (node) => {
      const menuTriggers = Array.from(node.querySelectorAll("[data-melt-menubar-trigger]"));
      if (!isHTMLElement$1(menuTriggers[0]))
        return {};
      menuTriggers[0].tabIndex = 0;
      return {
        destroy: noop
      };
    }
  });
  const menuDefaults = {
    positioning: {
      placement: "bottom-start"
    },
    arrowSize: 8,
    dir: "ltr",
    loop: false,
    closeOnEscape: true,
    closeOnOutsideClick: true,
    portal: void 0,
    forceVisible: false,
    defaultOpen: false,
    typeahead: true,
    closeFocus: void 0,
    disableFocusFirstItem: false,
    closeOnItemClick: true,
    onOutsideClick: void 0
  };
  const createMenu = (props2) => {
    const withDefaults2 = { ...menuDefaults, ...props2 };
    const rootOpen = withGet(writable(false));
    const rootActiveTrigger = withGet(writable(null));
    const options2 = toWritableStores$1(withDefaults2);
    const { positioning, portal, forceVisible, closeOnOutsideClick, onOutsideClick } = options2;
    const m = createMenuBuilder({
      rootOptions: { ...options2, preventScroll },
      rootOpen: withGet(rootOpen),
      rootActiveTrigger: withGet(rootActiveTrigger),
      nextFocusable: withGet(nextFocusable),
      prevFocusable: withGet(prevFocusable),
      selector: "menubar-menu",
      removeScroll: false
    });
    const isVisible = derivedVisible({
      open: rootOpen,
      forceVisible,
      activeTrigger: rootActiveTrigger
    });
    const menu = makeElement(name$1("menu"), {
      stores: [isVisible, portal, m.ids.menu, m.ids.trigger, ids.menubar],
      returned: ([$isVisible, $portal, $menuId, $triggerId, $menubarId]) => {
        return {
          role: "menu",
          hidden: $isVisible ? void 0 : true,
          style: styleToString$3({
            display: $isVisible ? void 0 : "none"
          }),
          id: $menuId,
          "aria-labelledby": $triggerId,
          "data-state": $isVisible ? "open" : "closed",
          "data-melt-scope": $menubarId,
          "data-portal": portalAttr($portal),
          tabindex: -1
        };
      },
      action: (node) => {
        let unsubPopper = noop;
        const unsubDerived = effect$1([rootOpen, rootActiveTrigger, positioning, portal, closeOnOutsideClick], ([$rootOpen, $rootActiveTrigger, $positioning, $portal, $closeOnOutsideClick]) => {
          unsubPopper();
          if (!($rootOpen && $rootActiveTrigger))
            return;
          tick().then(() => {
            unsubPopper();
            unsubPopper = usePopper(node, {
              anchorElement: $rootActiveTrigger,
              open: rootOpen,
              options: {
                floating: $positioning,
                portal: getPortalDestination(node, $portal),
                modal: {
                  closeOnInteractOutside: $closeOnOutsideClick,
                  shouldCloseOnInteractOutside: (e) => {
                    onOutsideClick.get()?.(e);
                    if (e.defaultPrevented)
                      return false;
                    const target = e.target;
                    const menubarEl = document.getElementById(ids.menubar.get());
                    if (!menubarEl || !isElement(target))
                      return true;
                    if (menubarEl.contains(target))
                      return false;
                    return true;
                  },
                  onClose: () => {
                    activeMenu.set("");
                  },
                  open: $rootOpen
                }
              }
            }).destroy;
          });
        });
        const unsubEvents = executeCallbacks$1(addMeltEventListener(node, "keydown", (e) => {
          const target = e.target;
          const menuEl = e.currentTarget;
          if (!isHTMLElement$1(menuEl) || !isHTMLElement$1(target))
            return;
          if (MENUBAR_NAV_KEYS.includes(e.key)) {
            handleCrossMenuNavigation(e);
          }
          const isKeyDownInside = target.closest('[role="menu"]') === menuEl;
          if (!isKeyDownInside)
            return;
          if (FIRST_LAST_KEYS.includes(e.key)) {
            handleMenuNavigation(e);
          }
          if (e.key === kbd$2.TAB) {
            e.preventDefault();
            rootActiveTrigger.set(null);
            rootOpen.set(false);
            handleTabNavigation(e, nextFocusable, prevFocusable);
          }
          const isCharacterKey = e.key.length === 1;
          const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
          if (!isModifierKey && isCharacterKey) {
            m.helpers.handleTypeaheadSearch(e.key, getMenuItems(menuEl));
          }
        }));
        return {
          destroy() {
            unsubDerived();
            unsubEvents();
            unsubPopper();
          }
        };
      }
    });
    const trigger = makeElement(name$1("trigger"), {
      stores: [rootOpen, m.ids.menu, m.ids.trigger],
      returned: ([$rootOpen, $menuId, $triggerId]) => {
        return {
          "aria-controls": $menuId,
          "aria-expanded": $rootOpen,
          "data-state": $rootOpen ? "open" : "closed",
          id: $triggerId,
          "aria-haspopup": "menu",
          "data-orientation": "horizontal",
          role: "menuitem"
        };
      },
      action: (node) => {
        applyAttrsIfDisabled(node);
        const menubarEl = document.getElementById(ids.menubar.get());
        if (!menubarEl)
          return {};
        const menubarTriggers = Array.from(menubarEl.querySelectorAll("[data-melt-menubar-trigger]"));
        if (!menubarTriggers.length)
          return {};
        const unsubEffect = effect$1([lastFocusedMenuTrigger], ([$lastFocusedMenuTrigger]) => {
          if (!$lastFocusedMenuTrigger && menubarTriggers[0] === node) {
            node.tabIndex = 0;
          } else if ($lastFocusedMenuTrigger === node) {
            node.tabIndex = 0;
          } else {
            node.tabIndex = -1;
          }
        });
        if (menubarTriggers[0] === node) {
          node.tabIndex = 0;
        } else {
          node.tabIndex = -1;
        }
        const unsub = executeCallbacks$1(addMeltEventListener(node, "click", (e) => {
          const $rootOpen = rootOpen.get();
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl))
            return;
          handleOpen(triggerEl);
          if (!$rootOpen)
            e.preventDefault();
        }), addMeltEventListener(node, "keydown", (e) => {
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl))
            return;
          if (SELECTION_KEYS.includes(e.key) || e.key === kbd$2.ARROW_DOWN) {
            e.preventDefault();
            handleOpen(triggerEl);
            const menuId = triggerEl.getAttribute("aria-controls");
            if (!menuId)
              return;
            const menu2 = document.getElementById(menuId);
            if (!menu2)
              return;
            const menuItems = getMenuItems(menu2);
            if (!menuItems.length)
              return;
            handleRovingFocus(menuItems[0]);
          }
        }), addMeltEventListener(node, "pointerenter", (e) => {
          const triggerEl = e.currentTarget;
          if (!isHTMLElement$1(triggerEl))
            return;
          const $activeMenu = activeMenu.get();
          const $rootOpen = rootOpen.get();
          if ($activeMenu && !$rootOpen) {
            rootOpen.set(true);
            activeMenu.set(m.ids.menu.get());
            rootActiveTrigger.set(triggerEl);
          }
        }));
        return {
          destroy() {
            unsub();
            unsubEffect();
          }
        };
      }
    });
    function handleOpen(triggerEl) {
      rootOpen.update((prev2) => {
        const isOpen = !prev2;
        if (isOpen) {
          nextFocusable.set(getNextFocusable(triggerEl));
          prevFocusable.set(getPreviousFocusable(triggerEl));
          rootActiveTrigger.set(triggerEl);
          activeMenu.set(m.ids.menu.get());
        } else {
          rootActiveTrigger.set(null);
        }
        return isOpen;
      });
    }
    effect$1([activeMenu], ([$activeMenu]) => {
      if (!isBrowser$1)
        return;
      if ($activeMenu === m.ids.menu.get()) {
        if (rootOpen.get())
          return;
        const triggerEl = document.getElementById(m.ids.trigger.get());
        if (!triggerEl)
          return;
        rootActiveTrigger.set(triggerEl);
        addHighlight(triggerEl);
        rootOpen.set(true);
        return;
      }
      if ($activeMenu !== m.ids.menu.get()) {
        if (!isBrowser$1)
          return;
        if (rootOpen.get()) {
          const triggerEl = document.getElementById(m.ids.trigger.get());
          if (!triggerEl)
            return;
          rootActiveTrigger.set(null);
          rootOpen.set(false);
          removeHighlight(triggerEl);
        }
        return;
      }
    });
    effect$1([rootOpen], ([$rootOpen]) => {
      if (!isBrowser$1)
        return;
      const triggerEl = document.getElementById(m.ids.trigger.get());
      if (!triggerEl)
        return;
      if (!$rootOpen && activeMenu.get() === m.ids.menu.get()) {
        rootActiveTrigger.set(null);
        activeMenu.set("");
        removeHighlight(triggerEl);
        return;
      }
      if ($rootOpen) {
        lastFocusedMenuTrigger.set(triggerEl);
        addHighlight(triggerEl);
      }
    });
    safeOnMount(() => {
      if (!isBrowser$1)
        return;
      const triggerEl = document.getElementById(m.ids.trigger.get());
      if (isHTMLElement$1(triggerEl) && rootOpen.get()) {
        rootActiveTrigger.set(triggerEl);
      }
    });
    return {
      ids: m.ids,
      elements: {
        ...m.elements,
        menu,
        trigger
      },
      builders: m.builders,
      states: m.states,
      options: options2
    };
  };
  function handleCrossMenuNavigation(e) {
    if (!isBrowser$1)
      return;
    e.preventDefault();
    const currentTarget = e.currentTarget;
    const target = e.target;
    if (!isHTMLElement$1(target) || !isHTMLElement$1(currentTarget))
      return;
    const targetIsSubTrigger = target.hasAttribute("data-melt-menubar-menu-subtrigger");
    const isKeyDownInsideSubMenu = target.closest('[role="menu"]') !== currentTarget;
    const prevMenuKey = kbd$2.ARROW_LEFT;
    const isPrevKey = e.key === prevMenuKey;
    const isNextKey = !isPrevKey;
    if (isNextKey && targetIsSubTrigger)
      return;
    if (isPrevKey && isKeyDownInsideSubMenu)
      return;
    const menubarEl = document.getElementById(ids.menubar.get());
    if (!isHTMLElement$1(menubarEl))
      return;
    const triggers = getMenuTriggers(menubarEl);
    const currTriggerId = currentTarget.getAttribute("aria-labelledby");
    const currIndex = triggers.findIndex((trigger) => trigger.id === currTriggerId);
    let nextIndex;
    switch (e.key) {
      case kbd$2.ARROW_RIGHT:
        nextIndex = currIndex < triggers.length - 1 ? currIndex + 1 : 0;
        break;
      case kbd$2.ARROW_LEFT:
        nextIndex = currIndex > 0 ? currIndex - 1 : triggers.length - 1;
        break;
      case kbd$2.HOME:
        nextIndex = 0;
        break;
      case kbd$2.END:
        nextIndex = triggers.length - 1;
        break;
      default:
        return;
    }
    const nextFocusedTrigger = triggers[nextIndex];
    const menuId = nextFocusedTrigger.getAttribute("aria-controls");
    menuId && activeMenu.set(menuId);
  }
  function getMenuTriggers(el) {
    const menuEl = el.closest('[role="menubar"]');
    if (!isHTMLElement$1(menuEl))
      return [];
    return Array.from(menuEl.querySelectorAll("[data-melt-menubar-trigger]")).filter((el2) => isHTMLElement$1(el2));
  }
  function handleMenubarNavigation(e) {
    e.preventDefault();
    const currentFocusedItem = document.activeElement;
    const currentTarget = e.currentTarget;
    if (!isHTMLElement$1(currentTarget) || !isHTMLElement$1(currentFocusedItem))
      return;
    const menuTriggers = getMenuTriggers(currentTarget);
    if (!menuTriggers.length)
      return;
    const candidateNodes = menuTriggers.filter((item) => {
      if (item.hasAttribute("data-disabled")) {
        return false;
      }
      if (item.getAttribute("disabled") === "true") {
        return false;
      }
      return true;
    });
    const currentIndex = candidateNodes.indexOf(currentFocusedItem);
    let nextIndex;
    const $loop = loop.get();
    switch (e.key) {
      case kbd$2.ARROW_RIGHT:
        nextIndex = currentIndex < candidateNodes.length - 1 ? currentIndex + 1 : $loop ? 0 : currentIndex;
        break;
      case kbd$2.ARROW_LEFT:
        nextIndex = currentIndex > 0 ? currentIndex - 1 : $loop ? candidateNodes.length - 1 : 0;
        break;
      case kbd$2.HOME:
        nextIndex = 0;
        break;
      case kbd$2.END:
        nextIndex = candidateNodes.length - 1;
        break;
      default:
        return;
    }
    handleRovingFocus(candidateNodes[nextIndex]);
  }
  safeOnMount(() => {
    if (!isBrowser$1)
      return;
    const menubarEl = document.getElementById(ids.menubar.get());
    if (!menubarEl)
      return;
    const unsubEvents = executeCallbacks$1(addMeltEventListener(menubarEl, "keydown", (e) => {
      const target = e.target;
      const menuEl = e.currentTarget;
      if (!isHTMLElement$1(menuEl) || !isHTMLElement$1(target))
        return;
      const isTargetTrigger = target.hasAttribute("data-melt-menubar-trigger");
      if (!isTargetTrigger)
        return;
      if (MENUBAR_NAV_KEYS.includes(e.key)) {
        handleMenubarNavigation(e);
      }
    }), addEventListener$3(document, "keydown", (e) => {
      if (closeOnEscape.get() && e.key === kbd$2.ESCAPE) {
        window.clearTimeout(closeTimer.get());
        activeMenu.set("");
      }
    }));
    return () => {
      unsubEvents();
    };
  });
  const unsubs = [];
  effect$1([activeMenu, preventScroll], ([$activeMenu, $preventScroll]) => {
    if (!isBrowser$1 || !$preventScroll)
      return;
    if (!$activeMenu) {
      unsubs.forEach((unsub) => unsub());
      scrollRemoved = false;
    } else if (!scrollRemoved) {
      unsubs.push(removeScroll());
      scrollRemoved = true;
    }
  });
  safeOnDestroy(() => {
    unsubs.forEach((unsub) => unsub());
  });
  return {
    ids,
    elements: {
      menubar
    },
    builders: {
      createMenu
    },
    options
  };
}
const defaults$2 = {
  positioning: {
    placement: "bottom"
  },
  arrowSize: 8,
  defaultOpen: false,
  disableFocusTrap: false,
  closeOnEscape: true,
  preventScroll: false,
  onOpenChange: void 0,
  closeOnOutsideClick: true,
  portal: void 0,
  forceVisible: false,
  openFocus: void 0,
  closeFocus: void 0,
  onOutsideClick: void 0
};
const { name } = createElHelpers("popover");
const popoverIdParts = ["trigger", "content"];
function createPopover(args) {
  const withDefaults = { ...defaults$2, ...args };
  const options = toWritableStores$1(omit$1(withDefaults, "open", "ids"));
  const { positioning, arrowSize, disableFocusTrap, preventScroll, closeOnEscape, closeOnOutsideClick, portal, forceVisible, openFocus, closeFocus, onOutsideClick } = options;
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const activeTrigger = withGet.writable(null);
  const ids = toWritableStores$1({ ...generateIds(popoverIdParts), ...withDefaults.ids });
  safeOnMount(() => {
    activeTrigger.set(document.getElementById(ids.trigger.get()));
  });
  function handleClose() {
    open.set(false);
    const triggerEl = document.getElementById(ids.trigger.get());
    handleFocus({ prop: closeFocus.get(), defaultEl: triggerEl });
  }
  const isVisible = derivedVisible({ open, activeTrigger, forceVisible });
  const content = makeElement(name("content"), {
    stores: [isVisible, portal, ids.content],
    returned: ([$isVisible, $portal, $contentId]) => {
      return {
        hidden: $isVisible && isBrowser$1 ? void 0 : true,
        tabindex: -1,
        style: styleToString$3({
          display: $isVisible ? void 0 : "none"
        }),
        id: $contentId,
        "data-state": $isVisible ? "open" : "closed",
        "data-portal": portalAttr($portal)
      };
    },
    action: (node) => {
      let unsubPopper = noop;
      const unsubDerived = effect$1([
        isVisible,
        activeTrigger,
        positioning,
        disableFocusTrap,
        closeOnEscape,
        closeOnOutsideClick,
        portal
      ], ([$isVisible, $activeTrigger, $positioning, $disableFocusTrap, $closeOnEscape, $closeOnOutsideClick, $portal]) => {
        unsubPopper();
        if (!$isVisible || !$activeTrigger)
          return;
        tick().then(() => {
          unsubPopper();
          unsubPopper = usePopper(node, {
            anchorElement: $activeTrigger,
            open,
            options: {
              floating: $positioning,
              focusTrap: $disableFocusTrap ? null : {
                returnFocusOnDeactivate: false,
                clickOutsideDeactivates: $closeOnOutsideClick,
                allowOutsideClick: true,
                escapeDeactivates: $closeOnEscape
              },
              modal: {
                shouldCloseOnInteractOutside,
                onClose: handleClose,
                open: $isVisible,
                closeOnInteractOutside: $closeOnOutsideClick
              },
              escapeKeydown: $closeOnEscape ? {
                handler: () => {
                  handleClose();
                }
              } : null,
              portal: getPortalDestination(node, $portal)
            }
          }).destroy;
        });
      });
      return {
        destroy() {
          unsubDerived();
          unsubPopper();
        }
      };
    }
  });
  function toggleOpen(triggerEl) {
    open.update((prev2) => {
      return !prev2;
    });
    if (triggerEl && triggerEl !== activeTrigger.get()) {
      activeTrigger.set(triggerEl);
    }
  }
  function shouldCloseOnInteractOutside(e) {
    onOutsideClick.get()?.(e);
    if (e.defaultPrevented)
      return false;
    const target = e.target;
    const triggerEl = document.getElementById(ids.trigger.get());
    if (triggerEl && isElement(target)) {
      if (target === triggerEl || triggerEl.contains(target))
        return false;
    }
    return true;
  }
  const trigger = makeElement(name("trigger"), {
    stores: [isVisible, ids.content, ids.trigger],
    returned: ([$isVisible, $contentId, $triggerId]) => {
      return {
        role: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": $isVisible ? "true" : "false",
        "data-state": stateAttr($isVisible),
        "aria-controls": $contentId,
        id: $triggerId
      };
    },
    action: (node) => {
      const unsub = executeCallbacks$1(addMeltEventListener(node, "click", () => {
        toggleOpen(node);
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd$2.ENTER && e.key !== kbd$2.SPACE)
          return;
        e.preventDefault();
        toggleOpen(node);
      }));
      return {
        destroy: unsub
      };
    }
  });
  const overlay = makeElement(name("overlay"), {
    stores: [isVisible],
    returned: ([$isVisible]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString$3({
          display: $isVisible ? void 0 : "none"
        }),
        "aria-hidden": "true",
        "data-state": stateAttr($isVisible)
      };
    },
    action: (node) => {
      let unsubEscapeKeydown = noop;
      let unsubDerived = noop;
      let unsubPortal = noop;
      if (closeOnEscape.get()) {
        const escapeKeydown = useEscapeKeydown(node, {
          handler: () => {
            handleClose();
          }
        });
        if (escapeKeydown && escapeKeydown.destroy) {
          unsubEscapeKeydown = escapeKeydown.destroy;
        }
      }
      unsubDerived = effect$1([portal], ([$portal]) => {
        unsubPortal();
        if ($portal === null)
          return;
        const portalDestination = getPortalDestination(node, $portal);
        if (portalDestination === null)
          return;
        unsubPortal = usePortal(node, portalDestination).destroy;
      });
      return {
        destroy() {
          unsubEscapeKeydown();
          unsubDerived();
          unsubPortal();
        }
      };
    }
  });
  const arrow2 = makeElement(name("arrow"), {
    stores: arrowSize,
    returned: ($arrowSize) => ({
      "data-arrow": true,
      style: styleToString$3({
        position: "absolute",
        width: `var(--arrow-size, ${$arrowSize}px)`,
        height: `var(--arrow-size, ${$arrowSize}px)`
      })
    })
  });
  const close = makeElement(name("close"), {
    returned: () => ({
      type: "button"
    }),
    action: (node) => {
      const unsub = executeCallbacks$1(addMeltEventListener(node, "click", (e) => {
        if (e.defaultPrevented)
          return;
        handleClose();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.defaultPrevented)
          return;
        if (e.key !== kbd$2.ENTER && e.key !== kbd$2.SPACE)
          return;
        e.preventDefault();
        toggleOpen();
      }));
      return {
        destroy: unsub
      };
    }
  });
  effect$1([open, activeTrigger, preventScroll], ([$open, $activeTrigger, $preventScroll]) => {
    if (!isBrowser$1)
      return;
    const unsubs = [];
    if ($open) {
      if (!$activeTrigger) {
        tick().then(() => {
          const triggerEl2 = document.getElementById(ids.trigger.get());
          if (!isHTMLElement$1(triggerEl2))
            return;
          activeTrigger.set(triggerEl2);
        });
      }
      if ($preventScroll) {
        unsubs.push(removeScroll());
      }
      const triggerEl = $activeTrigger ?? document.getElementById(ids.trigger.get());
      handleFocus({ prop: openFocus.get(), defaultEl: triggerEl });
    }
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  });
  return {
    ids,
    elements: {
      trigger,
      content,
      arrow: arrow2,
      close,
      overlay
    },
    states: {
      open
    },
    options
  };
}
function stateAttr(open) {
  return open ? "open" : "closed";
}
function createSelect(props) {
  const listbox = createListbox({ ...props, builder: "select" });
  const selectedLabel = derived(listbox.states.selected, ($selected) => {
    if (Array.isArray($selected)) {
      return $selected.map((o) => o.label).join(", ");
    }
    return $selected?.label ?? "";
  });
  return {
    ...listbox,
    elements: {
      ...listbox.elements
    },
    states: {
      ...listbox.states,
      selectedLabel
    }
  };
}
const defaults$1 = {
  orientation: "horizontal",
  decorative: false
};
const createSeparator = (props) => {
  const withDefaults = { ...defaults$1, ...props };
  const options = toWritableStores$1(withDefaults);
  const { orientation, decorative } = options;
  const root = makeElement("separator", {
    stores: [orientation, decorative],
    returned: ([$orientation, $decorative]) => {
      const ariaOrientation = $orientation === "vertical" ? $orientation : void 0;
      return {
        role: $decorative ? "none" : "separator",
        "aria-orientation": ariaOrientation,
        "aria-hidden": $decorative,
        "data-orientation": $orientation
      };
    }
  });
  return {
    elements: {
      root
    },
    options
  };
};
function createBitAttrs$1(bit, parts) {
  const attrs = {};
  parts.forEach((part) => {
    attrs[part] = {
      [`data-${bit}-${part}`]: ""
    };
  });
  return (part) => attrs[part];
}
function disabledAttrs(disabled) {
  return disabled ? { "aria-disabled": "true", "data-disabled": "" } : { "aria-disabled": void 0, "data-disabled": void 0 };
}
function createDispatcher() {
  const dispatch = createEventDispatcher();
  return (e) => {
    const { originalEvent } = e.detail;
    const { cancelable } = e;
    const type = originalEvent.type;
    const shouldContinue = dispatch(type, { originalEvent, currentTarget: originalEvent.currentTarget }, { cancelable });
    if (!shouldContinue) {
      e.preventDefault();
    }
  };
}
function removeUndefined$1(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function getOptionUpdater(options) {
  return function(key, value) {
    if (value === void 0)
      return;
    const store = options[key];
    if (store) {
      store.set(value);
    }
  };
}
function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every((value, index) => value === arr2[index]);
}
function getAvatarData() {
  const NAME2 = "avatar";
  const PARTS2 = ["root", "image", "fallback"];
  return {
    NAME: NAME2,
    PARTS: PARTS2
  };
}
function setCtx$6(props) {
  const { NAME: NAME2, PARTS: PARTS2 } = getAvatarData();
  const getAttrs2 = createBitAttrs$1(NAME2, PARTS2);
  const avatar = { ...createAvatar(removeUndefined$1(props)), getAttrs: getAttrs2 };
  setContext(NAME2, avatar);
  return {
    ...avatar,
    updateOption: getOptionUpdater(avatar.options)
  };
}
function getImage(src = "") {
  const { NAME: NAME2 } = getAvatarData();
  const avatar = getContext(NAME2);
  if (!src) {
    avatar.options.src.set("");
  } else {
    avatar.options.src.set(src);
  }
  return avatar;
}
function getCtx$6() {
  const { NAME: NAME2 } = getAvatarData();
  return getContext(NAME2);
}
const Avatar$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["delayMs", "loadingStatus", "onLoadingStatusChange", "asChild", "el"]);
  let { delayMs = void 0 } = $$props;
  let { loadingStatus = void 0 } = $$props;
  let { onLoadingStatusChange = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { states: { loadingStatus: localLoadingStatus }, updateOption, getAttrs: getAttrs2 } = setCtx$6({
    src: "",
    delayMs,
    onLoadingStatusChange: ({ next: next2 }) => {
      loadingStatus = next2;
      onLoadingStatusChange?.(next2);
      return next2;
    }
  });
  const attrs = getAttrs2("root");
  if ($$props.delayMs === void 0 && $$bindings.delayMs && delayMs !== void 0)
    $$bindings.delayMs(delayMs);
  if ($$props.loadingStatus === void 0 && $$bindings.loadingStatus && loadingStatus !== void 0)
    $$bindings.loadingStatus(loadingStatus);
  if ($$props.onLoadingStatusChange === void 0 && $$bindings.onLoadingStatusChange && onLoadingStatusChange !== void 0)
    $$bindings.onLoadingStatusChange(onLoadingStatusChange);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  loadingStatus !== void 0 && localLoadingStatus.set(loadingStatus);
  {
    updateOption("delayMs", delayMs);
  }
  return `${asChild ? `${slots.default ? slots.default({ attrs }) : ``}` : `<div${spread([escape_object($$restProps), escape_object(attrs)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ attrs }) : ``}</div>`}`;
});
const Avatar_image$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let image;
  let builder;
  let $$restProps = compute_rest_props($$props, ["src", "alt", "asChild", "el"]);
  let $image, $$unsubscribe_image = noop$1, $$subscribe_image = () => ($$unsubscribe_image(), $$unsubscribe_image = subscribe(image, ($$value) => $image = $$value), image);
  let { src = void 0 } = $$props;
  let { alt = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const attrs = { "data-bits-avatar-image": "" };
  if ($$props.src === void 0 && $$bindings.src && src !== void 0)
    $$bindings.src(src);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  $$subscribe_image(image = getImage(src).elements.image);
  builder = $image;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_image();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<img${spread(
    [
      escape_object(builder),
      { alt: escape_attribute_value(alt) },
      escape_object($$restProps)
    ],
    {}
  )}${add_attribute("this", el, 0)}>`}`;
});
const Avatar_fallback$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $fallback, $$unsubscribe_fallback;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { fallback }, getAttrs: getAttrs2 } = getCtx$6();
  $$unsubscribe_fallback = subscribe(fallback, (value) => $fallback = value);
  const attrs = getAttrs2("fallback");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $fallback;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_fallback();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<span${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</span>`}`;
});
function getAttrs(builders) {
  const attrs = {};
  builders.forEach((builder) => {
    Object.keys(builder).forEach((key) => {
      if (key !== "action") {
        attrs[key] = builder[key];
      }
    });
  });
  return attrs;
}
const Button$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "type", "builders", "el"]);
  let { href = void 0 } = $$props;
  let { type = void 0 } = $$props;
  let { builders = [] } = $$props;
  let { el = void 0 } = $$props;
  const attrs = { "data-button-root": "" };
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.builders === void 0 && $$bindings.builders && builders !== void 0)
    $$bindings.builders(builders);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  return `${builders && builders.length ? ` ${((tag) => {
    return tag ? `<${href ? "a" : "button"}${spread(
      [
        {
          type: escape_attribute_value(href ? void 0 : type)
        },
        { href: escape_attribute_value(href) },
        { tabindex: "0" },
        escape_object(getAttrs(builders)),
        escape_object($$restProps),
        escape_object(attrs)
      ],
      {}
    )}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(href ? "a" : "button")}` : ` ${((tag) => {
    return tag ? `<${href ? "a" : "button"}${spread(
      [
        {
          type: escape_attribute_value(href ? void 0 : type)
        },
        { href: escape_attribute_value(href) },
        { tabindex: "0" },
        escape_object($$restProps),
        escape_object(attrs)
      ],
      {}
    )}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(href ? "a" : "button")}`}`;
});
function getPositioningUpdater(store) {
  return (props = {}) => {
    return updatePositioning$3(store, props);
  };
}
function updatePositioning$3(store, props) {
  const defaultPositioningProps = {
    side: "bottom",
    align: "center",
    sideOffset: 0,
    alignOffset: 0,
    sameWidth: false,
    avoidCollisions: true,
    collisionPadding: 8,
    fitViewport: false,
    strategy: "absolute",
    overlap: false
  };
  const withDefaults = { ...defaultPositioningProps, ...props };
  store.update((prev2) => {
    return {
      ...prev2,
      placement: joinPlacement(withDefaults.side, withDefaults.align),
      offset: {
        ...prev2.offset,
        mainAxis: withDefaults.sideOffset,
        crossAxis: withDefaults.alignOffset
      },
      gutter: 0,
      sameWidth: withDefaults.sameWidth,
      flip: withDefaults.avoidCollisions,
      overflowPadding: withDefaults.collisionPadding,
      boundary: withDefaults.collisionBoundary,
      fitViewport: withDefaults.fitViewport,
      strategy: withDefaults.strategy,
      overlap: withDefaults.overlap
    };
  });
}
function joinPlacement(side, align) {
  if (align === "center")
    return side;
  return `${side}-${align}`;
}
function getSeparatorData() {
  const NAME2 = "separator";
  const PARTS2 = ["root"];
  return {
    NAME: NAME2,
    PARTS: PARTS2
  };
}
function setCtx$5(props) {
  const { NAME: NAME2, PARTS: PARTS2 } = getSeparatorData();
  const getAttrs2 = createBitAttrs$1(NAME2, PARTS2);
  const separator = { ...createSeparator(removeUndefined$1(props)), getAttrs: getAttrs2 };
  return {
    ...separator,
    updateOption: getOptionUpdater(separator.options)
  };
}
const Separator$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["orientation", "decorative", "asChild", "el"]);
  let $root, $$unsubscribe_root;
  let { orientation = "horizontal" } = $$props;
  let { decorative = true } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root }, updateOption, getAttrs: getAttrs2 } = setCtx$5({ orientation, decorative });
  $$unsubscribe_root = subscribe(root, (value) => $root = value);
  const attrs = getAttrs2("root");
  if ($$props.orientation === void 0 && $$bindings.orientation && orientation !== void 0)
    $$bindings.orientation(orientation);
  if ($$props.decorative === void 0 && $$bindings.decorative && decorative !== void 0)
    $$bindings.decorative(decorative);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    updateOption("orientation", orientation);
  }
  {
    updateOption("decorative", decorative);
  }
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>`}`;
});
function getMenuData() {
  const NAME2 = "menu";
  const SUB_NAME = "menu-submenu";
  const RADIO_GROUP_NAME = "menu-radiogroup";
  const CHECKBOX_ITEM_NAME = "menu-checkboxitem";
  const RADIO_ITEM_NAME = "menu-radioitem";
  const GROUP_NAME2 = "menu-group";
  const PARTS2 = [
    "arrow",
    "checkbox-indicator",
    "checkbox-item",
    "content",
    "group",
    "item",
    "label",
    "radio-group",
    "radio-item",
    "radio-indicator",
    "separator",
    "sub-content",
    "sub-trigger",
    "trigger"
  ];
  return {
    NAME: NAME2,
    SUB_NAME,
    RADIO_GROUP_NAME,
    CHECKBOX_ITEM_NAME,
    RADIO_ITEM_NAME,
    GROUP_NAME: GROUP_NAME2,
    PARTS: PARTS2
  };
}
function getCtx$5() {
  const { NAME: NAME2 } = getMenuData();
  return getContext(NAME2);
}
function setCtx$4(props) {
  const { NAME: NAME2, PARTS: PARTS2 } = getMenuData();
  const getAttrs2 = createBitAttrs$1("menu", PARTS2);
  const dropdownMenu = {
    ...createDropdownMenu({ ...removeUndefined$1(props), forceVisible: true }),
    getAttrs: getAttrs2
  };
  setContext(NAME2, dropdownMenu);
  return {
    ...dropdownMenu,
    updateOption: getOptionUpdater(dropdownMenu.options)
  };
}
function updatePositioning$2(props) {
  const defaultPlacement = {
    side: "bottom",
    align: "center"
  };
  const withDefaults = { ...defaultPlacement, ...props };
  const { options: { positioning } } = getCtx$5();
  const updater = getPositioningUpdater(positioning);
  updater(withDefaults);
}
const Menu_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let attrs;
  let $$restProps = compute_rest_props($$props, ["href", "asChild", "disabled", "el"]);
  let $item, $$unsubscribe_item;
  let { href = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { disabled = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { item }, getAttrs: getAttrs2 } = getCtx$5();
  $$unsubscribe_item = subscribe(item, (value) => $item = value);
  createDispatcher();
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $item;
  attrs = {
    ...getAttrs2("item"),
    ...disabledAttrs(disabled)
  };
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_item();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `${((tag) => {
    return tag ? `<${href ? "a" : "div"}${spread(
      [
        { href: escape_attribute_value(href) },
        escape_object(builder),
        escape_object($$restProps)
      ],
      {}
    )}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({ builder }) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(href ? "a" : "div")}`}`;
});
const Menu_separator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $separator, $$unsubscribe_separator;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { separator }, getAttrs: getAttrs2 } = getCtx$5();
  $$unsubscribe_separator = subscribe(separator, (value) => $separator = value);
  const attrs = getAttrs2("separator");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $separator;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_separator();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object($separator), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>`}`;
});
function getPopoverData() {
  const NAME2 = "popover";
  const PARTS2 = ["arrow", "close", "content", "trigger"];
  return {
    NAME: NAME2,
    PARTS: PARTS2
  };
}
function setCtx$3(props) {
  const { NAME: NAME2, PARTS: PARTS2 } = getPopoverData();
  const getAttrs2 = createBitAttrs$1(NAME2, PARTS2);
  const popover = {
    ...createPopover({
      positioning: {
        placement: "bottom",
        gutter: 0
      },
      ...removeUndefined$1(props),
      forceVisible: true
    }),
    getAttrs: getAttrs2
  };
  setContext(NAME2, popover);
  return {
    ...popover,
    updateOption: getOptionUpdater(popover.options)
  };
}
function getCtx$4() {
  const { NAME: NAME2 } = getPopoverData();
  return getContext(NAME2);
}
function updatePositioning$1(props) {
  const defaultPlacement = {
    side: "bottom",
    align: "center"
  };
  const withDefaults = { ...defaultPlacement, ...props };
  const { options: { positioning } } = getCtx$4();
  const updater = getPositioningUpdater(positioning);
  updater(withDefaults);
}
function getDialogData() {
  const NAME2 = "dialog";
  const PARTS2 = [
    "close",
    "content",
    "description",
    "overlay",
    "portal",
    "title",
    "trigger"
  ];
  return {
    NAME: NAME2,
    PARTS: PARTS2
  };
}
function setCtx$2(props) {
  const { NAME: NAME2, PARTS: PARTS2 } = getDialogData();
  const getAttrs2 = createBitAttrs$1(NAME2, PARTS2);
  const dialog = {
    ...createDialog({ ...removeUndefined$1(props), role: "dialog", forceVisible: true }),
    getAttrs: getAttrs2
  };
  setContext(NAME2, dialog);
  return {
    ...dialog,
    updateOption: getOptionUpdater(dialog.options)
  };
}
function getCtx$3() {
  const { NAME: NAME2 } = getDialogData();
  return getContext(NAME2);
}
const Dialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { preventScroll = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { openFocus = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen }, updateOption, ids } = setCtx$2({
    closeOnEscape,
    preventScroll,
    closeOnOutsideClick,
    portal,
    forceVisible: true,
    defaultOpen: open,
    openFocus,
    closeFocus,
    onOutsideClick,
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    }
  });
  const idValues = derived([ids.content, ids.description, ids.title], ([$contentId, $descriptionId, $titleId]) => ({
    content: $contentId,
    description: $descriptionId,
    title: $titleId
  }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.openFocus === void 0 && $$bindings.openFocus && openFocus !== void 0)
    $$bindings.openFocus(openFocus);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0)
    $$bindings.closeFocus(closeFocus);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("openFocus", openFocus);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Dialog_title$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["level", "asChild", "id", "el"]);
  let $title, $$unsubscribe_title;
  let { level = "h2" } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { title }, ids, getAttrs: getAttrs2 } = getCtx$3();
  $$unsubscribe_title = subscribe(title, (value) => $title = value);
  const attrs = getAttrs2("title");
  if ($$props.level === void 0 && $$bindings.level && level !== void 0)
    $$bindings.level(level);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.title.set(id);
    }
  }
  builder = $title;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_title();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `${((tag) => {
    return tag ? `<${level}${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${is_void(tag) ? "" : `${slots.default ? slots.default({ builder }) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(level)}`}`;
});
const Dialog_close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $close, $$unsubscribe_close;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { close }, getAttrs: getAttrs2 } = getCtx$3();
  $$unsubscribe_close = subscribe(close, (value) => $close = value);
  createDispatcher();
  const attrs = getAttrs2("close");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $close;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_close();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Dialog_portal$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $portalled, $$unsubscribe_portalled;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { portalled }, getAttrs: getAttrs2 } = getCtx$3();
  $$unsubscribe_portalled = subscribe(portalled, (value) => $portalled = value);
  const attrs = getAttrs2("portal");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $portalled;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_portalled();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Dialog_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "el"
  ]);
  let $content, $$unsubscribe_content;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx$3();
  $$unsubscribe_content = subscribe(content, (value) => $content = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs2("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.content.set(id);
    }
  }
  builder = $content;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_content();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Dialog_overlay$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "el"
  ]);
  let $overlay, $$unsubscribe_overlay;
  let $open, $$unsubscribe_open;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { overlay }, states: { open }, getAttrs: getAttrs2 } = getCtx$3();
  $$unsubscribe_overlay = subscribe(overlay, (value) => $overlay = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs2("overlay");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $overlay;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_overlay();
  $$unsubscribe_open();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && outTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${inTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${outTransition && $open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : `${$open ? ` <div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}></div>` : ``}`}`}`}`}`}`;
});
const Dialog_description$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $description, $$unsubscribe_description;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { description }, ids, getAttrs: getAttrs2 } = getCtx$3();
  $$unsubscribe_description = subscribe(description, (value) => $description = value);
  const attrs = getAttrs2("description");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.description.set(id);
    }
  }
  builder = $description;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_description();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>`}`;
});
const Menu$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { preventScroll = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { dir = void 0 } = $$props;
  let { typeahead = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { disableFocusFirstItem = void 0 } = $$props;
  let { closeOnItemClick = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen }, updateOption, ids } = setCtx$4({
    closeOnOutsideClick,
    closeOnEscape,
    portal,
    forceVisible: true,
    defaultOpen: open,
    preventScroll,
    loop,
    dir,
    typeahead,
    closeFocus,
    disableFocusFirstItem,
    closeOnItemClick,
    onOutsideClick,
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    }
  });
  const idValues = derived([ids.menu, ids.trigger], ([$menuId, $triggerId]) => ({ menu: $menuId, trigger: $triggerId }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.dir === void 0 && $$bindings.dir && dir !== void 0)
    $$bindings.dir(dir);
  if ($$props.typeahead === void 0 && $$bindings.typeahead && typeahead !== void 0)
    $$bindings.typeahead(typeahead);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0)
    $$bindings.closeFocus(closeFocus);
  if ($$props.disableFocusFirstItem === void 0 && $$bindings.disableFocusFirstItem && disableFocusFirstItem !== void 0)
    $$bindings.disableFocusFirstItem(disableFocusFirstItem);
  if ($$props.closeOnItemClick === void 0 && $$bindings.closeOnItemClick && closeOnItemClick !== void 0)
    $$bindings.closeOnItemClick(closeOnItemClick);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("dir", dir);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("disableFocusFirstItem", disableFocusFirstItem);
  }
  {
    updateOption("typeahead", typeahead);
  }
  {
    updateOption("closeOnItemClick", closeOnItemClick);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Menu_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
    "avoidCollisions",
    "collisionBoundary",
    "sameWidth",
    "fitViewport",
    "strategy",
    "overlap",
    "el"
  ]);
  let $open, $$unsubscribe_open;
  let $menu, $$unsubscribe_menu;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { side = "bottom" } = $$props;
  let { align = "center" } = $$props;
  let { sideOffset = 0 } = $$props;
  let { alignOffset = 0 } = $$props;
  let { collisionPadding = 8 } = $$props;
  let { avoidCollisions = true } = $$props;
  let { collisionBoundary = void 0 } = $$props;
  let { sameWidth = false } = $$props;
  let { fitViewport = false } = $$props;
  let { strategy = "absolute" } = $$props;
  let { overlap = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { menu }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx$5();
  $$unsubscribe_menu = subscribe(menu, (value) => $menu = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  createDispatcher();
  const attrs = getAttrs2("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.side === void 0 && $$bindings.side && side !== void 0)
    $$bindings.side(side);
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.alignOffset === void 0 && $$bindings.alignOffset && alignOffset !== void 0)
    $$bindings.alignOffset(alignOffset);
  if ($$props.collisionPadding === void 0 && $$bindings.collisionPadding && collisionPadding !== void 0)
    $$bindings.collisionPadding(collisionPadding);
  if ($$props.avoidCollisions === void 0 && $$bindings.avoidCollisions && avoidCollisions !== void 0)
    $$bindings.avoidCollisions(avoidCollisions);
  if ($$props.collisionBoundary === void 0 && $$bindings.collisionBoundary && collisionBoundary !== void 0)
    $$bindings.collisionBoundary(collisionBoundary);
  if ($$props.sameWidth === void 0 && $$bindings.sameWidth && sameWidth !== void 0)
    $$bindings.sameWidth(sameWidth);
  if ($$props.fitViewport === void 0 && $$bindings.fitViewport && fitViewport !== void 0)
    $$bindings.fitViewport(fitViewport);
  if ($$props.strategy === void 0 && $$bindings.strategy && strategy !== void 0)
    $$bindings.strategy(strategy);
  if ($$props.overlap === void 0 && $$bindings.overlap && overlap !== void 0)
    $$bindings.overlap(overlap);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.menu.set(id);
    }
  }
  builder = $menu;
  {
    Object.assign(builder, attrs);
  }
  {
    if ($open) {
      updatePositioning$2({
        side,
        align,
        sideOffset,
        alignOffset,
        collisionPadding,
        avoidCollisions,
        collisionBoundary,
        sameWidth,
        fitViewport,
        strategy,
        overlap
      });
    }
  }
  $$unsubscribe_open();
  $$unsubscribe_menu();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Menu_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, ids, getAttrs: getAttrs2 } = getCtx$5();
  $$unsubscribe_trigger = subscribe(trigger, (value) => $trigger = value);
  createDispatcher();
  const attrs = getAttrs2("trigger");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.trigger.set(id);
    }
  }
  builder = $trigger;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
function getLabelData() {
  const NAME2 = "label";
  const PARTS2 = ["root"];
  const getAttrs2 = createBitAttrs$1(NAME2, PARTS2);
  return {
    NAME: NAME2,
    getAttrs: getAttrs2
  };
}
const Label$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $root, $$unsubscribe_root;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { root } } = createLabel();
  $$unsubscribe_root = subscribe(root, (value) => $root = value);
  createDispatcher();
  const { getAttrs: getAttrs2 } = getLabelData();
  const attrs = getAttrs2("root");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $root;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_root();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<label${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</label>`}`;
});
function getMenubarData() {
  const NAME2 = "menubar";
  const MENU_NAME = "menu";
  const SUB_NAME = "menu-submenu";
  const PARTS2 = [
    "arrow",
    "checkbox-indicator",
    "checkbox-item",
    "content",
    "group",
    "item",
    "label",
    "radio-group",
    "radio-item",
    "separator",
    "sub-content",
    "sub-trigger",
    "trigger"
  ];
  return {
    NAME: NAME2,
    MENU_NAME,
    SUB_NAME,
    PARTS: PARTS2
  };
}
function setCtx$1(props) {
  const { NAME: NAME2, PARTS: PARTS2, MENU_NAME } = getMenubarData();
  const getMenubarAttrs = createBitAttrs$1(NAME2, ["root"]);
  const getAttrs2 = createBitAttrs$1(MENU_NAME, PARTS2);
  const menubar = { ...createMenubar(removeUndefined$1(props)), getAttrs: getAttrs2, getMenubarAttrs };
  setContext(NAME2, menubar);
  return {
    ...menubar,
    updateOption: getOptionUpdater(menubar.options)
  };
}
function getCtx$2() {
  const { NAME: NAME2 } = getMenubarData();
  return getContext(NAME2);
}
function setMenuCtx(props) {
  const { MENU_NAME } = getMenubarData();
  const { builders: { createMenu }, getAttrs: getAttrs2 } = getCtx$2();
  const menu = { ...createMenu({ ...removeUndefined$1(props), forceVisible: false }), getAttrs: getAttrs2 };
  setContext(MENU_NAME, menu);
  return {
    ...menu,
    updateOption: getOptionUpdater(menu.options)
  };
}
function getMenuCtx() {
  const { MENU_NAME } = getMenubarData();
  return getContext(MENU_NAME);
}
const Menubar$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["loop", "closeOnEscape", "asChild", "id", "preventScroll", "el"]);
  let $menubar, $$unsubscribe_menubar;
  let $idValues, $$unsubscribe_idValues;
  let { loop = true } = $$props;
  let { closeOnEscape = true } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { preventScroll = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { menubar }, updateOption, ids, getMenubarAttrs } = setCtx$1({ loop, closeOnEscape, preventScroll });
  $$unsubscribe_menubar = subscribe(menubar, (value) => $menubar = value);
  const idValues = derived([ids.menubar], ([$menubarId]) => ({ menubar: $menubarId }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  const attrs = getMenubarAttrs("root");
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.menubar.set(id);
    }
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("preventScroll", preventScroll);
  }
  builder = $menubar;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_menubar();
  $$unsubscribe_idValues();
  return `${asChild ? `${slots.default ? slots.default({ builder, ids: $idValues }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder, ids: $idValues }) : ``}</div>`}`;
});
const Menubar_menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { dir = void 0 } = $$props;
  let { typeahead = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { disableFocusFirstItem = void 0 } = $$props;
  let { closeOnItemClick = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen }, updateOption, ids } = setMenuCtx({
    closeOnOutsideClick,
    closeOnEscape,
    portal,
    loop,
    dir,
    typeahead,
    closeFocus,
    disableFocusFirstItem,
    closeOnItemClick,
    onOutsideClick,
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    }
  });
  const idValues = derived([ids.menu, ids.trigger], ([$menuId, $triggerId]) => ({ menu: $menuId, trigger: $triggerId }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.dir === void 0 && $$bindings.dir && dir !== void 0)
    $$bindings.dir(dir);
  if ($$props.typeahead === void 0 && $$bindings.typeahead && typeahead !== void 0)
    $$bindings.typeahead(typeahead);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0)
    $$bindings.closeFocus(closeFocus);
  if ($$props.disableFocusFirstItem === void 0 && $$bindings.disableFocusFirstItem && disableFocusFirstItem !== void 0)
    $$bindings.disableFocusFirstItem(disableFocusFirstItem);
  if ($$props.closeOnItemClick === void 0 && $$bindings.closeOnItemClick && closeOnItemClick !== void 0)
    $$bindings.closeOnItemClick(closeOnItemClick);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("dir", dir);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("disableFocusFirstItem", disableFocusFirstItem);
  }
  {
    updateOption("typeahead", typeahead);
  }
  {
    updateOption("closeOnItemClick", closeOnItemClick);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ menuIds: $idValues }) : ``}`;
});
const Menubar_trigger$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, ids, getAttrs: getAttrs2 } = getMenuCtx();
  $$unsubscribe_trigger = subscribe(trigger, (value) => $trigger = value);
  createDispatcher();
  const attrs = getAttrs2("trigger");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.trigger.set(id);
    }
  }
  builder = $trigger;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Popover = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { disableFocusTrap = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { preventScroll = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { openFocus = void 0 } = $$props;
  let { closeFocus = void 0 } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { updateOption, states: { open: localOpen }, ids } = setCtx$3({
    disableFocusTrap,
    closeOnEscape,
    closeOnOutsideClick,
    preventScroll,
    portal,
    defaultOpen: open,
    openFocus,
    closeFocus,
    onOutsideClick,
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    },
    positioning: { gutter: 0, offset: { mainAxis: 1 } }
  });
  const idValues = derived([ids.content, ids.trigger], ([$contentId, $triggerId]) => ({ content: $contentId, trigger: $triggerId }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.disableFocusTrap === void 0 && $$bindings.disableFocusTrap && disableFocusTrap !== void 0)
    $$bindings.disableFocusTrap(disableFocusTrap);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.openFocus === void 0 && $$bindings.openFocus && openFocus !== void 0)
    $$bindings.openFocus(openFocus);
  if ($$props.closeFocus === void 0 && $$bindings.closeFocus && closeFocus !== void 0)
    $$bindings.closeFocus(closeFocus);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  {
    updateOption("disableFocusTrap", disableFocusTrap);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("openFocus", openFocus);
  }
  {
    updateOption("closeFocus", closeFocus);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Popover_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
    "avoidCollisions",
    "collisionBoundary",
    "sameWidth",
    "fitViewport",
    "strategy",
    "overlap",
    "el"
  ]);
  let $open, $$unsubscribe_open;
  let $content, $$unsubscribe_content;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { side = "bottom" } = $$props;
  let { align = "center" } = $$props;
  let { sideOffset = 0 } = $$props;
  let { alignOffset = 0 } = $$props;
  let { collisionPadding = 8 } = $$props;
  let { avoidCollisions = true } = $$props;
  let { collisionBoundary = void 0 } = $$props;
  let { sameWidth = false } = $$props;
  let { fitViewport = false } = $$props;
  let { strategy = "absolute" } = $$props;
  let { overlap = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { content }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx$4();
  $$unsubscribe_content = subscribe(content, (value) => $content = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  const attrs = getAttrs2("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.side === void 0 && $$bindings.side && side !== void 0)
    $$bindings.side(side);
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.alignOffset === void 0 && $$bindings.alignOffset && alignOffset !== void 0)
    $$bindings.alignOffset(alignOffset);
  if ($$props.collisionPadding === void 0 && $$bindings.collisionPadding && collisionPadding !== void 0)
    $$bindings.collisionPadding(collisionPadding);
  if ($$props.avoidCollisions === void 0 && $$bindings.avoidCollisions && avoidCollisions !== void 0)
    $$bindings.avoidCollisions(avoidCollisions);
  if ($$props.collisionBoundary === void 0 && $$bindings.collisionBoundary && collisionBoundary !== void 0)
    $$bindings.collisionBoundary(collisionBoundary);
  if ($$props.sameWidth === void 0 && $$bindings.sameWidth && sameWidth !== void 0)
    $$bindings.sameWidth(sameWidth);
  if ($$props.fitViewport === void 0 && $$bindings.fitViewport && fitViewport !== void 0)
    $$bindings.fitViewport(fitViewport);
  if ($$props.strategy === void 0 && $$bindings.strategy && strategy !== void 0)
    $$bindings.strategy(strategy);
  if ($$props.overlap === void 0 && $$bindings.overlap && overlap !== void 0)
    $$bindings.overlap(overlap);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.content.set(id);
    }
  }
  builder = $content;
  {
    Object.assign(builder, attrs);
  }
  {
    if ($open) {
      updatePositioning$1({
        side,
        align,
        sideOffset,
        alignOffset,
        collisionPadding,
        avoidCollisions,
        collisionBoundary,
        sameWidth,
        fitViewport,
        strategy,
        overlap
      });
    }
  }
  $$unsubscribe_open();
  $$unsubscribe_content();
  return `${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Popover_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let attrs;
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let $open, $$unsubscribe_open;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx$4();
  $$unsubscribe_trigger = subscribe(trigger, (value) => $trigger = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  createDispatcher();
  const bitsAttrs = getAttrs2("trigger");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.trigger.set(id);
    }
  }
  attrs = {
    ...bitsAttrs,
    "aria-controls": $open ? ids.content : void 0
  };
  builder = $trigger;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  $$unsubscribe_open();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
function getSelectData() {
  const NAME2 = "select";
  const GROUP_NAME2 = "select-group";
  const ITEM_NAME = "select-item";
  const PARTS2 = [
    "arrow",
    "content",
    "group",
    "item",
    "indicator",
    "input",
    "label",
    "trigger",
    "value"
  ];
  return {
    NAME: NAME2,
    GROUP_NAME: GROUP_NAME2,
    ITEM_NAME,
    PARTS: PARTS2
  };
}
function getCtx$1() {
  const { NAME: NAME2 } = getSelectData();
  return getContext(NAME2);
}
function setCtx(props) {
  const { NAME: NAME2, PARTS: PARTS2 } = getSelectData();
  const getAttrs2 = createBitAttrs$1(NAME2, PARTS2);
  const select = {
    ...createSelect({ ...removeUndefined$1(props), forceVisible: true }),
    getAttrs: getAttrs2
  };
  setContext(NAME2, select);
  return {
    ...select,
    updateOption: getOptionUpdater(select.options)
  };
}
function setItemCtx(value) {
  const { ITEM_NAME } = getSelectData();
  const select = getCtx$1();
  setContext(ITEM_NAME, value);
  return select;
}
function getItemIndicator() {
  const { ITEM_NAME } = getSelectData();
  const { helpers: { isSelected }, getAttrs: getAttrs2 } = getCtx$1();
  const value = getContext(ITEM_NAME);
  return {
    value,
    isSelected,
    getAttrs: getAttrs2
  };
}
function updatePositioning(props) {
  const defaultPlacement = {
    side: "bottom",
    align: "center",
    sameWidth: true
  };
  const withDefaults = { ...defaultPlacement, ...props };
  const { options: { positioning } } = getCtx$1();
  const updater = getPositioningUpdater(positioning);
  updater(withDefaults);
}
const Select = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $idValues, $$unsubscribe_idValues;
  let { required = void 0 } = $$props;
  let { disabled = void 0 } = $$props;
  let { preventScroll = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { closeOnEscape = void 0 } = $$props;
  let { closeOnOutsideClick = void 0 } = $$props;
  let { portal = void 0 } = $$props;
  let { name: name2 = void 0 } = $$props;
  let { multiple = false } = $$props;
  let { selected = void 0 } = $$props;
  let { onSelectedChange = void 0 } = $$props;
  let { open = void 0 } = $$props;
  let { onOpenChange = void 0 } = $$props;
  let { items = [] } = $$props;
  let { onOutsideClick = void 0 } = $$props;
  const { states: { open: localOpen, selected: localSelected }, updateOption, ids } = setCtx({
    required,
    disabled,
    preventScroll,
    loop,
    closeOnEscape,
    closeOnOutsideClick,
    portal,
    name: name2,
    onOutsideClick,
    multiple,
    forceVisible: true,
    defaultSelected: Array.isArray(selected) ? [...selected] : selected,
    defaultOpen: open,
    onSelectedChange: ({ next: next2 }) => {
      if (Array.isArray(next2)) {
        if (!Array.isArray(selected) || !arraysAreEqual(selected, next2)) {
          onSelectedChange?.(next2);
          selected = next2;
          return next2;
        }
        return next2;
      }
      if (selected !== next2) {
        onSelectedChange?.(next2);
        selected = next2;
      }
      return next2;
    },
    onOpenChange: ({ next: next2 }) => {
      if (open !== next2) {
        onOpenChange?.(next2);
        open = next2;
      }
      return next2;
    },
    items
  });
  const idValues = derived([ids.menu, ids.trigger, ids.label], ([$menuId, $triggerId, $labelId]) => ({
    menu: $menuId,
    trigger: $triggerId,
    label: $labelId
  }));
  $$unsubscribe_idValues = subscribe(idValues, (value) => $idValues = value);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.preventScroll === void 0 && $$bindings.preventScroll && preventScroll !== void 0)
    $$bindings.preventScroll(preventScroll);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.closeOnEscape === void 0 && $$bindings.closeOnEscape && closeOnEscape !== void 0)
    $$bindings.closeOnEscape(closeOnEscape);
  if ($$props.closeOnOutsideClick === void 0 && $$bindings.closeOnOutsideClick && closeOnOutsideClick !== void 0)
    $$bindings.closeOnOutsideClick(closeOnOutsideClick);
  if ($$props.portal === void 0 && $$bindings.portal && portal !== void 0)
    $$bindings.portal(portal);
  if ($$props.name === void 0 && $$bindings.name && name2 !== void 0)
    $$bindings.name(name2);
  if ($$props.multiple === void 0 && $$bindings.multiple && multiple !== void 0)
    $$bindings.multiple(multiple);
  if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0)
    $$bindings.selected(selected);
  if ($$props.onSelectedChange === void 0 && $$bindings.onSelectedChange && onSelectedChange !== void 0)
    $$bindings.onSelectedChange(onSelectedChange);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.onOpenChange === void 0 && $$bindings.onOpenChange && onOpenChange !== void 0)
    $$bindings.onOpenChange(onOpenChange);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0)
    $$bindings.items(items);
  if ($$props.onOutsideClick === void 0 && $$bindings.onOutsideClick && onOutsideClick !== void 0)
    $$bindings.onOutsideClick(onOutsideClick);
  open !== void 0 && localOpen.set(open);
  selected !== void 0 && localSelected.set(Array.isArray(selected) ? [...selected] : selected);
  {
    updateOption("required", required);
  }
  {
    updateOption("disabled", disabled);
  }
  {
    updateOption("preventScroll", preventScroll);
  }
  {
    updateOption("loop", loop);
  }
  {
    updateOption("closeOnEscape", closeOnEscape);
  }
  {
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
  }
  {
    updateOption("portal", portal);
  }
  {
    updateOption("name", name2);
  }
  {
    updateOption("multiple", multiple);
  }
  {
    updateOption("onOutsideClick", onOutsideClick);
  }
  $$unsubscribe_idValues();
  return `${slots.default ? slots.default({ ids: $idValues }) : ``}`;
});
const Select_content$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
    "avoidCollisions",
    "collisionBoundary",
    "sameWidth",
    "fitViewport",
    "strategy",
    "overlap",
    "el"
  ]);
  let $open, $$unsubscribe_open;
  let $menu, $$unsubscribe_menu;
  let { transition = void 0 } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { inTransition = void 0 } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = void 0 } = $$props;
  let { outTransitionConfig = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { side = "bottom" } = $$props;
  let { align = "center" } = $$props;
  let { sideOffset = 0 } = $$props;
  let { alignOffset = 0 } = $$props;
  let { collisionPadding = 8 } = $$props;
  let { avoidCollisions = true } = $$props;
  let { collisionBoundary = void 0 } = $$props;
  let { sameWidth = true } = $$props;
  let { fitViewport = false } = $$props;
  let { strategy = "absolute" } = $$props;
  let { overlap = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { menu }, states: { open }, ids, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_menu = subscribe(menu, (value) => $menu = value);
  $$unsubscribe_open = subscribe(open, (value) => $open = value);
  createDispatcher();
  const attrs = getAttrs2("content");
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.side === void 0 && $$bindings.side && side !== void 0)
    $$bindings.side(side);
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.alignOffset === void 0 && $$bindings.alignOffset && alignOffset !== void 0)
    $$bindings.alignOffset(alignOffset);
  if ($$props.collisionPadding === void 0 && $$bindings.collisionPadding && collisionPadding !== void 0)
    $$bindings.collisionPadding(collisionPadding);
  if ($$props.avoidCollisions === void 0 && $$bindings.avoidCollisions && avoidCollisions !== void 0)
    $$bindings.avoidCollisions(avoidCollisions);
  if ($$props.collisionBoundary === void 0 && $$bindings.collisionBoundary && collisionBoundary !== void 0)
    $$bindings.collisionBoundary(collisionBoundary);
  if ($$props.sameWidth === void 0 && $$bindings.sameWidth && sameWidth !== void 0)
    $$bindings.sameWidth(sameWidth);
  if ($$props.fitViewport === void 0 && $$bindings.fitViewport && fitViewport !== void 0)
    $$bindings.fitViewport(fitViewport);
  if ($$props.strategy === void 0 && $$bindings.strategy && strategy !== void 0)
    $$bindings.strategy(strategy);
  if ($$props.overlap === void 0 && $$bindings.overlap && overlap !== void 0)
    $$bindings.overlap(overlap);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.menu.set(id);
    }
  }
  builder = $menu;
  {
    Object.assign(builder, attrs);
  }
  {
    if ($open) {
      updatePositioning({
        side,
        align,
        sideOffset,
        alignOffset,
        collisionPadding,
        avoidCollisions,
        collisionBoundary,
        sameWidth,
        fitViewport,
        strategy,
        overlap
      });
    }
  }
  $$unsubscribe_open();
  $$unsubscribe_menu();
  return ` ${asChild && $open ? `${slots.default ? slots.default({ builder }) : ``}` : `${transition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${inTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${outTransition && $open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : `${$open ? `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</div>` : ``}`}`}`}`}`}`;
});
const Select_item$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let isSelected;
  let $$restProps = compute_rest_props($$props, ["value", "disabled", "label", "asChild", "el"]);
  let $isSelectedStore, $$unsubscribe_isSelectedStore;
  let $item, $$unsubscribe_item;
  let { value } = $$props;
  let { disabled = void 0 } = $$props;
  let { label = void 0 } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { option: item }, helpers: { isSelected: isSelectedStore }, getAttrs: getAttrs2 } = setItemCtx(value);
  $$unsubscribe_item = subscribe(item, (value2) => $item = value2);
  $$unsubscribe_isSelectedStore = subscribe(isSelectedStore, (value2) => $isSelectedStore = value2);
  createDispatcher();
  const attrs = getAttrs2("item");
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  builder = $item({ value, disabled, label });
  {
    Object.assign(builder, attrs);
  }
  isSelected = $isSelectedStore(value);
  $$unsubscribe_isSelectedStore();
  $$unsubscribe_item();
  return ` ${asChild ? `${slots.default ? slots.default({ builder, isSelected }) : ``}` : `<div${spread([escape_object(builder), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder, isSelected }) : ` ${escape(label || value)} `}</div>`}`;
});
const Select_item_indicator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["asChild", "el"]);
  let $isSelected, $$unsubscribe_isSelected;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { isSelected, value, getAttrs: getAttrs2 } = getItemIndicator();
  $$unsubscribe_isSelected = subscribe(isSelected, (value2) => $isSelected = value2);
  const attrs = getAttrs2("indicator");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  $$unsubscribe_isSelected();
  return `${asChild ? `${slots.default ? slots.default({ attrs, isSelected: $isSelected(value) }) : ``}` : `<div${spread([escape_object($$restProps), escape_object(attrs)], {})}${add_attribute("this", el, 0)}>${$isSelected(value) ? `${slots.default ? slots.default({ attrs, isSelected: $isSelected(value) }) : ``}` : ``}</div>`}`;
});
const Select_trigger$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let builder;
  let $$restProps = compute_rest_props($$props, ["asChild", "id", "el"]);
  let $trigger, $$unsubscribe_trigger;
  let { asChild = false } = $$props;
  let { id = void 0 } = $$props;
  let { el = void 0 } = $$props;
  const { elements: { trigger }, ids, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_trigger = subscribe(trigger, (value) => $trigger = value);
  createDispatcher();
  const attrs = getAttrs2("trigger");
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    if (id) {
      ids.trigger.set(id);
    }
  }
  builder = $trigger;
  {
    Object.assign(builder, attrs);
  }
  $$unsubscribe_trigger();
  return `${asChild ? `${slots.default ? slots.default({ builder }) : ``}` : `<button${spread([escape_object(builder), { type: "button" }, escape_object($$restProps)], {})}${add_attribute("this", el, 0)}>${slots.default ? slots.default({ builder }) : ``}</button>`}`;
});
const Select_value = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let label;
  let $$restProps = compute_rest_props($$props, ["placeholder", "asChild", "el"]);
  let $selectedLabel, $$unsubscribe_selectedLabel;
  let { placeholder = "" } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const { states: { selectedLabel }, getAttrs: getAttrs2 } = getCtx$1();
  $$unsubscribe_selectedLabel = subscribe(selectedLabel, (value) => $selectedLabel = value);
  const attrs = getAttrs2("value");
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  label = $selectedLabel;
  $$unsubscribe_selectedLabel();
  return `${asChild ? `${slots.default ? slots.default({ label, attrs }) : ``}` : `<span${spread(
    [
      escape_object($$restProps),
      escape_object(attrs),
      {
        "data-placeholder": escape_attribute_value(!label ? "" : void 0)
      }
    ],
    {}
  )}${add_attribute("this", el, 0)}>${escape(label || placeholder)}</span>`}`;
});
const Menubar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Menubar$1, "MenubarPrimitive.Root").$$render(
    $$result,
    {
      class: cn("flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm", className)
    },
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Check = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "check," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor"></path></svg>`} `;
});
const Menubar_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "align", "alignOffset", "sideOffset", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { align = "start" } = $$props;
  let { alignOffset = -4 } = $$props;
  let { sideOffset = 8 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.alignOffset === void 0 && $$bindings.alignOffset && alignOffset !== void 0)
    $$bindings.alignOffset(alignOffset);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Menu_content, "MenubarPrimitive.Content").$$render(
    $$result,
    Object.assign(
      {},
      { transition },
      { transitionConfig },
      { sideOffset },
      { align },
      { alignOffset },
      {
        class: cn("z-50 min-w-[12rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Menubar_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "inset"]);
  let { class: className = void 0 } = $$props;
  let { inset = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.inset === void 0 && $$bindings.inset && inset !== void 0)
    $$bindings.inset(inset);
  return `${validate_component(Menu_item, "MenubarPrimitive.Item").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50", inset && "pl-8", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Menubar_separator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Menu_separator, "MenubarPrimitive.Separator").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("-mx-1 my-1 h-px bg-muted", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Menubar_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Menubar_trigger$1, "MenubarPrimitive.Trigger").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Menu = Menubar_menu;
const Sun = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "sun," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.2239 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.2239 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z" fill="currentColor"></path></svg>`} `;
});
const Moon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "moon," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M2.89998 0.499976C2.89998 0.279062 2.72089 0.0999756 2.49998 0.0999756C2.27906 0.0999756 2.09998 0.279062 2.09998 0.499976V1.09998H1.49998C1.27906 1.09998 1.09998 1.27906 1.09998 1.49998C1.09998 1.72089 1.27906 1.89998 1.49998 1.89998H2.09998V2.49998C2.09998 2.72089 2.27906 2.89998 2.49998 2.89998C2.72089 2.89998 2.89998 2.72089 2.89998 2.49998V1.89998H3.49998C3.72089 1.89998 3.89998 1.72089 3.89998 1.49998C3.89998 1.27906 3.72089 1.09998 3.49998 1.09998H2.89998V0.499976ZM5.89998 3.49998C5.89998 3.27906 5.72089 3.09998 5.49998 3.09998C5.27906 3.09998 5.09998 3.27906 5.09998 3.49998V4.09998H4.49998C4.27906 4.09998 4.09998 4.27906 4.09998 4.49998C4.09998 4.72089 4.27906 4.89998 4.49998 4.89998H5.09998V5.49998C5.09998 5.72089 5.27906 5.89998 5.49998 5.89998C5.72089 5.89998 5.89998 5.72089 5.89998 5.49998V4.89998H6.49998C6.72089 4.89998 6.89998 4.72089 6.89998 4.49998C6.89998 4.27906 6.72089 4.09998 6.49998 4.09998H5.89998V3.49998ZM1.89998 6.49998C1.89998 6.27906 1.72089 6.09998 1.49998 6.09998C1.27906 6.09998 1.09998 6.27906 1.09998 6.49998V7.09998H0.499976C0.279062 7.09998 0.0999756 7.27906 0.0999756 7.49998C0.0999756 7.72089 0.279062 7.89998 0.499976 7.89998H1.09998V8.49998C1.09998 8.72089 1.27906 8.89997 1.49998 8.89997C1.72089 8.89997 1.89998 8.72089 1.89998 8.49998V7.89998H2.49998C2.72089 7.89998 2.89998 7.72089 2.89998 7.49998C2.89998 7.27906 2.72089 7.09998 2.49998 7.09998H1.89998V6.49998ZM8.54406 0.98184L8.24618 0.941586C8.03275 0.917676 7.90692 1.1655 8.02936 1.34194C8.17013 1.54479 8.29981 1.75592 8.41754 1.97445C8.91878 2.90485 9.20322 3.96932 9.20322 5.10022C9.20322 8.37201 6.82247 11.0878 3.69887 11.6097C3.45736 11.65 3.20988 11.6772 2.96008 11.6906C2.74563 11.702 2.62729 11.9535 2.77721 12.1072C2.84551 12.1773 2.91535 12.2458 2.98667 12.3128L3.05883 12.3795L3.31883 12.6045L3.50684 12.7532L3.62796 12.8433L3.81491 12.9742L3.99079 13.089C4.11175 13.1651 4.23536 13.2375 4.36157 13.3059L4.62496 13.4412L4.88553 13.5607L5.18837 13.6828L5.43169 13.7686C5.56564 13.8128 5.70149 13.8529 5.83857 13.8885C5.94262 13.9155 6.04767 13.9401 6.15405 13.9622C6.27993 13.9883 6.40713 14.0109 6.53544 14.0298L6.85241 14.0685L7.11934 14.0892C7.24637 14.0965 7.37436 14.1002 7.50322 14.1002C11.1483 14.1002 14.1032 11.1453 14.1032 7.50023C14.1032 7.25044 14.0893 7.00389 14.0623 6.76131L14.0255 6.48407C13.991 6.26083 13.9453 6.04129 13.8891 5.82642C13.8213 5.56709 13.7382 5.31398 13.6409 5.06881L13.5279 4.80132L13.4507 4.63542L13.3766 4.48666C13.2178 4.17773 13.0353 3.88295 12.8312 3.60423L12.6782 3.40352L12.4793 3.16432L12.3157 2.98361L12.1961 2.85951L12.0355 2.70246L11.8134 2.50184L11.4925 2.24191L11.2483 2.06498L10.9562 1.87446L10.6346 1.68894L10.3073 1.52378L10.1938 1.47176L9.95488 1.3706L9.67791 1.2669L9.42566 1.1846L9.10075 1.09489L8.83599 1.03486L8.54406 0.98184ZM10.4032 5.30023C10.4032 4.27588 10.2002 3.29829 9.83244 2.40604C11.7623 3.28995 13.1032 5.23862 13.1032 7.50023C13.1032 10.593 10.596 13.1002 7.50322 13.1002C6.63646 13.1002 5.81597 12.9036 5.08355 12.5522C6.5419 12.0941 7.81081 11.2082 8.74322 10.0416C8.87963 10.2284 9.10028 10.3497 9.34928 10.3497C9.76349 10.3497 10.0993 10.0139 10.0993 9.59971C10.0993 9.24256 9.84965 8.94373 9.51535 8.86816C9.57741 8.75165 9.63653 8.63334 9.6926 8.51332C9.88358 8.63163 10.1088 8.69993 10.35 8.69993C11.0403 8.69993 11.6 8.14028 11.6 7.44993C11.6 6.75976 11.0406 6.20024 10.3505 6.19993C10.3853 5.90487 10.4032 5.60464 10.4032 5.30023Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M2.89998 0.499976C2.89998 0.279062 2.72089 0.0999756 2.49998 0.0999756C2.27906 0.0999756 2.09998 0.279062 2.09998 0.499976V1.09998H1.49998C1.27906 1.09998 1.09998 1.27906 1.09998 1.49998C1.09998 1.72089 1.27906 1.89998 1.49998 1.89998H2.09998V2.49998C2.09998 2.72089 2.27906 2.89998 2.49998 2.89998C2.72089 2.89998 2.89998 2.72089 2.89998 2.49998V1.89998H3.49998C3.72089 1.89998 3.89998 1.72089 3.89998 1.49998C3.89998 1.27906 3.72089 1.09998 3.49998 1.09998H2.89998V0.499976ZM5.89998 3.49998C5.89998 3.27906 5.72089 3.09998 5.49998 3.09998C5.27906 3.09998 5.09998 3.27906 5.09998 3.49998V4.09998H4.49998C4.27906 4.09998 4.09998 4.27906 4.09998 4.49998C4.09998 4.72089 4.27906 4.89998 4.49998 4.89998H5.09998V5.49998C5.09998 5.72089 5.27906 5.89998 5.49998 5.89998C5.72089 5.89998 5.89998 5.72089 5.89998 5.49998V4.89998H6.49998C6.72089 4.89998 6.89998 4.72089 6.89998 4.49998C6.89998 4.27906 6.72089 4.09998 6.49998 4.09998H5.89998V3.49998ZM1.89998 6.49998C1.89998 6.27906 1.72089 6.09998 1.49998 6.09998C1.27906 6.09998 1.09998 6.27906 1.09998 6.49998V7.09998H0.499976C0.279062 7.09998 0.0999756 7.27906 0.0999756 7.49998C0.0999756 7.72089 0.279062 7.89998 0.499976 7.89998H1.09998V8.49998C1.09998 8.72089 1.27906 8.89997 1.49998 8.89997C1.72089 8.89997 1.89998 8.72089 1.89998 8.49998V7.89998H2.49998C2.72089 7.89998 2.89998 7.72089 2.89998 7.49998C2.89998 7.27906 2.72089 7.09998 2.49998 7.09998H1.89998V6.49998ZM8.54406 0.98184L8.24618 0.941586C8.03275 0.917676 7.90692 1.1655 8.02936 1.34194C8.17013 1.54479 8.29981 1.75592 8.41754 1.97445C8.91878 2.90485 9.20322 3.96932 9.20322 5.10022C9.20322 8.37201 6.82247 11.0878 3.69887 11.6097C3.45736 11.65 3.20988 11.6772 2.96008 11.6906C2.74563 11.702 2.62729 11.9535 2.77721 12.1072C2.84551 12.1773 2.91535 12.2458 2.98667 12.3128L3.05883 12.3795L3.31883 12.6045L3.50684 12.7532L3.62796 12.8433L3.81491 12.9742L3.99079 13.089C4.11175 13.1651 4.23536 13.2375 4.36157 13.3059L4.62496 13.4412L4.88553 13.5607L5.18837 13.6828L5.43169 13.7686C5.56564 13.8128 5.70149 13.8529 5.83857 13.8885C5.94262 13.9155 6.04767 13.9401 6.15405 13.9622C6.27993 13.9883 6.40713 14.0109 6.53544 14.0298L6.85241 14.0685L7.11934 14.0892C7.24637 14.0965 7.37436 14.1002 7.50322 14.1002C11.1483 14.1002 14.1032 11.1453 14.1032 7.50023C14.1032 7.25044 14.0893 7.00389 14.0623 6.76131L14.0255 6.48407C13.991 6.26083 13.9453 6.04129 13.8891 5.82642C13.8213 5.56709 13.7382 5.31398 13.6409 5.06881L13.5279 4.80132L13.4507 4.63542L13.3766 4.48666C13.2178 4.17773 13.0353 3.88295 12.8312 3.60423L12.6782 3.40352L12.4793 3.16432L12.3157 2.98361L12.1961 2.85951L12.0355 2.70246L11.8134 2.50184L11.4925 2.24191L11.2483 2.06498L10.9562 1.87446L10.6346 1.68894L10.3073 1.52378L10.1938 1.47176L9.95488 1.3706L9.67791 1.2669L9.42566 1.1846L9.10075 1.09489L8.83599 1.03486L8.54406 0.98184ZM10.4032 5.30023C10.4032 4.27588 10.2002 3.29829 9.83244 2.40604C11.7623 3.28995 13.1032 5.23862 13.1032 7.50023C13.1032 10.593 10.596 13.1002 7.50322 13.1002C6.63646 13.1002 5.81597 12.9036 5.08355 12.5522C6.5419 12.0941 7.81081 11.2082 8.74322 10.0416C8.87963 10.2284 9.10028 10.3497 9.34928 10.3497C9.76349 10.3497 10.0993 10.0139 10.0993 9.59971C10.0993 9.24256 9.84965 8.94373 9.51535 8.86816C9.57741 8.75165 9.63653 8.63334 9.6926 8.51332C9.88358 8.63163 10.1088 8.69993 10.35 8.69993C11.0403 8.69993 11.6 8.14028 11.6 7.44993C11.6 6.75976 11.0406 6.20024 10.3505 6.19993C10.3853 5.90487 10.4032 5.60464 10.4032 5.30023Z" fill="currentColor"></path></svg>`} `;
});
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "variant", "size", "builders"]);
  let { class: className = void 0 } = $$props;
  let { variant = "default" } = $$props;
  let { size: size2 = "default" } = $$props;
  let { builders = [] } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0)
    $$bindings.variant(variant);
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.builders === void 0 && $$bindings.builders && builders !== void 0)
    $$bindings.builders(builders);
  return `${validate_component(Button$1, "ButtonPrimitive.Root").$$render(
    $$result,
    Object.assign(
      {},
      { builders },
      {
        class: cn(buttonVariants({ variant, size: size2, className }))
      },
      { type: "button" },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const buttonVariants = tv({
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Dropdown_menu_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "inset"]);
  let { class: className = void 0 } = $$props;
  let { inset = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.inset === void 0 && $$bindings.inset && inset !== void 0)
    $$bindings.inset(inset);
  return `${validate_component(Menu_item, "DropdownMenuPrimitive.Item").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50", inset && "pl-8", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Dropdown_menu_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "sideOffset", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { sideOffset = 4 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Menu_content, "DropdownMenuPrimitive.Content").$$render(
    $$result,
    Object.assign(
      {},
      { transition },
      { transitionConfig },
      { sideOffset },
      {
        class: cn("z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Root$3 = Menu$1;
const Trigger$1 = Menu_trigger;
const DarkmodeSwitch = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Root$3, "DropdownMenu.Root").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Trigger$1, "DropdownMenu.Trigger").$$render($$result, { asChild: true }, {}, {
        default: ({ builder }) => {
          return `${validate_component(Button, "Button").$$render(
            $$result,
            {
              builders: [builder],
              variant: "outline",
              size: "icon"
            },
            {},
            {
              default: () => {
                return `${validate_component(Sun, "Sun").$$render(
                  $$result,
                  {
                    class: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                  },
                  {},
                  {}
                )} ${validate_component(Moon, "Moon").$$render(
                  $$result,
                  {
                    class: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                  },
                  {},
                  {}
                )} <span class="sr-only" data-svelte-h="svelte-ntgole">Toggle theme</span>`;
              }
            }
          )}`;
        }
      })} ${validate_component(Dropdown_menu_content, "DropdownMenu.Content").$$render($$result, { align: "end" }, {}, {
        default: () => {
          return `${validate_component(Dropdown_menu_item, "DropdownMenu.Item").$$render($$result, {}, {}, {
            default: () => {
              return `Light`;
            }
          })} ${validate_component(Dropdown_menu_item, "DropdownMenu.Item").$$render($$result, {}, {}, {
            default: () => {
              return `Dark`;
            }
          })} ${validate_component(Dropdown_menu_item, "DropdownMenu.Item").$$render($$result, {}, {}, {
            default: () => {
              return `System`;
            }
          })}`;
        }
      })}`;
    }
  })}`;
});
const CaretSort = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "caret sort," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor"></path></svg>`} `;
});
const PlusCircled = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "plus circled," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" fill="currentColor"></path></svg>`} `;
});
const Avatar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "delayMs"]);
  let { class: className = void 0 } = $$props;
  let { delayMs = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.delayMs === void 0 && $$bindings.delayMs && delayMs !== void 0)
    $$bindings.delayMs(delayMs);
  return `${validate_component(Avatar$1, "AvatarPrimitive.Root").$$render(
    $$result,
    Object.assign(
      {},
      { delayMs },
      {
        class: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Avatar_image = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "src", "alt"]);
  let { class: className = void 0 } = $$props;
  let { src = void 0 } = $$props;
  let { alt = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.src === void 0 && $$bindings.src && src !== void 0)
    $$bindings.src(src);
  if ($$props.alt === void 0 && $$bindings.alt && alt !== void 0)
    $$bindings.alt(alt);
  return `${validate_component(Avatar_image$1, "AvatarPrimitive.Image").$$render(
    $$result,
    Object.assign(
      {},
      { src },
      { alt },
      {
        class: cn("aspect-square h-full w-full", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Avatar_fallback = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Avatar_fallback$1, "AvatarPrimitive.Fallback").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const SCORE_CONTINUE_MATCH = 1, SCORE_SPACE_WORD_JUMP = 0.9, SCORE_NON_SPACE_WORD_JUMP = 0.8, SCORE_CHARACTER_JUMP = 0.17, SCORE_TRANSPOSITION = 0.1, PENALTY_SKIPPED = 0.999, PENALTY_CASE_MISMATCH = 0.9999, PENALTY_NOT_COMPLETE = 0.99;
const IS_GAP_REGEXP = /[\\/_+.#"@[({&]/, COUNT_GAPS_REGEXP = /[\\/_+.#"@[({&]/g, IS_SPACE_REGEXP = /[\s-]/, COUNT_SPACE_REGEXP = /[\s-]/g;
function commandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, stringIndex, abbreviationIndex, memoizedResults) {
  if (abbreviationIndex === abbreviation.length) {
    if (stringIndex === string.length) {
      return SCORE_CONTINUE_MATCH;
    }
    return PENALTY_NOT_COMPLETE;
  }
  const memoizeKey = `${stringIndex},${abbreviationIndex}`;
  if (memoizedResults[memoizeKey] !== void 0) {
    return memoizedResults[memoizeKey];
  }
  const abbreviationChar = lowerAbbreviation.charAt(abbreviationIndex);
  let index = lowerString.indexOf(abbreviationChar, stringIndex);
  let highScore = 0;
  let score, transposedScore, wordBreaks, spaceBreaks;
  while (index >= 0) {
    score = commandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, index + 1, abbreviationIndex + 1, memoizedResults);
    if (score > highScore) {
      if (index === stringIndex) {
        score *= SCORE_CONTINUE_MATCH;
      } else if (IS_GAP_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_NON_SPACE_WORD_JUMP;
        wordBreaks = string.slice(stringIndex, index - 1).match(COUNT_GAPS_REGEXP);
        if (wordBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, wordBreaks.length);
        }
      } else if (IS_SPACE_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_SPACE_WORD_JUMP;
        spaceBreaks = string.slice(stringIndex, index - 1).match(COUNT_SPACE_REGEXP);
        if (spaceBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, spaceBreaks.length);
        }
      } else {
        score *= SCORE_CHARACTER_JUMP;
        if (stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, index - stringIndex);
        }
      }
      if (string.charAt(index) !== abbreviation.charAt(abbreviationIndex)) {
        score *= PENALTY_CASE_MISMATCH;
      }
    }
    if (score < SCORE_TRANSPOSITION && lowerString.charAt(index - 1) === lowerAbbreviation.charAt(abbreviationIndex + 1) || lowerAbbreviation.charAt(abbreviationIndex + 1) === lowerAbbreviation.charAt(abbreviationIndex) && // allow duplicate letters. Ref #7428
    lowerString.charAt(index - 1) !== lowerAbbreviation.charAt(abbreviationIndex)) {
      transposedScore = commandScoreInner(string, abbreviation, lowerString, lowerAbbreviation, index + 1, abbreviationIndex + 2, memoizedResults);
      if (transposedScore * SCORE_TRANSPOSITION > score) {
        score = transposedScore * SCORE_TRANSPOSITION;
      }
    }
    if (score > highScore) {
      highScore = score;
    }
    index = lowerString.indexOf(abbreviationChar, index + 1);
  }
  memoizedResults[memoizeKey] = highScore;
  return highScore;
}
function formatInput(string) {
  return string.toLowerCase().replace(COUNT_SPACE_REGEXP, " ");
}
function commandScore(string, abbreviation) {
  return commandScoreInner(string, abbreviation, formatInput(string), formatInput(abbreviation), 0, 0, {});
}
const isBrowser = typeof document !== "undefined";
function isHTMLElement(element) {
  return element instanceof HTMLElement;
}
function isUndefined(value) {
  return value === void 0;
}
function generateId() {
  return nanoid(10);
}
const kbd$1 = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*"
};
function omit(obj, ...keys) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
function removeUndefined(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function toWritableStores(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = writable(value);
  });
  return result;
}
function effect(stores, fn) {
  const unsub = derivedWithUnsubscribe(stores, (stores2, onUnsubscribe) => {
    return {
      stores: stores2,
      onUnsubscribe
    };
  }).subscribe(({ stores: stores2, onUnsubscribe }) => {
    const returned = fn(stores2);
    if (returned) {
      onUnsubscribe(returned);
    }
  });
  onDestroy(unsub);
  return unsub;
}
function derivedWithUnsubscribe(stores, fn) {
  let unsubscribers = [];
  const onUnsubscribe = (cb) => {
    unsubscribers.push(cb);
  };
  const unsubscribe = () => {
    unsubscribers.forEach((fn2) => fn2());
    unsubscribers = [];
  };
  const derivedStore = derived(stores, ($storeValues) => {
    unsubscribe();
    return fn($storeValues, onUnsubscribe);
  });
  onDestroy(unsubscribe);
  const subscribe2 = (...args) => {
    const unsub = derivedStore.subscribe(...args);
    return () => {
      unsub();
      unsubscribe();
    };
  };
  return {
    ...derivedStore,
    subscribe: subscribe2
  };
}
function styleToString$2(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0"
};
function addEventListener$2(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
const NAME$m = "Command";
const STATE_NAME = "CommandState";
const GROUP_NAME = "CommandGroup";
const LIST_SELECTOR = `[data-cmdk-list-sizer]`;
const GROUP_SELECTOR = `[data-cmdk-group]`;
const GROUP_ITEMS_SELECTOR = `[data-cmdk-group-items]`;
const GROUP_HEADING_SELECTOR = `[data-cmdk-group-heading]`;
const ITEM_SELECTOR = `[data-cmdk-item]`;
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
const VALUE_ATTR = `data-value`;
const defaultFilter = (value, search) => commandScore(value, search);
function getCtx() {
  return getContext(NAME$m);
}
function getState() {
  return getContext(STATE_NAME);
}
function createGroup(alwaysRender) {
  const id = generateId();
  setContext(GROUP_NAME, {
    id,
    alwaysRender: isUndefined(alwaysRender) ? false : alwaysRender
  });
  return { id };
}
function getGroup() {
  const context = getContext(GROUP_NAME);
  if (!context)
    return void 0;
  return context;
}
function createState(initialValues) {
  const defaultState = {
    search: "",
    value: "",
    filtered: {
      count: 0,
      items: /* @__PURE__ */ new Map(),
      groups: /* @__PURE__ */ new Set()
    }
  };
  const state = writable(initialValues ? { ...defaultState, ...removeUndefined(initialValues) } : defaultState);
  return state;
}
const defaults = {
  label: "Command menu",
  shouldFilter: true,
  loop: false,
  onValueChange: void 0,
  value: void 0,
  filter: defaultFilter,
  ids: {
    root: generateId(),
    list: generateId(),
    label: generateId(),
    input: generateId()
  }
};
function createCommand(props) {
  const ids = {
    root: generateId(),
    list: generateId(),
    label: generateId(),
    input: generateId(),
    ...props.ids
  };
  const withDefaults = {
    ...defaults,
    ...removeUndefined(props)
  };
  const state = props.state ?? createState({
    value: withDefaults.value
  });
  const allItems = writable(/* @__PURE__ */ new Set());
  const allGroups = writable(/* @__PURE__ */ new Map());
  const allIds = writable(/* @__PURE__ */ new Map());
  const commandEl = writable(null);
  const options = toWritableStores(omit(withDefaults, "value", "ids"));
  let $allItems = get_store_value(allItems);
  let $allGroups = get_store_value(allGroups);
  let $allIds = get_store_value(allIds);
  let shouldFilter = get_store_value(options.shouldFilter);
  let loop = get_store_value(options.loop);
  let label = get_store_value(options.label);
  let filter = get_store_value(options.filter);
  effect(options.shouldFilter, ($shouldFilter) => {
    shouldFilter = $shouldFilter;
  });
  effect(options.loop, ($loop) => {
    loop = $loop;
  });
  effect(options.filter, ($filter) => {
    filter = $filter;
  });
  effect(options.label, ($label) => {
    label = $label;
  });
  effect(allItems, (v) => {
    $allItems = v;
  });
  effect(allGroups, (v) => {
    $allGroups = v;
  });
  effect(allIds, (v) => {
    $allIds = v;
  });
  const context = {
    value: (id, value) => {
      if (value !== $allIds.get(id)) {
        allIds.update(($allIds2) => {
          $allIds2.set(id, value);
          return $allIds2;
        });
        state.update(($state) => {
          $state.filtered.items.set(id, score(value, $state.search));
          return $state;
        });
      }
    },
    // Track item lifecycle (add/remove)
    item: (id, groupId) => {
      allItems.update(($allItems2) => $allItems2.add(id));
      if (groupId) {
        allGroups.update(($allGroups2) => {
          if (!$allGroups2.has(groupId)) {
            $allGroups2.set(groupId, /* @__PURE__ */ new Set([id]));
          } else {
            $allGroups2.get(groupId)?.add(id);
          }
          return $allGroups2;
        });
      }
      state.update(($state) => {
        const filteredState = filterItems($state, shouldFilter);
        if (!filteredState.value) {
          const value = selectFirstItem();
          filteredState.value = value ?? "";
        }
        return filteredState;
      });
      return () => {
        allIds.update(($allIds2) => {
          $allIds2.delete(id);
          return $allIds2;
        });
        allItems.update(($allItems2) => {
          $allItems2.delete(id);
          return $allItems2;
        });
        state.update(($state) => {
          $state.filtered.items.delete(id);
          const selectedItem = getSelectedItem();
          const filteredState = filterItems($state);
          if (selectedItem?.getAttribute("id") === id) {
            filteredState.value = selectFirstItem() ?? "";
          }
          return $state;
        });
      };
    },
    group: (id) => {
      allGroups.update(($allGroups2) => {
        if (!$allGroups2.has(id)) {
          $allGroups2.set(id, /* @__PURE__ */ new Set());
        }
        return $allGroups2;
      });
      return () => {
        allIds.update(($allIds2) => {
          $allIds2.delete(id);
          return $allIds2;
        });
        allGroups.update(($allGroups2) => {
          $allGroups2.delete(id);
          return $allGroups2;
        });
      };
    },
    filter: () => {
      return shouldFilter;
    },
    label: label || props["aria-label"] || "",
    commandEl,
    ids,
    updateState
  };
  function updateState(key, value, preventScroll) {
    state.update((curr) => {
      if (Object.is(curr[key], value))
        return curr;
      curr[key] = value;
      if (key === "search") {
        const filteredState = filterItems(curr, shouldFilter);
        curr = filteredState;
        const sortedState = sort(curr, shouldFilter);
        curr = sortedState;
        tick().then(() => state.update((curr2) => {
          curr2.value = selectFirstItem() ?? "";
          return curr2;
        }));
      } else if (key === "value") {
        props.onValueChange?.(curr.value);
        if (!preventScroll) {
          tick().then(() => scrollSelectedIntoView());
        }
      }
      return curr;
    });
  }
  function filterItems(state2, shouldFilterVal) {
    const $shouldFilter = shouldFilterVal ?? shouldFilter;
    if (!state2.search || !$shouldFilter) {
      state2.filtered.count = $allItems.size;
      return state2;
    }
    state2.filtered.groups = /* @__PURE__ */ new Set();
    let itemCount = 0;
    for (const id of $allItems) {
      const value = $allIds.get(id);
      const rank = score(value, state2.search);
      state2.filtered.items.set(id, rank);
      if (rank > 0) {
        itemCount++;
      }
    }
    for (const [groupId, group] of $allGroups) {
      for (const itemId of group) {
        const rank = state2.filtered.items.get(itemId);
        if (rank && rank > 0) {
          state2.filtered.groups.add(groupId);
        }
      }
    }
    state2.filtered.count = itemCount;
    return state2;
  }
  function sort(state2, shouldFilterVal) {
    const $shouldFilter = shouldFilterVal ?? shouldFilter;
    if (!state2.search || !$shouldFilter) {
      return state2;
    }
    const scores = state2.filtered.items;
    const groups = [];
    for (const value of state2.filtered.groups) {
      const items = $allGroups.get(value);
      if (!items)
        continue;
      let max = 0;
      for (const item of items) {
        const score2 = scores.get(item);
        if (isUndefined(score2))
          continue;
        max = Math.max(score2, max);
      }
      groups.push([value, max]);
    }
    const rootEl = document.getElementById(ids.root);
    if (!rootEl)
      return state2;
    const list = rootEl.querySelector(LIST_SELECTOR);
    const validItems = getValidItems(rootEl).sort((a, b) => {
      const valueA = a.getAttribute(VALUE_ATTR) ?? "";
      const valueB = b.getAttribute(VALUE_ATTR) ?? "";
      return (scores.get(valueA) ?? 0) - (scores.get(valueB) ?? 0);
    });
    for (const item of validItems) {
      const group = item.closest(GROUP_ITEMS_SELECTOR);
      const closest = item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
      if (group) {
        if (item.parentElement === group) {
          group.appendChild(item);
        } else {
          if (!closest)
            continue;
          group.appendChild(closest);
        }
      } else {
        if (item.parentElement === list) {
          list?.appendChild(item);
        } else {
          if (!closest)
            continue;
          list?.appendChild(closest);
        }
      }
    }
    groups.sort((a, b) => b[1] - a[1]);
    for (const group of groups) {
      const el = rootEl.querySelector(`${GROUP_SELECTOR}[${VALUE_ATTR}="${group[0]}"]`);
      el?.parentElement?.appendChild(el);
    }
    return state2;
  }
  function selectFirstItem() {
    const item = getValidItems().find((item2) => !item2.ariaDisabled);
    if (!item)
      return;
    const value = item.getAttribute(VALUE_ATTR);
    if (!value)
      return;
    return value;
  }
  function score(value, search) {
    const lowerCaseAndTrimmedValue = value?.toLowerCase().trim();
    const filterFn = filter;
    if (!filterFn) {
      return lowerCaseAndTrimmedValue ? defaultFilter(lowerCaseAndTrimmedValue, search) : 0;
    }
    return lowerCaseAndTrimmedValue ? filterFn(lowerCaseAndTrimmedValue, search) : 0;
  }
  function scrollSelectedIntoView() {
    const item = getSelectedItem();
    if (!item) {
      return;
    }
    if (item.parentElement?.firstChild === item) {
      tick().then(() => item.closest(GROUP_SELECTOR)?.querySelector(GROUP_HEADING_SELECTOR)?.scrollIntoView({
        block: "nearest"
      }));
    }
    tick().then(() => item.scrollIntoView({ block: "nearest" }));
  }
  function getValidItems(rootElement) {
    const rootEl = rootElement ?? document.getElementById(ids.root);
    if (!rootEl)
      return [];
    return Array.from(rootEl.querySelectorAll(VALID_ITEM_SELECTOR)).filter((el) => el ? true : false);
  }
  function getSelectedItem(rootElement) {
    const rootEl = rootElement ?? document.getElementById(ids.root);
    if (!rootEl)
      return;
    const selectedEl = rootEl.querySelector(`${VALID_ITEM_SELECTOR}[aria-selected="true"]`);
    if (!selectedEl)
      return;
    return selectedEl;
  }
  function updateSelectedToIndex(index) {
    const rootEl = document.getElementById(ids.root);
    if (!rootEl)
      return;
    const items = getValidItems(rootEl);
    const item = items[index];
    if (!item)
      return;
  }
  function updateSelectedByChange(change) {
    const selected = getSelectedItem();
    const items = getValidItems();
    const index = items.findIndex((item) => item === selected);
    let newSelected = items[index + change];
    if (loop) {
      if (index + change < 0) {
        newSelected = items[items.length - 1];
      } else if (index + change === items.length) {
        newSelected = items[0];
      } else {
        newSelected = items[index + change];
      }
    }
    if (newSelected) {
      updateState("value", newSelected.getAttribute(VALUE_ATTR) ?? "");
    }
  }
  function updateSelectedToGroup(change) {
    const selected = getSelectedItem();
    let group = selected?.closest(GROUP_SELECTOR);
    let item = void 0;
    while (group && !item) {
      group = change > 0 ? findNextSibling(group, GROUP_SELECTOR) : findPreviousSibling(group, GROUP_SELECTOR);
      item = group?.querySelector(VALID_ITEM_SELECTOR);
    }
    if (item) {
      updateState("value", item.getAttribute(VALUE_ATTR) ?? "");
    } else {
      updateSelectedByChange(change);
    }
  }
  function last2() {
    return updateSelectedToIndex(getValidItems().length - 1);
  }
  function next2(e) {
    e.preventDefault();
    if (e.metaKey) {
      last2();
    } else if (e.altKey) {
      updateSelectedToGroup(1);
    } else {
      updateSelectedByChange(1);
    }
  }
  function prev2(e) {
    e.preventDefault();
    if (e.metaKey) {
      updateSelectedToIndex(0);
    } else if (e.altKey) {
      updateSelectedToGroup(-1);
    } else {
      updateSelectedByChange(-1);
    }
  }
  function handleRootKeydown(e) {
    switch (e.key) {
      case kbd$1.ARROW_DOWN:
        next2(e);
        break;
      case kbd$1.ARROW_UP:
        prev2(e);
        break;
      case kbd$1.HOME:
        e.preventDefault();
        updateSelectedToIndex(0);
        break;
      case kbd$1.END:
        e.preventDefault();
        last2();
        break;
      case kbd$1.ENTER: {
        e.preventDefault();
        const item = getSelectedItem();
        if (item) {
          item?.click();
        }
      }
    }
  }
  setContext(NAME$m, context);
  const stateStore = {
    subscribe: state.subscribe,
    update: state.update,
    set: state.set,
    updateState
  };
  setContext(STATE_NAME, stateStore);
  return {
    state: stateStore,
    handleRootKeydown,
    commandEl,
    ids
  };
}
function findNextSibling(el, selector) {
  let sibling = el.nextElementSibling;
  while (sibling) {
    if (sibling.matches(selector))
      return sibling;
    sibling = sibling.nextElementSibling;
  }
}
function findPreviousSibling(el, selector) {
  let sibling = el.previousElementSibling;
  while (sibling) {
    if (sibling.matches(selector))
      return sibling;
    sibling = sibling.previousElementSibling;
  }
}
const Command$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let slotProps;
  let $$restProps = compute_rest_props($$props, [
    "label",
    "shouldFilter",
    "filter",
    "value",
    "onValueChange",
    "loop",
    "onKeydown",
    "state",
    "ids",
    "asChild"
  ]);
  let $stateStore, $$unsubscribe_stateStore;
  let { label = void 0 } = $$props;
  let { shouldFilter = true } = $$props;
  let { filter = void 0 } = $$props;
  let { value = void 0 } = $$props;
  let { onValueChange = void 0 } = $$props;
  let { loop = void 0 } = $$props;
  let { onKeydown = void 0 } = $$props;
  let { state = void 0 } = $$props;
  let { ids = void 0 } = $$props;
  let { asChild = false } = $$props;
  const { commandEl, handleRootKeydown, ids: commandIds, state: stateStore } = createCommand({
    label,
    shouldFilter,
    filter,
    value,
    onValueChange: (next2) => {
      if (next2 !== value) {
        value = next2;
        onValueChange?.(next2);
      }
    },
    loop,
    state,
    ids
  });
  $$unsubscribe_stateStore = subscribe(stateStore, (value2) => $stateStore = value2);
  function syncValueAndState(value2) {
    if (value2 && value2 !== $stateStore.value) {
      set_store_value(stateStore, $stateStore.value = value2, $stateStore);
    }
  }
  function rootAction(node) {
    commandEl.set(node);
    const unsubEvents = executeCallbacks(addEventListener$2(node, "keydown", handleKeydown));
    return { destroy: unsubEvents };
  }
  const rootAttrs = {
    role: "application",
    id: commandIds.root,
    "data-cmdk-root": ""
  };
  const labelAttrs = {
    "data-cmdk-label": "",
    for: commandIds.input,
    id: commandIds.label,
    style: styleToString$2(srOnlyStyles)
  };
  function handleKeydown(e) {
    onKeydown?.(e);
    if (e.defaultPrevented)
      return;
    handleRootKeydown(e);
  }
  const root = { action: rootAction, attrs: rootAttrs };
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.shouldFilter === void 0 && $$bindings.shouldFilter && shouldFilter !== void 0)
    $$bindings.shouldFilter(shouldFilter);
  if ($$props.filter === void 0 && $$bindings.filter && filter !== void 0)
    $$bindings.filter(filter);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.onValueChange === void 0 && $$bindings.onValueChange && onValueChange !== void 0)
    $$bindings.onValueChange(onValueChange);
  if ($$props.loop === void 0 && $$bindings.loop && loop !== void 0)
    $$bindings.loop(loop);
  if ($$props.onKeydown === void 0 && $$bindings.onKeydown && onKeydown !== void 0)
    $$bindings.onKeydown(onKeydown);
  if ($$props.state === void 0 && $$bindings.state && state !== void 0)
    $$bindings.state(state);
  if ($$props.ids === void 0 && $$bindings.ids && ids !== void 0)
    $$bindings.ids(ids);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  {
    syncValueAndState(value);
  }
  slotProps = {
    root,
    label: { attrs: labelAttrs },
    stateStore,
    state: $stateStore
  };
  $$unsubscribe_stateStore();
  return `${asChild ? `${slots.default ? slots.default({ ...slotProps }) : ``}` : `<div${spread([escape_object(rootAttrs), escape_object($$restProps)], {})}> <label${spread([escape_object(labelAttrs)], {})}>${escape(label ?? "")}</label> ${slots.default ? slots.default({ ...slotProps }) : ``}</div>`}`;
});
function styleToString$1(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
({
  type: "hidden",
  "aria-hidden": true,
  hidden: true,
  tabIndex: -1,
  style: styleToString$1({
    position: "absolute",
    opacity: 0,
    "pointer-events": "none",
    margin: 0,
    transform: "translateX(-100%)"
  })
});
function addEventListener$1(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
const kbd = {
  ALT: "Alt",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  BACKSPACE: "Backspace",
  CAPS_LOCK: "CapsLock",
  CONTROL: "Control",
  DELETE: "Delete",
  END: "End",
  ENTER: "Enter",
  ESCAPE: "Escape",
  F1: "F1",
  F10: "F10",
  F11: "F11",
  F12: "F12",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  HOME: "Home",
  META: "Meta",
  PAGE_DOWN: "PageDown",
  PAGE_UP: "PageUp",
  SHIFT: "Shift",
  SPACE: " ",
  TAB: "Tab",
  CTRL: "Control",
  ASTERISK: "*",
  A: "a",
  P: "p"
};
readable(void 0, (set) => {
  function clicked(event) {
    set(event);
    set(void 0);
  }
  const unsubscribe = addEventListener$1(document, "pointerup", clicked, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
readable(void 0, (set) => {
  function keydown(event) {
    if (event && event.key === kbd.ESCAPE) {
      set(event);
    }
    set(void 0);
  }
  const unsubscribe = addEventListener$1(document, "keydown", keydown, {
    passive: false,
    capture: true
  });
  return unsubscribe;
});
function createBitAttrs(bit, parts) {
  const attrs = {};
  parts.forEach((part) => {
    attrs[part] = {
      [`data-bits-${bit}-${part}`]: ""
    };
  });
  return (part) => attrs[part];
}
function styleToString(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
styleToString({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0"
});
styleToString({
  position: "absolute",
  width: "25px",
  height: "25px",
  opacity: "0",
  margin: "0px",
  pointerEvents: "none",
  transform: "translateX(-100%)"
});
const NAME$l = "accordion";
const PARTS$l = ["root", "content", "header", "item", "trigger"];
createBitAttrs(NAME$l, PARTS$l);
const NAME$k = "alert-dialog";
const PARTS$k = [
  "action",
  "cancel",
  "content",
  "description",
  "overlay",
  "portal",
  "title",
  "trigger"
];
createBitAttrs(NAME$k, PARTS$k);
const NAME$j = "avatar";
const PARTS$j = ["root", "image", "fallback"];
createBitAttrs(NAME$j, PARTS$j);
const NAME$i = "checkbox";
const PARTS$i = ["root", "input", "indicator"];
createBitAttrs(NAME$i, PARTS$i);
const NAME$h = "collapsible";
const PARTS$h = ["root", "content", "trigger"];
createBitAttrs(NAME$h, PARTS$h);
const NAME$g = "context-menu";
const PARTS$g = [
  "arrow",
  "checkbox-indicator",
  "checkbox-item",
  "content",
  "group",
  "item",
  "label",
  "radio-group",
  "radio-item",
  "separator",
  "sub-content",
  "sub-trigger",
  "trigger"
];
createBitAttrs(NAME$g, PARTS$g);
const NAME$f = "dialog";
const PARTS$f = ["close", "content", "description", "overlay", "portal", "title", "trigger"];
createBitAttrs(NAME$f, PARTS$f);
const NAME$e = "dropdown-menu";
const PARTS$e = [
  "arrow",
  "checkbox-indicator",
  "checkbox-item",
  "content",
  "group",
  "item",
  "label",
  "radio-group",
  "radio-item",
  "separator",
  "sub-content",
  "sub-trigger",
  "trigger"
];
createBitAttrs(NAME$e, PARTS$e);
const NAME$d = "link-preview";
const PARTS$d = ["arrow", "content", "trigger"];
createBitAttrs(NAME$d, PARTS$d);
const NAME$c = "label";
const PARTS$c = ["root"];
createBitAttrs(NAME$c, PARTS$c);
const NAME$b = "menubar";
const PARTS$b = [
  "root",
  "arrow",
  "checkbox-indicator",
  "checkbox-item",
  "content",
  "group",
  "item",
  "label",
  "radio-group",
  "radio-item",
  "separator",
  "sub-content",
  "sub-trigger",
  "trigger"
];
createBitAttrs(NAME$b, PARTS$b);
const NAME$a = "popover";
const PARTS$a = ["arrow", "close", "content", "trigger"];
createBitAttrs(NAME$a, PARTS$a);
const NAME$9 = "progress";
const PARTS$9 = ["root"];
createBitAttrs(NAME$9, PARTS$9);
const NAME$8 = "radio-group";
const PARTS$8 = ["root", "item", "input"];
createBitAttrs(NAME$8, PARTS$8);
const NAME$7 = "select";
const PARTS$7 = ["arrow", "content", "group", "item", "input", "label", "trigger", "value"];
createBitAttrs(NAME$7, PARTS$7);
const NAME$6 = "separator";
const PARTS$6 = ["root"];
createBitAttrs(NAME$6, PARTS$6);
const NAME$5 = "slider";
const PARTS$5 = ["root", "input", "range", "thumb", "tick"];
createBitAttrs(NAME$5, PARTS$5);
const NAME$4 = "switch";
const PARTS$4 = ["root", "input", "thumb"];
createBitAttrs(NAME$4, PARTS$4);
const NAME$3 = "tabs";
const PARTS$3 = ["root", "content", "list", "trigger"];
createBitAttrs(NAME$3, PARTS$3);
const NAME$2 = "toggle";
const PARTS$2 = ["root", "input"];
createBitAttrs(NAME$2, PARTS$2);
const NAME$1 = "toggle-group";
const PARTS$1 = ["root", "item"];
createBitAttrs(NAME$1, PARTS$1);
const NAME = "tooltip";
const PARTS = ["arrow", "content", "trigger"];
createBitAttrs(NAME, PARTS);
const CommandEmpty = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  compute_rest_props($$props, ["asChild"]);
  let $state, $$unsubscribe_state;
  let { asChild = false } = $$props;
  const state = getState();
  $$unsubscribe_state = subscribe(state, (value) => $state = value);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  $state.filtered.count === 0;
  $$unsubscribe_state();
  return `${``}`;
});
const CommandGroup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let containerAttrs;
  let groupAttrs;
  let container;
  let group;
  let $$restProps = compute_rest_props($$props, ["heading", "value", "alwaysRender", "asChild"]);
  let $render, $$unsubscribe_render;
  let { heading = void 0 } = $$props;
  let { value = "" } = $$props;
  let { alwaysRender = false } = $$props;
  let { asChild = false } = $$props;
  const { id } = createGroup(alwaysRender);
  const context = getCtx();
  const state = getState();
  const headingId = generateId();
  const render = derived(state, ($state) => {
    if (alwaysRender)
      return true;
    if (context.filter() === false)
      return true;
    if (!$state.search)
      return true;
    return $state.filtered.groups.has(id);
  });
  $$unsubscribe_render = subscribe(render, (value2) => $render = value2);
  function containerAction(node) {
    if (value) {
      context.value(id, value);
      node.setAttribute(VALUE_ATTR, value);
      return;
    }
    if (heading) {
      value = heading.trim().toLowerCase();
    } else if (node.textContent) {
      value = node.textContent.trim().toLowerCase();
    }
    context.value(id, value);
    node.setAttribute(VALUE_ATTR, value);
  }
  const headingAttrs = {
    "data-cmdk-group-heading": "",
    "aria-hidden": true,
    id: headingId
  };
  if ($$props.heading === void 0 && $$bindings.heading && heading !== void 0)
    $$bindings.heading(heading);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.alwaysRender === void 0 && $$bindings.alwaysRender && alwaysRender !== void 0)
    $$bindings.alwaysRender(alwaysRender);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  containerAttrs = {
    "data-cmdk-group": "",
    role: "presentation",
    hidden: $render ? void 0 : true,
    "data-value": value
  };
  groupAttrs = {
    "data-cmdk-group-items": "",
    role: "group",
    "aria-labelledby": heading ? headingId : void 0
  };
  container = {
    action: containerAction,
    attrs: containerAttrs
  };
  group = { attrs: groupAttrs };
  $$unsubscribe_render();
  return `${asChild ? `${slots.default ? slots.default({
    container,
    group,
    heading: { attrs: headingAttrs }
  }) : ``}` : `<div${spread([escape_object(containerAttrs), escape_object($$restProps)], {})}>${heading ? `<div${spread([escape_object(headingAttrs)], {})}>${escape(heading)}</div>` : ``} <div${spread([escape_object(groupAttrs)], {})}>${slots.default ? slots.default({
    container,
    group,
    heading: { attrs: headingAttrs }
  }) : ``}</div></div>`}`;
});
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const CommandInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["autofocus", "value", "asChild", "el"]);
  let $selectedItemId, $$unsubscribe_selectedItemId;
  const { ids, commandEl } = getCtx();
  const state = getState();
  const search = derived(state, ($state) => $state.search);
  const valueStore = derived(state, ($state) => $state.value);
  let { autofocus = void 0 } = $$props;
  let { value = get_store_value(search) } = $$props;
  let { asChild = false } = $$props;
  let { el = void 0 } = $$props;
  const selectedItemId = derived([valueStore, commandEl], ([$value, $commandEl]) => {
    if (!isBrowser)
      return void 0;
    const item = $commandEl?.querySelector(`${ITEM_SELECTOR}[${VALUE_ATTR}="${$value}"]`);
    return item?.getAttribute("id");
  });
  $$unsubscribe_selectedItemId = subscribe(selectedItemId, (value2) => $selectedItemId = value2);
  function handleValueUpdate(v) {
    state.updateState("search", v);
  }
  function action(node) {
    if (autofocus) {
      sleep(10).then(() => node.focus());
    }
    if (asChild) {
      const unsubEvents = addEventListener$2(node, "change", (e) => {
        const currTarget = e.currentTarget;
        state.updateState("search", currTarget.value);
      });
      return { destroy: unsubEvents };
    }
  }
  let attrs;
  if ($$props.autofocus === void 0 && $$bindings.autofocus && autofocus !== void 0)
    $$bindings.autofocus(autofocus);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  {
    handleValueUpdate(value);
  }
  attrs = {
    type: "text",
    "data-cmdk-input": "",
    autocomplete: "off",
    autocorrect: "off",
    spellcheck: false,
    "aria-autocomplete": "list",
    role: "combobox",
    "aria-expanded": true,
    "aria-controls": ids.list,
    "aria-labelledby": ids.label,
    "aria-activedescendant": $selectedItemId ?? void 0,
    id: ids.input
  };
  $$unsubscribe_selectedItemId();
  return `${asChild ? `${slots.default ? slots.default({ action, attrs }) : ``}` : `<input${spread([escape_object(attrs), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}${add_attribute("value", value, 0)}>`}`;
});
const CommandItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let attrs;
  let $$restProps = compute_rest_props($$props, ["disabled", "value", "onSelect", "alwaysRender", "asChild", "id"]);
  let $selected, $$unsubscribe_selected;
  let $render, $$unsubscribe_render;
  let { disabled = false } = $$props;
  let { value = "" } = $$props;
  let { onSelect = void 0 } = $$props;
  let { alwaysRender = false } = $$props;
  let { asChild = false } = $$props;
  let { id = generateId() } = $$props;
  const groupContext = getGroup();
  const context = getCtx();
  const state = getState();
  const trueAlwaysRender = alwaysRender ?? groupContext?.alwaysRender;
  const render = derived(state, ($state) => {
    if (trueAlwaysRender || context.filter() === false || !$state.search)
      return true;
    const currentScore = $state.filtered.items.get(id);
    if (isUndefined(currentScore))
      return false;
    return currentScore > 0;
  });
  $$unsubscribe_render = subscribe(render, (value2) => $render = value2);
  let isFirstRender = true;
  const selected = derived(state, ($state) => $state.value === value);
  $$unsubscribe_selected = subscribe(selected, (value2) => $selected = value2);
  function action(node) {
    if (!value && node.textContent) {
      value = node.textContent.trim().toLowerCase();
    }
    context.value(id, value);
    node.setAttribute(VALUE_ATTR, value);
    const unsubEvents = executeCallbacks(
      addEventListener$2(node, "pointermove", () => {
        if (disabled)
          return;
        select();
      }),
      addEventListener$2(node, "click", () => {
        if (disabled)
          return;
        handleItemClick();
      })
    );
    return {
      destroy() {
        unsubEvents();
      }
    };
  }
  function handleItemClick() {
    select();
    onSelect?.(value);
  }
  function select() {
    state.updateState("value", value, true);
  }
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.onSelect === void 0 && $$bindings.onSelect && onSelect !== void 0)
    $$bindings.onSelect(onSelect);
  if ($$props.alwaysRender === void 0 && $$bindings.alwaysRender && alwaysRender !== void 0)
    $$bindings.alwaysRender(alwaysRender);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  attrs = {
    "aria-disabled": disabled ? true : void 0,
    "aria-selected": $selected ? true : void 0,
    "data-disabled": disabled ? true : void 0,
    "data-selected": $selected ? true : void 0,
    "data-cmdk-item": "",
    "data-value": value,
    role: "option",
    id
  };
  $$unsubscribe_selected();
  $$unsubscribe_render();
  return `${$render || isFirstRender ? `${asChild ? `${slots.default ? slots.default({ action, attrs }) : ``}` : `<div${spread([escape_object(attrs), escape_object($$restProps)], {})}>${slots.default ? slots.default({ action, attrs }) : ``}</div>`}` : ``}`;
});
const CommandList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["el", "asChild"]);
  let $$unsubscribe_state;
  const { ids } = getCtx();
  const state = getState();
  $$unsubscribe_state = subscribe(state, (value) => value);
  let { el = void 0 } = $$props;
  let { asChild = false } = $$props;
  function sizerAction(node) {
    let animationFrame;
    const listEl = node.closest("[data-cmdk-list]");
    if (!isHTMLElement(listEl)) {
      return;
    }
    const observer = new ResizeObserver(() => {
      animationFrame = requestAnimationFrame(() => {
        const height = node.offsetHeight;
        listEl.style.setProperty("--cmdk-list-height", height.toFixed(1) + "px");
      });
    });
    observer.observe(node);
    return {
      destroy() {
        cancelAnimationFrame(animationFrame);
        observer.unobserve(node);
      }
    };
  }
  const listAttrs = {
    "data-cmdk-list": "",
    role: "listbox",
    "aria-label": "Suggestions",
    id: ids.list,
    "aria-labelledby": ids.input
  };
  const sizerAttrs = { "data-cmdk-list-sizer": "" };
  const list = { attrs: listAttrs };
  const sizer = { attrs: sizerAttrs, action: sizerAction };
  if ($$props.el === void 0 && $$bindings.el && el !== void 0)
    $$bindings.el(el);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  $$unsubscribe_state();
  return `${asChild ? `${slots.default ? slots.default({ list, sizer }) : ``}` : `<div${spread([escape_object(listAttrs), escape_object($$restProps)], {})}${add_attribute("this", el, 0)}><div${spread([escape_object(sizerAttrs)], {})}>${slots.default ? slots.default({}) : ``}</div></div>`}`;
});
const CommandSeparator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["alwaysRender", "asChild"]);
  let $render, $$unsubscribe_render;
  let { alwaysRender = false } = $$props;
  let { asChild = false } = $$props;
  const state = getState();
  const render = derived(state, ($state) => !$state.search);
  $$unsubscribe_render = subscribe(render, (value) => $render = value);
  const attrs = {
    "data-cmdk-separator": "",
    role: "separator"
  };
  if ($$props.alwaysRender === void 0 && $$bindings.alwaysRender && alwaysRender !== void 0)
    $$bindings.alwaysRender(alwaysRender);
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  $$unsubscribe_render();
  return `${$render || alwaysRender ? `${asChild ? `${slots.default ? slots.default({ attrs }) : ``}` : `<div${spread([escape_object(attrs), escape_object($$restProps)], {})}></div>`}` : ``}`;
});
const Command = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value", "class"]);
  let { value = void 0 } = $$props;
  let { class: className = void 0 } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Command$1, "CommandPrimitive.Root").$$render(
      $$result,
      Object.assign(
        {},
        {
          class: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)
        },
        $$restProps,
        { value }
      ),
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${slots.default ? slots.default({}) : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Dialog_title = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Dialog_title$1, "DialogPrimitive.Title").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-lg font-semibold leading-none tracking-tight", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Dialog_portal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `${validate_component(Dialog_portal$1, "DialogPrimitive.Portal").$$render($$result, Object.assign({}, $$restProps), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dialog_footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
const Dialog_header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `<div${spread(
    [
      {
        class: escape_attribute_value(cn("flex flex-col space-y-1.5 text-center sm:text-left", className))
      },
      escape_object($$restProps)
    ],
    {}
  )}>${slots.default ? slots.default({}) : ``}</div>`;
});
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
  };
}
const Dialog_overlay = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = fade } = $$props;
  let { transitionConfig = { duration: 150 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_overlay$1, "DialogPrimitive.Overlay").$$render(
    $$result,
    Object.assign(
      {},
      { transition },
      { transitionConfig },
      {
        class: cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Cross2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "cross 2," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path></svg>`} `;
});
const Dialog_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig"]);
  let { class: className = void 0 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = { duration: 200 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  return `${validate_component(Dialog_portal, "Dialog.Portal").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Dialog_overlay, "Dialog.Overlay").$$render($$result, {}, {}, {})} ${validate_component(Dialog_content$1, "DialogPrimitive.Content").$$render(
        $$result,
        Object.assign(
          {},
          { transition },
          { transitionConfig },
          {
            class: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full", className)
          },
          $$restProps
        ),
        {},
        {
          default: () => {
            return `${slots.default ? slots.default({}) : ``} ${validate_component(Dialog_close, "DialogPrimitive.Close").$$render(
              $$result,
              {
                class: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              },
              {},
              {
                default: () => {
                  return `${validate_component(Cross2, "Cross2").$$render($$result, { class: "h-4 w-4" }, {}, {})} <span class="sr-only" data-svelte-h="svelte-1pewzs3">Close</span>`;
                }
              }
            )}`;
          }
        }
      )}`;
    }
  })}`;
});
const Dialog_description = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Dialog_description$1, "DialogPrimitive.Description").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-sm text-muted-foreground", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Root$2 = Dialog;
const Command_empty = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(CommandEmpty, "CommandPrimitive.Empty").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("py-6 text-center text-sm", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Command_group = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(CommandGroup, "CommandPrimitive.Group").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("overflow-hidden p-1 text-foreground [&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:py-1.5 [&_[data-cmdk-group-heading]]:text-xs [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Command_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["asChild", "class"]);
  let { asChild = false } = $$props;
  let { class: className = void 0 } = $$props;
  if ($$props.asChild === void 0 && $$bindings.asChild && asChild !== void 0)
    $$bindings.asChild(asChild);
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(CommandItem, "CommandPrimitive.Item").$$render(
    $$result,
    Object.assign(
      {},
      { asChild },
      {
        class: cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)
      },
      $$restProps
    ),
    {},
    {
      default: ({ action, attrs }) => {
        return `${slots.default ? slots.default({ action, attrs }) : ``}`;
      }
    }
  )}`;
});
const MagnifyingGlass = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "role", "color", "ariaLabel", "withEvents"]);
  const ctx = getContext("iconCtx") ?? {};
  let { size: size2 = ctx.size || "24" } = $$props;
  let { role = ctx.role || "img" } = $$props;
  let { color = ctx.color || "currentColor" } = $$props;
  let { ariaLabel = "magnifying glass," } = $$props;
  let { withEvents = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size2 !== void 0)
    $$bindings.size(size2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.withEvents === void 0 && $$bindings.withEvents && withEvents !== void 0)
    $$bindings.withEvents(withEvents);
  return `${withEvents ? `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor"></path></svg>` : `<svg${spread(
    [
      { width: escape_attribute_value(size2) },
      { height: escape_attribute_value(size2) },
      escape_object($$restProps),
      { role: escape_attribute_value(role) },
      {
        "aria-label": escape_attribute_value(ariaLabel)
      },
      { viewBox: "0 0 15 15" },
      { fill: escape_attribute_value(color) },
      { xmlns: "http://www.w3.org/2000/svg" }
    ],
    {}
  )}><path fill-rule="evenodd" clip-rule="evenodd" d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor"></path></svg>`} `;
});
const Command_input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value"]);
  let { class: className = void 0 } = $$props;
  let { value = "" } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="flex items-center border-b px-3" data-cmdk-input-wrapper="">${validate_component(MagnifyingGlass, "MagnifyingGlass").$$render(
      $$result,
      {
        class: "mr-2 h-4 w-4 shrink-0 opacity-50"
      },
      {},
      {}
    )} ${validate_component(CommandInput, "CommandPrimitive.Input").$$render(
      $$result,
      Object.assign(
        {},
        {
          class: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)
        },
        $$restProps,
        { value }
      ),
      {
        value: ($$value) => {
          value = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  return $$rendered;
});
const Command_list = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(CommandList, "CommandPrimitive.List").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Command_separator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(CommandSeparator, "CommandPrimitive.Separator").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("-mx-1 h-px bg-border", className)
      },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value", "readonly"]);
  let { class: className = void 0 } = $$props;
  let { value = void 0 } = $$props;
  let { readonly: readonly2 = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.readonly === void 0 && $$bindings.readonly && readonly2 !== void 0)
    $$bindings.readonly(readonly2);
  return `<input${spread(
    [
      {
        class: escape_attribute_value(cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className))
      },
      { readonly: readonly2 || null },
      escape_object($$restProps)
    ],
    {}
  )}${add_attribute("value", value, 0)}>`;
});
const Label = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Label$1, "LabelPrimitive.Root").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Popover_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "transition", "transitionConfig", "align", "sideOffset"]);
  let { class: className = void 0 } = $$props;
  let { transition = flyAndScale } = $$props;
  let { transitionConfig = void 0 } = $$props;
  let { align = "center" } = $$props;
  let { sideOffset = 4 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.transition === void 0 && $$bindings.transition && transition !== void 0)
    $$bindings.transition(transition);
  if ($$props.transitionConfig === void 0 && $$bindings.transitionConfig && transitionConfig !== void 0)
    $$bindings.transitionConfig(transitionConfig);
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  return `${validate_component(Popover_content$1, "PopoverPrimitive.Content").$$render(
    $$result,
    Object.assign({}, { transition }, { transitionConfig }, { align }, { sideOffset }, $$restProps, {
      class: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)
    }),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const Root$1 = Popover;
const Trigger = Popover_trigger;
const Select_item = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "value", "label", "disabled"]);
  let { class: className = void 0 } = $$props;
  let { value } = $$props;
  let { label = void 0 } = $$props;
  let { disabled = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  return `${validate_component(Select_item$1, "SelectPrimitive.Item").$$render(
    $$result,
    Object.assign(
      {},
      { value },
      { disabled },
      { label },
      {
        class: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `<span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">${validate_component(Select_item_indicator, "SelectPrimitive.ItemIndicator").$$render($$result, {}, {}, {
          default: () => {
            return `${validate_component(Check, "Check").$$render($$result, { class: "h-4 w-4" }, {}, {})}`;
          }
        })}</span> ${slots.default ? slots.default({}) : ` ${escape(label || value)} `}`;
      }
    }
  )}`;
});
const Select_content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "class",
    "sideOffset",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig"
  ]);
  let { class: className = void 0 } = $$props;
  let { sideOffset = 4 } = $$props;
  let { inTransition = flyAndScale } = $$props;
  let { inTransitionConfig = void 0 } = $$props;
  let { outTransition = scale } = $$props;
  let { outTransitionConfig = { start: 0.95, opacity: 0, duration: 50 } } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.sideOffset === void 0 && $$bindings.sideOffset && sideOffset !== void 0)
    $$bindings.sideOffset(sideOffset);
  if ($$props.inTransition === void 0 && $$bindings.inTransition && inTransition !== void 0)
    $$bindings.inTransition(inTransition);
  if ($$props.inTransitionConfig === void 0 && $$bindings.inTransitionConfig && inTransitionConfig !== void 0)
    $$bindings.inTransitionConfig(inTransitionConfig);
  if ($$props.outTransition === void 0 && $$bindings.outTransition && outTransition !== void 0)
    $$bindings.outTransition(outTransition);
  if ($$props.outTransitionConfig === void 0 && $$bindings.outTransitionConfig && outTransitionConfig !== void 0)
    $$bindings.outTransitionConfig(outTransitionConfig);
  return `${validate_component(Select_content$1, "SelectPrimitive.Content").$$render(
    $$result,
    Object.assign(
      {},
      { inTransition },
      { inTransitionConfig },
      { outTransition },
      { outTransitionConfig },
      { sideOffset },
      {
        class: cn("relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `<div class="w-full p-1">${slots.default ? slots.default({}) : ``}</div>`;
      }
    }
  )}`;
});
const Select_trigger = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class"]);
  let { class: className = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  return `${validate_component(Select_trigger$1, "SelectPrimitive.Trigger").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)
      },
      $$restProps
    ),
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``} <div>${validate_component(CaretSort, "CaretSort").$$render($$result, { class: "h-4 w-4 opacity-50" }, {}, {})}</div>`;
      }
    }
  )}`;
});
const Root = Select;
const Value = Select_value;
const ProfileDropdown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { class: className = void 0 } = $$props;
  const groups = [
    {
      label: "Personal Account",
      teams: [{ label: "Dalton", value: "personal" }]
    },
    {
      label: "Teams",
      teams: [
        { label: "Test Team 1", value: "team-1" },
        { label: "Test Team 2", value: "team-2" }
      ]
    }
  ];
  let open = false;
  let showTeamDialog = false;
  let selectedTeam = groups[0].teams[0];
  function closeAndRefocusTrigger(triggerId) {
    open = false;
    tick().then(() => document.getElementById(triggerId)?.focus());
  }
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Root$2, "Dialog.Root").$$render(
      $$result,
      { open: showTeamDialog },
      {
        open: ($$value) => {
          showTeamDialog = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(Root$1, "Popover.Root").$$render(
            $$result,
            { open },
            {
              open: ($$value) => {
                open = $$value;
                $$settled = false;
              }
            },
            {
              default: ({ ids }) => {
                return `${validate_component(Trigger, "Popover.Trigger").$$render($$result, { asChild: true }, {}, {
                  default: ({ builder }) => {
                    return `${validate_component(Button, "Button").$$render(
                      $$result,
                      {
                        builders: [builder],
                        variant: "outline",
                        role: "combobox",
                        "aria-expanded": open,
                        "aria-label": "Select a team",
                        class: cn("w-[200px] justify-between bg-blue-950 text-white dark:bg-blue-900", className)
                      },
                      {},
                      {
                        default: () => {
                          return `${validate_component(Avatar, "Avatar.Root").$$render($$result, { class: "mr-2 h-5 w-5" }, {}, {
                            default: () => {
                              return `${validate_component(Avatar_image, "Avatar.Image").$$render(
                                $$result,
                                {
                                  src: "https://avatar.vercel.sh/$" + selectedTeam.value + ".png",
                                  alt: selectedTeam.label
                                },
                                {},
                                {}
                              )} ${validate_component(Avatar_fallback, "Avatar.Fallback").$$render($$result, {}, {}, {
                                default: () => {
                                  return `SC`;
                                }
                              })}`;
                            }
                          })} ${escape(selectedTeam.label)} ${validate_component(CaretSort, "CaretSort").$$render(
                            $$result,
                            {
                              class: "ml-auto h-4 w-4 shrink-0 opacity-50"
                            },
                            {},
                            {}
                          )}`;
                        }
                      }
                    )}`;
                  }
                })} ${validate_component(Popover_content, "Popover.Content").$$render($$result, { class: "w-[200px]  p-0" }, {}, {
                  default: () => {
                    return `${validate_component(Command, "Command.Root").$$render($$result, {}, {}, {
                      default: () => {
                        return `${validate_component(Command_input, "Command.Input").$$render($$result, { placeholder: "Search Profiles..." }, {}, {})} ${validate_component(Command_list, "Command.List").$$render($$result, {}, {}, {
                          default: () => {
                            return `${validate_component(Command_empty, "Command.Empty").$$render($$result, {}, {}, {
                              default: () => {
                                return `No team found.`;
                              }
                            })} ${each(groups, (group) => {
                              return `${validate_component(Command_group, "Command.Group").$$render($$result, { heading: group.label }, {}, {
                                default: () => {
                                  return `${each(group.teams, (team) => {
                                    return `${validate_component(Command_item, "Command.Item").$$render(
                                      $$result,
                                      {
                                        onSelect: () => {
                                          selectedTeam = team;
                                          closeAndRefocusTrigger(ids.trigger);
                                        },
                                        value: team.label,
                                        class: "text-sm"
                                      },
                                      {},
                                      {
                                        default: () => {
                                          return `${validate_component(Avatar, "Avatar.Root").$$render($$result, { class: "mr-2 h-5 w-5" }, {}, {
                                            default: () => {
                                              return `${validate_component(Avatar_image, "Avatar.Image").$$render(
                                                $$result,
                                                {
                                                  src: "https://avatar.vercel.sh/$" + team.value + ".png",
                                                  alt: team.label
                                                },
                                                {},
                                                {}
                                              )} ${validate_component(Avatar_fallback, "Avatar.Fallback").$$render($$result, {}, {}, {
                                                default: () => {
                                                  return `SC`;
                                                }
                                              })} `;
                                            }
                                          })} ${escape(team.label)} ${validate_component(Check, "Check").$$render(
                                            $$result,
                                            {
                                              class: cn("ml-auto h-4 w-4", selectedTeam.value !== team.value && "text-transparent")
                                            },
                                            {},
                                            {}
                                          )} `;
                                        }
                                      }
                                    )}`;
                                  })} `;
                                }
                              })}`;
                            })}`;
                          }
                        })} ${validate_component(Command_separator, "Command.Separator").$$render($$result, {}, {}, {})} ${validate_component(Command_list, "Command.List").$$render($$result, {}, {}, {
                          default: () => {
                            return `${validate_component(Command_group, "Command.Group").$$render($$result, {}, {}, {
                              default: () => {
                                return `${validate_component(Command_item, "Command.Item").$$render(
                                  $$result,
                                  {
                                    onSelect: () => {
                                      open = false;
                                      showTeamDialog = true;
                                    }
                                  },
                                  {},
                                  {
                                    default: () => {
                                      return `${validate_component(PlusCircled, "PlusCircled").$$render($$result, { class: "mr-2 h-5 w-5" }, {}, {})}
							Create Team`;
                                    }
                                  }
                                )}`;
                              }
                            })}`;
                          }
                        })}`;
                      }
                    })}`;
                  }
                })}`;
              }
            }
          )} ${validate_component(Dialog_content, "Dialog.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Dialog_header, "Dialog.Header").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Dialog_title, "Dialog.Title").$$render($$result, {}, {}, {
                    default: () => {
                      return `Create team`;
                    }
                  })} ${validate_component(Dialog_description, "Dialog.Description").$$render($$result, {}, {}, {
                    default: () => {
                      return `Add a new team to manage products and customers.`;
                    }
                  })}`;
                }
              })} <div><div class="space-y-4 py-2 pb-4"><div class="space-y-2">${validate_component(Label, "Label").$$render($$result, { for: "name" }, {}, {
                default: () => {
                  return `Team name`;
                }
              })} ${validate_component(Input, "Input").$$render($$result, { id: "name", placeholder: "Acme Inc." }, {}, {})}</div> <div class="space-y-2">${validate_component(Label, "Label").$$render($$result, { for: "plan" }, {}, {
                default: () => {
                  return `Subscription plan`;
                }
              })} ${validate_component(Root, "Select.Root").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Select_trigger, "Select.Trigger").$$render($$result, {}, {}, {
                    default: () => {
                      return `${validate_component(Value, "Select.Value").$$render($$result, { placeholder: "Select a plan" }, {}, {})}`;
                    }
                  })} ${validate_component(Select_content, "Select.Content").$$render($$result, {}, {}, {
                    default: () => {
                      return `${validate_component(Select_item, "Select.Item").$$render($$result, { value: "free" }, {}, {
                        default: () => {
                          return `<span class="font-medium" data-svelte-h="svelte-1vlwzx0">Free </span>-<span class="text-muted-foreground" data-svelte-h="svelte-1nicslj">Trial for two weeks</span>`;
                        }
                      })} ${validate_component(Select_item, "Select.Item").$$render($$result, { value: "pro" }, {}, {
                        default: () => {
                          return `<span class="font-medium" data-svelte-h="svelte-2v6u9v">Pro</span> -
								<span class="text-muted-foreground" data-svelte-h="svelte-xts7sg">$9/month per user</span>`;
                        }
                      })}`;
                    }
                  })}`;
                }
              })}</div></div></div> ${validate_component(Dialog_footer, "Dialog.Footer").$$render($$result, {}, {}, {
                default: () => {
                  return `${validate_component(Button, "Button").$$render($$result, { variant: "outline" }, {}, {
                    default: () => {
                      return `Cancel`;
                    }
                  })} ${validate_component(Button, "Button").$$render($$result, { type: "submit" }, {}, {
                    default: () => {
                      return `Continue`;
                    }
                  })}`;
                }
              })}`;
            }
          })}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const Separator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["class", "orientation", "decorative"]);
  let { class: className = void 0 } = $$props;
  let { orientation = "horizontal" } = $$props;
  let { decorative = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.orientation === void 0 && $$bindings.orientation && orientation !== void 0)
    $$bindings.orientation(orientation);
  if ($$props.decorative === void 0 && $$bindings.decorative && decorative !== void 0)
    $$bindings.decorative(decorative);
  return `${validate_component(Separator$1, "SeparatorPrimitive.Root").$$render(
    $$result,
    Object.assign(
      {},
      {
        class: cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )
      },
      { orientation },
      { decorative },
      $$restProps
    ),
    {},
    {}
  )}`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Mode_watcher, "ModeWatcher").$$render($$result, { defaultMode: "dark" }, {}, {})} <div class="flex h-fit max-h-fit flex-col items-center justify-between"><div id="nav-bar" class="sticky flex w-full items-center justify-between p-2"><div class="flex items-center">${validate_component(Button, "Button").$$render(
    $$result,
    {
      href: "/",
      class: " m-0 h-[60px] w-[60px] bg-transparent p-0"
    },
    {},
    {}
  )} <div class="flex items-end px-4" data-svelte-h="svelte-145fjp2"><h1 class="scroll-m-20 align-baseline text-4xl font-normal tracking-tight lg:text-5xl">M</h1> <h2 class="scroll-m-20 align-baseline text-3xl tracking-tight text-muted-foreground lg:text-4xl">ithral</h2> <h1 class="scroll-m-20 pl-2 align-baseline text-4xl font-normal tracking-tight lg:text-5xl">L</h1> <h2 class="scroll-m-20 px-1 align-baseline text-3xl tracking-tight text-muted-foreground lg:text-4xl">abs</h2></div></div> <div class="mx-2 flex gap-2">${`${validate_component(Button, "Button").$$render($$result, { href: "/profile/dalton" }, {}, {
    default: () => {
      return `My Recipes`;
    }
  })}`} ${validate_component(Menubar, "Menubar.Root").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Menu, "Menubar.Menu").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(Menubar_trigger, "Menubar.Trigger").$$render($$result, {}, {}, {
            default: () => {
              return `Solutions`;
            }
          })} ${validate_component(Menubar_content, "Menubar.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Testing/Evaluation`;
                }
              })}`;
            }
          })}`;
        }
      })} ${validate_component(Menu, "Menubar.Menu").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(Menubar_trigger, "Menubar.Trigger").$$render($$result, {}, {}, {
            default: () => {
              return `Documentation`;
            }
          })} ${validate_component(Menubar_content, "Menubar.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Computer Vision`;
                }
              })} ${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Natural Language Processing`;
                }
              })} ${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Reinforcement Learning`;
                }
              })} ${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Classical Machine Learning`;
                }
              })} ${validate_component(Menubar_separator, "Menubar.Separator").$$render($$result, {}, {}, {})} ${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `FAQ`;
                }
              })}`;
            }
          })}`;
        }
      })} ${validate_component(Menu, "Menubar.Menu").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(Menubar_trigger, "Menubar.Trigger").$$render($$result, {}, {}, {
            default: () => {
              return `Contact`;
            }
          })} ${validate_component(Menubar_content, "Menubar.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Menubar_separator, "Menubar.Separator").$$render($$result, {}, {}, {})} ${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Email`;
                }
              })}`;
            }
          })}`;
        }
      })} ${validate_component(Menu, "Menubar.Menu").$$render($$result, {}, {}, {
        default: () => {
          return `${validate_component(Menubar_trigger, "Menubar.Trigger").$$render($$result, {}, {}, {
            default: () => {
              return `Pricing`;
            }
          })} ${validate_component(Menubar_content, "Menubar.Content").$$render($$result, {}, {}, {
            default: () => {
              return `${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Free`;
                }
              })} ${validate_component(Menubar_item, "Menubar.Item").$$render($$result, {}, {}, {
                default: () => {
                  return `Enterprise`;
                }
              })}`;
            }
          })}`;
        }
      })}`;
    }
  })} ${`${validate_component(ProfileDropdown, "ProfileDropdown").$$render($$result, {}, {}, {})}`} ${validate_component(DarkmodeSwitch, "DarkmodeSwitch").$$render($$result, {}, {}, {})}</div></div> ${validate_component(Separator, "Separator").$$render($$result, {}, {}, {})}</div> ${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
