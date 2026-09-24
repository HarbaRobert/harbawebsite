import { useEffect, useLayoutEffect } from 'react'

// useLayoutEffect fires before paint, avoiding a visible flash of the
// previous page's scroll position on route change - but it warns when it
// runs during server-side rendering, where there is no paint to fire
// before. Node never defines `window`, and that never changes within a
// given process, so picking the hook once at module load is safe.
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
