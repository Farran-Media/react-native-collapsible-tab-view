import type { LegendListProps, LegendListRef } from '@legendapp/list'
import React from 'react'

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

type LegendListMemoProps = LegendListProps<unknown> & {
  ref?: React.Ref<LegendListRef>
}

let CachedAnimatedLegendList: React.ComponentType<any> | null = null

const ensureLegendList = () => {
  if (CachedAnimatedLegendList) {
    return
  }

  try {
    const legendListModule = require('@legendapp/list/reanimated')
    CachedAnimatedLegendList = legendListModule.AnimatedLegendList
  } catch {
    console.error(
      'The optional dependency @legendapp/list is not installed. Please install it to use the LegendList component.'
    )
  }
}

const LegendListMemo = React.memo(
  React.forwardRef<LegendListRef, LegendListMemoProps>((props, passRef) => {
    ensureLegendList()
    return CachedAnimatedLegendList ? (
      <CachedAnimatedLegendList ref={passRef} {...props} />
    ) : (
      <></>
    )
  })
)

function LegendListImpl<R>(
  {
    style,
    onContentSizeChange,
    refreshControl,
    contentContainerStyle: _contentContainerStyle,
    ...rest
  }: Omit<LegendListProps<R>, 'onScroll'>,
  passRef: React.Ref<LegendListRef>
) {
  const name = useTabNameContext()
  const { setRef } = useTabsContext()
  const ref = useSharedAnimatedRef<any>(passRef)

  const { scrollHandler, enable } = useScrollHandlerY(name)
  const onLayout = useAfterMountEffect(rest.onLayout, () => {
    'worklet'
    enable(true)
  })

  const {
    style: _style,
    contentContainerStyle,
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
      paddingTop: contentContainerStyle.paddingTop,
      ...(typeof _contentContainerStyle === 'object'
        ? _contentContainerStyle
        : {}),
    }),
    [_contentContainerStyle, contentContainerStyle.paddingTop]
  )

  const memoStyle = React.useMemo(() => [_style, style], [_style, style])

  return (
    // @ts-expect-error generic R vs unknown mismatch in discriminated union props
    <LegendListMemo
      {...rest}
      onLayout={onLayout}
      ref={ref}
      bouncesZoom={false}
      style={memoStyle}
      contentContainerStyle={memoContentContainerStyle}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      refreshControl={memoRefreshControl}
      progressViewOffset={progressViewOffset}
      automaticallyAdjustContentInsets={false}
      onContentSizeChange={scrollContentSizeChangeHandlers}
    />
  )
}

/**
 * Use like a regular LegendList.
 */
export const LegendList = React.forwardRef(LegendListImpl) as <T>(
  p: Omit<LegendListProps<T>, 'onScroll'> & {
    ref?: React.Ref<LegendListRef>
  }
) => React.ReactElement
