import React, { ChangeEvent, useMemo } from 'react'
import { Cell, ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table'
import { debounce } from 'lodash'

import { FormInput } from '../forms/FormInput'
import { SkeletonLoaderRows } from './skeletons/SkeletonLoaderRows'

// type PrimitiveType = string | Symbol | number | boolean

type IdentifierType = string | number

type BaseRowData<T extends IdentifierType> = T extends string
  ? { uuid: string }
  : T extends number
  ? { id: number }
  : never

// type DataTableHeaders<T extends BaseRowData<IdentifierType>> = Record<keyof T, string>
// type CustomRenderers<T extends BaseRowData<IdentifierType>> = Partial<Record<keyof T, (it: T) => React.ReactNode>>

// @see https://github.com/TanStack/table/issues/4241
// if `columns` isn't typed w/ `ColumnDef`

interface DataTableProps<T extends BaseRowData<IdentifierType>> {
  namespace: string // kf

  data: T[]
  columns: ColumnDef<T>[] // ColumnDef<T>[]
  // headers: DataTableHeaders<T>
  // customRenderers?: CustomRenderers<T>

  isFetching?: boolean
  skeletonLoader?: {
    numRows?: number
    cellHeightInRem?: number
  }
  headerComponent?: JSX.Element
  pageCount?: number
  page?: (page: number) => void
  search?: (search: string) => void
  onRowClick?: (cell: Cell<T, unknown>, row: Row<T>) => void // @todo take note during upcoming/roadmap table pass
  searchLabel?: string
}

// wrapper of React memo() provides more convenient type preservation w/ generics
const typedMemo: <T>(c: T) => T = React.memo

/**
 * Reusable data table component implemented with the react-table library.
 *
 * Note the function syntax (vs. arrow function) is used for typing purposes when used alongside
 * React.memo via `typedMemo()` above.
 *
 * Note issue below with `ColumnDef` typing:
 *
 * @see {@link https://github.com/TanStack/table/issues/4241}
 */
export const DataTableComponent = function <T extends BaseRowData<IdentifierType>>({
  namespace,
  data,
  columns,
  isFetching,
  skeletonLoader,
  headerComponent,
  pageCount,
  search,
  onRowClick,
  page,
  searchLabel = 'Search',
}: DataTableProps<T>): JSX.Element {
  // const [paginationPage, setPaginationPage] = useState(1)

  const memoizedData = useMemo(() => data, [data])
  const memoizedColumns = useMemo(() => columns, [columns])
  const memoisedHeaderComponent = useMemo(() => headerComponent, [headerComponent])

  const { getHeaderGroups, getRowModel, getAllColumns } = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    debugTable: process.env.NODE_ENV === 'development',
    debugHeaders: process.env.NODE_ENV === 'development',
    debugColumns: process.env.NODE_ENV === 'development',
  })

  const columnCount = getAllColumns().length

  const noDataFound = !isFetching && (!memoizedData || memoizedData.length === 0)

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    search && search(event.target.value)
  }

  // const handlePageChange = (event: ChangeEvent<unknown>, currentPage: number) => {
  //   setPaginationPage(currentPage === 0 ? 1 : currentPage)
  //   page?.(currentPage === 0 ? 1 : currentPage)
  // }

  return (
    <div>
      <div className="p-4">
        {memoisedHeaderComponent && <div className="p-4">{memoisedHeaderComponent}</div>}
        {search && (
          <FormInput
            name={`${namespace}-table-search`}
            onChange={debounce(handleSearchChange, 1000)}
            label={searchLabel}
          />
        )}
      </div>
      <div className="overflow-x-auto min-w-full ring-1 sm:rounded-md ring-slate-300">
        <table className="w-full divide-y divide-slate-300">
          {/*table-fixed // @todo implement prop for user to set table-layout preference */}
          {!isFetching && (
            <thead className="text-sm text-left bg-slate-50 text-slate-700">
              {getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} scope="col" className="px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {/* @todo add sort feature w/ sort up/down icon pips here */}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          )}
          <tbody className="bg-white divide-y divide-slate-300">
            {isFetching && skeletonLoader && (
              <SkeletonLoaderRows numRows={skeletonLoader?.numRows} numCols={columnCount} rowHeightInRem={28} />
            )}
            {!isFetching &&
              getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      onClick={(): void => onRowClick?.(cell, row)}
                      key={cell.id}
                      className="px-3 py-3 text-sm leading-4 break-words"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {noDataFound && <div className="flex items-center justify-center my-2">No Data Found</div>}
      {pageCount &&
        page &&
        // <Pagination count={pageCount} page={paginationPage} onChange={handlePageChange} />
        null}
    </div>
  )
}

export const DataTable = typedMemo(DataTableComponent)
