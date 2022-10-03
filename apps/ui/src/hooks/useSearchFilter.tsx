import { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'

export type UseSearchFilterReturnValue<T = object> = [
  handleSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  results: T[],
  searchInputRef: React.MutableRefObject<HTMLInputElement | undefined>,
]

/**
 * React hook that implements a basic debounced keyword search filter for arrays of objects.
 *
 * The given `items` are assumed to be a stable reference if the array's contents do not change.
 *
 * @param key values of this property will be searched for substring matches
 * @param items array of like objects that contain the property `key`
 * @returns returns a tuple containing: onChange handler, results array, ref to apply to input.
 */
export function useSearchFilter<T extends object>(key: keyof T, items: T[]): UseSearchFilterReturnValue<T> {
  const [results, setResults] = useState<T[]>(items)
  const searchInputRef = useRef<HTMLInputElement>()

  // stable debounce search filter function
  const debouncedSearch = useRef(
    debounce((term: string, items: T[], key: keyof T) => {
      if (term === '') {
        setResults(items)
      }

      setResults(items.filter((item) => String(item[key]).toLowerCase().includes(term.toLowerCase())))
    }, 250),
  ).current

  // handle case where items and/or key change
  useEffect(() => {
    setResults(items)

    if (searchInputRef.current) {
      debouncedSearch(searchInputRef.current.value, items, key)
    }
  }, [items, key, debouncedSearch])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    debouncedSearch(event.target.value, items, key)
  }

  return [handleSearchInputChange, results, searchInputRef]
}
