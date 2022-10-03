import { useCallback, useEffect, useRef, useState } from 'react'

export type SearchFilterHookReturnValue<T = object> = [
  search: string,
  results: T[],
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
]

/**
 * @todo useSearchFilter input debounce
 * @todo consider adding sort capabilities within hook
 */
export function useSearchFilter<T extends object>(key: keyof T, items: T[]): SearchFilterHookReturnValue<T> {
  const isMountedRef = useRef<boolean>(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<T[]>(items)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  // reset results if value of items changes
  useEffect(() => {
    if (isMountedRef.current) {
      setResults(items)
    }
  }, [items])

  const handleSearchInputChange = useCallback(
    function (event: React.ChangeEvent<HTMLInputElement>): void {
      if (!isMountedRef.current) {
        return
      }

      const value = event.target.value
      setSearchTerm(value)

      if (value.length === 0) {
        setResults(items)
        return
      }

      setResults(items.filter((item) => String(item[key]).toLowerCase().includes(value.toLowerCase())))
    },
    [items, key],
  )

  return [searchTerm, results, handleSearchInputChange]
}
