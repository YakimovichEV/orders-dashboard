import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 100 },
      }
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second', delay: 100 });
    expect(result.current).toBe('first');

    await waitFor(
      () => {
        expect(result.current).toBe('second');
      },
      { timeout: 200 }
    );
  });

  it('works with different values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      {
        initialProps: { value: 0 },
      }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42 });

    await waitFor(
      () => {
        expect(result.current).toBe(42);
      },
      { timeout: 200 }
    );
  });
});
