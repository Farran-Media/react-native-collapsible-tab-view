import type { LegendListProps as LLProps } from '@legendapp/list'
import React from 'react'
import Animated from 'react-native-reanimated'

import {
  useAfterMountEffect,
  useChainCallback,
  useCollapsibleStyle,
  useScrollHandlerY,
  useSharedAnimatedRef,
  useTabNameContext,
  useTabsContext,
  useUpdateScrollViewContentSize,
} from './hooks'

let AnimatedLegendList: React.ComponentClass<any> | null = null

const ensureLegendList = () => {
  if (AnimatedLegendList) {
    return
  }

  try {
    const legendListModule = require('@legendapp/list')
    AnimatedLegendList = Animated.createAnimatedComponent(
      legendListModule.LegendList
    ) as unknown as React.ComponentClass<any>
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
    return AnimatedLegendList ? (
      <AnimatedLegendList ref={passRef} {...props} />
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
  const { setRef } = useTabsContext()
  const ref = useSharedAnimatedRef<any>(passRef)

  const { scrollHandler, enable } = useScrollHandlerY(name)
  const onLayout = useAfterMountEffect(rest.onLayout, () => {
    'worklet'
    // we enable the scroll event after mounting
    // otherwise we get an `onScroll` call with the initial scroll position which can break things
    enable(true)
  })

  const {
    style: _style,
    contentContainerStyle: _contentContainerStyle,
    progressViewOffset,
  } = useCollapsibleStyle()

  React.useEffect(() => {
    setRef(name, ref)
  }, [name, ref, setRef])

  const scrollContentSizeChange = useUpdateScrollViewContentSize({
    name,
  })

  const scrollContentSizeChangeHandlers = useChainCallback(
    React.useMemo(
      () => [scrollContentSizeChange, onContentSizeChange],
      [onContentSizeChange, scrollContentSizeChange]
    )
  )

  const memoRefreshControl = React.useMemo(
    () =>
      refreshControl &&
      React.cloneElement(refreshControl, {
        progressViewOffset,
        ...refreshControl.props,
      }),
    [progressViewOffset, refreshControl]
  )

  const memoContentContainerStyle = React.useMemo(
    () => ({
      ..._contentContainerStyle,
      ...(contentContainerStyle as object),
    }),
    [_contentContainerStyle, contentContainerStyle]
  )
  const memoStyle = React.useMemo(() => [_style, style], [_style, style])

  return (
    <LegendListMemo
      {...rest}
      onLayout={onLayout}
      ref={ref}
      bouncesZoom={false}
      style={memoStyle}
      contentContainerStyle={memoContentContainerStyle}
      progressViewOffset={progressViewOffset}
      onScroll={scrollHandler}
      onContentSizeChange={scrollContentSizeChangeHandlers}
      scrollEventThrottle={16}
      automaticallyAdjustContentInsets={false}
      refreshControl={memoRefreshControl}
      // workaround for: https://github.com/software-mansion/react-native-reanimated/issues/2735
      onMomentumScrollEnd={() => {}}
    />
  )
}

/**
 * Use like a regular LegendList from @legendapp/list.
 * Note: Requires allowHeaderOverscroll on the Tabs.Container for iOS.
 */
export const LegendList = React.forwardRef(LegendListImpl) as <T>(
  p: Omit<LLProps<T>, 'onScroll'> & { ref?: React.Ref<any> }
) => React.ReactElement
