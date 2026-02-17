"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LegendList = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = require("react-native-reanimated");
var _helpers = require("./helpers");
var _hooks = require("./hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
let RawLegendList = null;
const ensureLegendList = () => {
  if (RawLegendList) return;
  try {
    const legendListModule = require('@legendapp/list');
    RawLegendList = legendListModule.LegendList;
  } catch {
    console.error('The optional dependency @legendapp/list is not installed. Please install it to use the LegendList component.');
  }
};

/**
 * Used as a memo to prevent rerendering too often when the context changes.
 * See: https://github.com/facebook/react/issues/15156#issuecomment-474590693
 */
const LegendListMemo = /*#__PURE__*/_react.default.memo(/*#__PURE__*/_react.default.forwardRef((props, passRef) => {
  ensureLegendList();
  return RawLegendList ? /*#__PURE__*/_react.default.createElement(RawLegendList, _extends({
    ref: passRef
  }, props)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
}));
function LegendListImpl({
  contentContainerStyle,
  style,
  onContentSizeChange,
  refreshControl,
  ...rest
}, passRef) {
  const name = (0, _hooks.useTabNameContext)();
  const {
    setRef,
    headerHeight,
    tabBarHeight,
    containerHeight,
    width,
    minHeaderHeight,
    focusedTab,
    tabNames,
    scrollYCurrent,
    scrollY,
    oldAccScrollY,
    accScrollY,
    offset,
    contentHeights,
    accDiffClamp,
    headerScrollDistance,
    revealHeaderOnScroll,
    allowHeaderOverscroll
  } = (0, _hooks.useTabsContext)();

  // AnimatedRef to LegendList's internal ScrollView (via refScrollView prop)
  // so scrollToImpl can sync scroll positions across tabs
  const scrollViewRef = (0, _reactNativeReanimated.useAnimatedRef)();

  // useScrollHandlerY for its sync-unfocused-scenes reaction and enable callback.
  // We don't use its scrollHandler since LegendList has its own internal ScrollView.
  const {
    enable
  } = (0, _hooks.useScrollHandlerY)(name);
  const onLayout = (0, _hooks.useAfterMountEffect)(rest.onLayout, () => {
    'worklet';

    enable(true);
  });

  // LegendList doesn't support iOS contentInset, so we ALWAYS use paddingTop
  // to position content below the header, regardless of allowHeaderOverscroll.
  const containerHeightWithMinHeader = Math.max(0, (containerHeight !== null && containerHeight !== void 0 ? containerHeight : 0) - minHeaderHeight);
  const _contentContainerStyle = (0, _react.useMemo)(() => ({
    minHeight: containerHeightWithMinHeader + (headerHeight || 0),
    paddingTop: (headerHeight || 0) + (tabBarHeight || 0)
  }), [containerHeightWithMinHeader, headerHeight, tabBarHeight]);
  const progressViewOffset = _helpers.IS_IOS && allowHeaderOverscroll ? 0 : (headerHeight || 0) + (tabBarHeight || 0);

  // Register the internal ScrollView ref (not the LegendList ref) in the refMap
  _react.default.useEffect(() => {
    setRef(name, scrollViewRef);
  }, [name, scrollViewRef, setRef]);
  const scrollContentSizeChange = (0, _hooks.useUpdateScrollViewContentSize)({
    name
  });
  const scrollContentSizeChangeHandlers = (0, _hooks.useChainCallback)((0, _react.useMemo)(() => [scrollContentSizeChange, onContentSizeChange], [onContentSizeChange, scrollContentSizeChange]));
  const memoRefreshControl = (0, _react.useMemo)(() => refreshControl && /*#__PURE__*/_react.default.cloneElement(refreshControl, {
    progressViewOffset,
    ...refreshControl.props
  }), [progressViewOffset, refreshControl]);
  const memoContentContainerStyle = (0, _react.useMemo)(() => ({
    ..._contentContainerStyle,
    ...contentContainerStyle
  }), [_contentContainerStyle, contentContainerStyle]);
  const memoStyle = (0, _react.useMemo)(() => [{
    width
  }, style], [width, style]);

  // JS-level scroll handler — updates shared values via runOnUI.
  // No contentInset adjustment needed since LegendList uses paddingTop instead.
  const onScroll = (0, _react.useCallback)(event => {
    const rawY = event.nativeEvent.contentOffset.y;
    (0, _reactNativeReanimated.runOnUI)((y, _name, _containerHeight, _allowHeaderOverscroll, _revealHeaderOnScroll) => {
      'worklet';

      if (focusedTab.value !== _name) return;
      if (_helpers.IS_IOS) {
        const contentHeight = contentHeights.value[tabNames.value.indexOf(_name)] || Number.MAX_VALUE;
        const clampMax = contentHeight - (_containerHeight || 0);
        scrollYCurrent.value = _allowHeaderOverscroll ? y : (0, _reactNativeReanimated.interpolate)(y, [0, clampMax], [0, clampMax], _reactNativeReanimated.Extrapolation.CLAMP);
      } else {
        scrollYCurrent.value = y;
      }
      scrollY.value[_name] = scrollYCurrent.value;
      oldAccScrollY.value = accScrollY.value;
      accScrollY.value = scrollY.value[_name] + offset.value;
      if (_revealHeaderOnScroll) {
        const delta = accScrollY.value - oldAccScrollY.value;
        const nextValue = accDiffClamp.value + delta;
        if (delta > 0) {
          accDiffClamp.value = Math.min(headerScrollDistance.value, nextValue);
        } else if (delta < 0) {
          accDiffClamp.value = Math.max(0, nextValue);
        }
      }
    })(rawY, name, containerHeight, allowHeaderOverscroll, revealHeaderOnScroll);
  }, [name, focusedTab, contentHeights, tabNames, containerHeight, scrollYCurrent, scrollY, oldAccScrollY, accScrollY, offset, allowHeaderOverscroll, revealHeaderOnScroll, accDiffClamp, headerScrollDistance]);
  return /*#__PURE__*/_react.default.createElement(LegendListMemo, _extends({}, rest, {
    onLayout: onLayout,
    ref: passRef,
    refScrollView: scrollViewRef,
    bouncesZoom: false,
    style: memoStyle,
    contentContainerStyle: memoContentContainerStyle,
    progressViewOffset: progressViewOffset,
    onScroll: onScroll,
    onContentSizeChange: scrollContentSizeChangeHandlers,
    scrollEventThrottle: 16,
    automaticallyAdjustContentInsets: false,
    refreshControl: memoRefreshControl,
    onMomentumScrollEnd: () => {}
  }));
}

/**
 * Use like a regular LegendList from @legendapp/list.
 */
const LegendList = exports.LegendList = /*#__PURE__*/_react.default.forwardRef(LegendListImpl);
//# sourceMappingURL=LegendList.js.map