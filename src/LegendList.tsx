import type { LegendListProps as LLProps } from '@legendapp/list'
import React, { useCallback, useMemo } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import {
  Extrapolation,
  interpolate,
  runOnUI,
  useAnimatedRef,
} from 'react-native-reanimated'

import { IS_IOS } from './helpers'
import {
  useAfterMountEffect,
  useChainCallback,
  useScrollHandlerY,
  useTabNameContext,
  useTabsContext,
  useUpdateScrollViewContentSize,
} from './hooks'

let RawLegendList: React.ComponentType<any> | null = null

const ensureLegendList = () => {
  if (RawLegendList) return
  try {
    const legendListModule = require('@legendapp/list')
    RawLegendList = legendListModule.LegendList
  } catch {
    console.error(
      'The optional dependency @legendapp/list is not installed. Please install it to use the LegendList component.'
    )
  }
}

/**
 * Used as a memo to prevent rerendering too often when the context changes.
 * See: https://github.com/facebook/react/issues/15156#issuecomment-474590693
 */
const LegendListMemo = React.memo(
  React.forwardRef<any, React.PropsWithChildren<any>>((props, passRef) => {
    ensureLegendList()
    return RawLegendList ? (
      <RawLegendList ref={passRef} {...props} />
    ) : (
      <></>
    )
  })
)

function LegendListImpl<R>(
  {
    contentContainerStyle,
    style,
    onContentSizeChange,
    refreshControl,
    ...rest
  }: Omit<LLProps<R>, 'onScroll'>,
  passRef: React.Ref<any>
): React.ReactElement {
  const name = useTabNameContext()
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
    allowHeaderOverscroll,
  } = useTabsContext()

  // AnimatedRef to LegendList's internal ScrollView (via refScrollView prop)
  // so scrollToImpl can sync scroll positions across tabs
  const scrollViewRef = useAnimatedRef<any>()

  // useScrollHandlerY for its sync-unfocused-scenes reaction and enable callback.
  // We don't use its scrollHandler since LegendList has its own internal ScrollView.
  const { enable } = useScrollHandlerY(name)

  const onLayout = useAfterMountEffect(rest.onLayout, () => {
    'worklet'
    enable(true)
  })

  // LegendList doesn't support iOS contentInset, so we ALWAYS use paddingTop
  // to position content below the header, regardless of allowHeaderOverscroll.
  const containerHeightWithMinHeader = Math.max(
    0,
    (containerHeight ?? 0) - minHeaderHeight
  )
  const _contentContainerStyle = useMemo(
    () => ({
      minHeight: containerHeightWithMinHeader + (headerHeight || 0),
      paddingTop: (headerHeight || 0) + (tabBarHeight || 0),
    }),
    [containerHeightWithMinHeader, headerHeight, tabBarHeight]
  )
  const progressViewOffset =
    IS_IOS && allowHeaderOverscroll
      ? 0
      : (headerHeight || 0) + (tabBarHeight || 0)

  // Register the internal ScrollView ref (not the LegendList ref) in the refMap
  React.useEffect(() => {
    setRef(name, scrollViewRef)
  }, [name, scrollViewRef, setRef])

  const scrollContentSizeChange = useUpdateScrollViewContentSize({ name })
  const scrollContentSizeChangeHandlers = useChainCallback(
    useMemo(
      () => [scrollContentSizeChange, onContentSizeChange],
      [onContentSizeChange, scrollContentSizeChange]
    )
  )

  const memoRefreshControl = useMemo(
    () =>
      refreshControl &&
      React.cloneElement(refreshControl, {
        progressViewOffset,
        ...refreshControl.props,
      }),
    [progressViewOffset, refreshControl]
  )

  const memoContentContainerStyle = useMemo(
    () => ({
      ..._contentContainerStyle,
      ...(contentContainerStyle as object),
    }),
    [_contentContainerStyle, contentContainerStyle]
  )

  const memoStyle = useMemo(
    () => [{ width }, style],
    [width, style]
  )

  // JS-level scroll handler — updates shared values via runOnUI.
  // No contentInset adjustment needed since LegendList uses paddingTop instead.
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawY = event.nativeEvent.contentOffset.y
      runOnUI(
        (
          y: number,
          _name: string,
          _containerHeight: number,
          _allowHeaderOverscroll: boolean | undefined,
          _revealHeaderOnScroll: boolean
        ) => {
          'worklet'
          if (focusedTab.value !== _name) return

          if (IS_IOS) {
            const contentHeight =
              contentHeights.value[tabNames.value.indexOf(_name)] ||
              Number.MAX_VALUE
            const clampMax = contentHeight - (_containerHeight || 0)
            scrollYCurrent.value = _allowHeaderOverscroll
              ? y
              : interpolate(
                  y,
                  [0, clampMax],
                  [0, clampMax],
                  Extrapolation.CLAMP
                )
          } else {
            scrollYCurrent.value = y
          }

          scrollY.value[_name] = scrollYCurrent.value
          oldAccScrollY.value = accScrollY.value
          accScrollY.value = scrollY.value[_name] + offset.value

          if (_revealHeaderOnScroll) {
            const delta = accScrollY.value - oldAccScrollY.value
            const nextValue = accDiffClamp.value + delta
            if (delta > 0) {
              accDiffClamp.value = Math.min(
                headerScrollDistance.value,
                nextValue
              )
            } else if (delta < 0) {
              accDiffClamp.value = Math.max(0, nextValue)
            }
          }
        }
      )(rawY, name, containerHeight, allowHeaderOverscroll, revealHeaderOnScroll)
    },
    [
      name,
      focusedTab,
      contentHeights,
      tabNames,
      containerHeight,
      scrollYCurrent,
      scrollY,
      oldAccScrollY,
      accScrollY,
      offset,
      allowHeaderOverscroll,
      revealHeaderOnScroll,
      accDiffClamp,
      headerScrollDistance,
    ]
  )

  return (
    <LegendListMemo
      {...rest}
      onLayout={onLayout}
      ref={passRef}
      refScrollView={scrollViewRef}
      bouncesZoom={false}
      style={memoStyle}
      contentContainerStyle={memoContentContainerStyle}
      progressViewOffset={progressViewOffset}
      onScroll={onScroll}
      onContentSizeChange={scrollContentSizeChangeHandlers}
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets={false}
      refreshControl={memoRefreshControl}
      onMomentumScrollEnd={() => {}}
    />
  )
}

/**
 * Use like a regular LegendList from @legendapp/list.
 */
export const LegendList = React.forwardRef(LegendListImpl) as <T>(
  p: Omit<LLProps<T>, 'onScroll'> & { ref?: React.Ref<any> }
) => React.ReactElement
