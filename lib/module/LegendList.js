function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from 'react';
import Animated from 'react-native-reanimated';
import { useAfterMountEffect, useChainCallback, useCollapsibleStyle, useScrollHandlerY, useSharedAnimatedRef, useTabNameContext, useTabsContext, useUpdateScrollViewContentSize } from './hooks';
let AnimatedLegendList = null;
const ensureLegendList = () => {
  if (AnimatedLegendList) {
    return;
  }
  try {
    const legendListModule = require('@legendapp/list');
    AnimatedLegendList = Animated.createAnimatedComponent(legendListModule.LegendList);
  } catch {
    console.error('The optional dependency @legendapp/list is not installed. Please install it to use the LegendList component.');
  }
};

/**
 * Used as a memo to prevent rerendering too often when the context changes.
 * See: https://github.com/facebook/react/issues/15156#issuecomment-474590693
 */
const LegendListMemo = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef((props, passRef) => {
  ensureLegendList();
  return AnimatedLegendList ? /*#__PURE__*/React.createElement(AnimatedLegendList, _extends({
    ref: passRef
  }, props)) : /*#__PURE__*/React.createElement(React.Fragment, null);
}));
function LegendListImpl({
  contentContainerStyle,
  style,
  onContentSizeChange,
  refreshControl,
  ...rest
}, passRef) {
  const name = useTabNameContext();
  const {
    setRef,
    contentInset
  } = useTabsContext();
  const ref = useSharedAnimatedRef(passRef);
  const {
    scrollHandler,
    enable
  } = useScrollHandlerY(name);
  const onLayout = useAfterMountEffect(rest.onLayout, () => {
    'worklet';

    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    enable(true);
  });
  const {
    style: _style,
    contentContainerStyle: _contentContainerStyle,
    progressViewOffset
  } = useCollapsibleStyle();
  React.useEffect(() => {
    setRef(name, ref);
  }, [name, ref, setRef]);
  const scrollContentSizeChange = useUpdateScrollViewContentSize({
    name
  });
  const scrollContentSizeChangeHandlers = useChainCallback(React.useMemo(() => [scrollContentSizeChange, onContentSizeChange], [onContentSizeChange, scrollContentSizeChange]));
  const memoRefreshControl = React.useMemo(() => refreshControl && /*#__PURE__*/React.cloneElement(refreshControl, {
    progressViewOffset,
    ...refreshControl.props
  }), [progressViewOffset, refreshControl]);
  const memoContentInset = React.useMemo(() => ({
    top: contentInset
  }), [contentInset]);
  const memoContentOffset = React.useMemo(() => ({
    x: 0,
    y: -contentInset
  }), [contentInset]);
  const memoContentContainerStyle = React.useMemo(() => [_contentContainerStyle, contentContainerStyle], [_contentContainerStyle, contentContainerStyle]);
  const memoStyle = React.useMemo(() => [_style, style], [_style, style]);
  return /*#__PURE__*/React.createElement(LegendListMemo, _extends({}, rest, {
    onLayout: onLayout,
    ref: ref,
    bouncesZoom: false,
    style: memoStyle,
    contentContainerStyle: memoContentContainerStyle,
    progressViewOffset: progressViewOffset,
    onScroll: scrollHandler,
    onContentSizeChange: scrollContentSizeChangeHandlers,
    scrollEventThrottle: 16,
    contentInset: memoContentInset,
    contentOffset: memoContentOffset,
    automaticallyAdjustContentInsets: false,
    refreshControl: memoRefreshControl
    // workaround for: https://github.com/software-mansion/react-native-reanimated/issues/2735
    ,
    onMomentumScrollEnd: () => {}
  }));
}

/**
 * Use like a regular LegendList from @legendapp/list.
 */
export const LegendList = /*#__PURE__*/React.forwardRef(LegendListImpl);
//# sourceMappingURL=LegendList.js.map