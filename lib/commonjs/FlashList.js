"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlashList = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _hooks = require("./hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Used as a memo to prevent rerendering too often when the context changes.
 * See: https://github.com/facebook/react/issues/15156#issuecomment-474590693
 */

let AnimatedFlashList = null;
const ensureFlastList = () => {
  if (AnimatedFlashList) {
    return;
  }
  try {
    const flashListModule = require('@shopify/flash-list');
    AnimatedFlashList = _reactNativeReanimated.default.createAnimatedComponent(flashListModule.FlashList);
  } catch {
    console.error('The optional dependency @shopify/flash-list is not installed. Please install it to use the FlashList component.');
  }
};
const FlashListMemo = /*#__PURE__*/_react.default.memo(/*#__PURE__*/_react.default.forwardRef((props, passRef) => {
  ensureFlastList();
  return AnimatedFlashList ? /*#__PURE__*/_react.default.createElement(AnimatedFlashList, _extends({
    ref: passRef
  }, props)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
}));
function FlashListImpl({
  style,
  onContentSizeChange,
  refreshControl,
  contentContainerStyle: _contentContainerStyle,
  ...rest
}, passRef) {
  const name = (0, _hooks.useTabNameContext)();
  const {
    setRef,
    contentInset
  } = (0, _hooks.useTabsContext)();
  const ref = (0, _hooks.useSharedAnimatedRef)(passRef);
  const recyclerRef = (0, _hooks.useSharedAnimatedRef)(null);
  const {
    scrollHandler,
    enable
  } = (0, _hooks.useScrollHandlerY)(name);
  const hadLoad = (0, _reactNativeReanimated.useSharedValue)(false);
  const onLoad = (0, _react.useCallback)(() => {
    hadLoad.value = true;
  }, [hadLoad]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => {
    return hadLoad.value;
  }, ready => {
    if (ready) {
      enable(true);
    }
  });
  const {
    progressViewOffset,
    contentContainerStyle
  } = (0, _hooks.useCollapsibleStyle)();
  _react.default.useEffect(() => {
    setRef(name, recyclerRef);
  }, [name, recyclerRef, setRef]);
  const scrollContentSizeChange = (0, _hooks.useUpdateScrollViewContentSize)({
    name
  });
  const scrollContentSizeChangeHandlers = (0, _hooks.useChainCallback)(_react.default.useMemo(() => [scrollContentSizeChange, onContentSizeChange], [onContentSizeChange, scrollContentSizeChange]));
  const memoRefreshControl = _react.default.useMemo(() => refreshControl && /*#__PURE__*/_react.default.cloneElement(refreshControl, {
    progressViewOffset,
    ...refreshControl.props
  }), [progressViewOffset, refreshControl]);
  const memoContentInset = _react.default.useMemo(() => ({
    top: contentInset
  }), [contentInset]);
  const memoContentOffset = _react.default.useMemo(() => ({
    x: 0,
    y: -contentInset
  }), [contentInset]);
  const memoContentContainerStyle = _react.default.useMemo(() => ({
    paddingTop: contentContainerStyle.paddingTop,
    ..._contentContainerStyle
  }), [_contentContainerStyle, contentContainerStyle.paddingTop]);
  const refWorkaround = (0, _react.useCallback)(value => {
    // https://github.com/Shopify/flash-list/blob/2d31530ed447a314ec5429754c7ce88dad8fd087/src/FlashList.tsx#L829
    // We are not accessing the right element or view of the Flashlist (recyclerlistview). So we need to give
    // this ref the access to it
    // eslint-ignore
    ;
    recyclerRef(value === null || value === void 0 ? void 0 : value.recyclerlistview_unsafe);
    ref(value);
  }, [recyclerRef, ref]);
  return (
    /*#__PURE__*/
    // @ts-expect-error typescript complains about `unknown` in the memo, it should be T
    _react.default.createElement(FlashListMemo, _extends({}, rest, {
      onLoad: onLoad,
      ref: refWorkaround,
      contentContainerStyle: memoContentContainerStyle,
      bouncesZoom: false,
      onScroll: scrollHandler,
      scrollEventThrottle: 16,
      contentInset: memoContentInset,
      contentOffset: memoContentOffset,
      refreshControl: memoRefreshControl,
      progressViewOffset: progressViewOffset,
      automaticallyAdjustContentInsets: false,
      onContentSizeChange: scrollContentSizeChangeHandlers
    }))
  );
}

/**
 * Use like a regular FlashList.
 */
const FlashList = exports.FlashList = /*#__PURE__*/_react.default.forwardRef(FlashListImpl);
//# sourceMappingURL=FlashList.js.map