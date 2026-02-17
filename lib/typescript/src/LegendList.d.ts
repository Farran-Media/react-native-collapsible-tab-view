import type { LegendListProps as LLProps } from '@legendapp/list';
import React from 'react';
/**
 * Use like a regular LegendList from @legendapp/list.
 */
export declare const LegendList: <T>(p: Omit<LLProps<T>, 'onScroll'> & {
    ref?: React.Ref<any>;
}) => React.ReactElement;
