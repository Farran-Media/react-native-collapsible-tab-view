"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRTL = exports.ONE_FRAME_MS = exports.IS_IOS = exports.AnimatedSectionList = exports.AnimatedFlatList = void 0;
exports.scrollToImpl = scrollToImpl;
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/** The time one frame takes at 60 fps (16 ms) */
const ONE_FRAME_MS = exports.ONE_FRAME_MS = 16;

/** check if app is in RTL mode or not */
const {
  isRTL
} = _reactNative.I18nManager;
exports.isRTL = isRTL;
const IS_IOS = exports.IS_IOS = _reactNative.Platform.OS === 'ios';
const AnimatedFlatList = exports.AnimatedFlatList = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.FlatList);
const AnimatedSectionList = exports.AnimatedSectionList = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.SectionList);
function scrollToImpl(ref, x, y, animated) {
  'worklet';

  if (!ref) return;
  // ensure we don't scroll on NaN
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  (0, _reactNativeReanimated.scrollTo)(ref, x, y, animated);
}
//# sourceMappingURL=helpers.js.map