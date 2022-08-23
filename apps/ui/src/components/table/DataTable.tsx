import { Cell, ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from '@tanstack/react-table'
import clsx from 'clsx'
import { debounce } from 'lodash'
import React, { ChangeEvent, useMemo, useState } from 'react'
import { FormInput } from '../forms/FormInput'

interface DataTableProps {
  namespace: string // kf
  data: any[] // @todo @temp stronger types
  columns: ColumnDef<any>[] // @todo @temp stronger types - remove the any / make generic
  isFetching?: boolean
  skeletonCount?: number
  skeletonHeight?: number
  headerComponent?: JSX.Element
  pageCount?: number
  page?: (page: number) => void
  search?: (search: string) => void
  onClickRow?: (cell: Cell<any, unknown>, row: Row<any>) => void
  searchLabel?: string
}

export const DataTable: React.FC<DataTableProps> = React.memo(
  ({
    namespace,
    data,
    columns,
    isFetching,
    skeletonCount = 10,
    skeletonHeight = 28,
    headerComponent,
    pageCount,
    search,
    onClickRow,
    page,
    searchLabel = 'Search',
  }) => {
    const [paginationPage, setPaginationPage] = useState(1)

    const memoizedData = useMemo(() => data, [data])
    const memoizedColumns = useMemo(() => columns, [columns])
    const memoisedHeaderComponent = useMemo(() => headerComponent, [headerComponent])

    const { getHeaderGroups, getRowModel, getAllColumns } = useReactTable({
      data: memoizedData,
      columns: memoizedColumns,
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
      pageCount,
    })

    const skeletons = Array.from({ length: skeletonCount }, (x, i) => i)

    const columnCount = getAllColumns().length

    const noDataFound = !isFetching && (!memoizedData || memoizedData.length === 0)

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      search && search(event.target.value)
    }

    const handlePageChange = (event: ChangeEvent<unknown>, currentPage: number) => {
      setPaginationPage(currentPage === 0 ? 1 : currentPage)
      page?.(currentPage === 0 ? 1 : currentPage)
    }

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
        <div className="overflow-x-auto">
          <table>
            {!isFetching && (
              <thead>
                {getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} scope="col">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
            )}
            <tbody>
              {!isFetching ? (
                getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td onClick={() => onClickRow?.(cell, row)} key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <>
                  {skeletons.map((skeleton) => (
                    <tr key={skeleton}>
                      {Array.from({ length: columnCount }, (_x, i) => i).map((elm) => (
                        <td key={elm}>
                          <div className="bg-slate=100 animate-pulse" style={{ height: `${skeletonHeight}rem` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        {noDataFound && <div className="flex items-center justify-center my-2">No Data Found</div>}
        {pageCount &&
          page &&
          // <StyledPagination count={pageCount} page={paginationPage} onChange={handlePageChange} color="primary" />
          null}
      </div>
    )
  },
)
