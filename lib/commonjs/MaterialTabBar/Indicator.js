"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Indicator = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _helpers = require("../helpers");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Indicator = ({
  indexDecimal,
  itemsLayout,
  style,
  fadeIn = false
}) => {
  const opacity = (0, _reactNativeReanimated.useSharedValue)(fadeIn ? 0 : 1);
  const stylez = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    var _itemsLayout$0$x, _itemsLayout$, _itemsLayout$2;
    const firstItemX = (_itemsLayout$0$x = (_itemsLayout$ = itemsLayout[0]) === null || _itemsLayout$ === void 0 ? void 0 : _itemsLayout$.x) !== null && _itemsLayout$0$x !== void 0 ? _itemsLayout$0$x : 0;
    const transform = [{
      translateX: itemsLayout.length > 1 ? (0, _reactNativeReanimated.interpolate)(indexDecimal.value, itemsLayout.map((_, i) => i),
      // when in RTL mode, the X value should be inverted
      itemsLayout.map(v => _helpers.isRTL ? -1 * v.x : v.x)) : _helpers.isRTL ? -1 * firstItemX : firstItemX
    }];
    const width = itemsLayout.length > 1 ? (0, _reactNativeReanimated.interpolate)(indexDecimal.value, itemsLayout.map((_, i) => i), itemsLayout.map(v => v.width)) : (_itemsLayout$2 = itemsLayout[0]) === null || _itemsLayout$2 === void 0 ? void 0 : _itemsLayout$2.width;
    return {
      transform,
      width,
      opacity: (0, _reactNativeReanimated.withTiming)(opacity.value)
    };
  }, [indexDecimal, itemsLayout]);
  _react.default.useEffect(() => {
    if (fadeIn) {
      opacity.value = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeIn]);
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [stylez, styles.indicator, style]
  });
};
exports.Indicator = Indicator;
const styles = _reactNative.StyleSheet.create({
  indicator: {
    height: 2,
    backgroundColor: '#2196f3',
    position: 'absolute',
    bottom: 0
  }
});
//# sourceMappingURL=Indicator.js.map