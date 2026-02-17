import type { LegendListProps as LLProps } from '@legendapp/list';
import React from 'react';
/**
 * Use like a regular LegendList from @legendapp/list.
 * Note: Requires allowHeaderOverscroll on the Tabs.Container for iOS.
 */
export declare const LegendList: <T>(p: Omit<LLProps<T>, 'onScroll'> & {
    ref?: React.Ref<any>;
}) => React.ReactElement;
