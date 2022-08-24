export interface SkeletonLoaderRows {
  /** number of rows (defaults to 5 if not specified) */
  numRows?: number

  /** number of columns (@see getAllColumns() if using react-table) */
  numCols: number

  /** height of skeleton placeholder cell content in rem */
  rowHeightInRem?: number
}

export const SkeletonLoaderRows: React.FC<SkeletonLoaderRows> = ({ numRows = 5, numCols, rowHeightInRem = 28 }) => {
  const skeletons = Array.from({ length: numRows }, (_x, i) => i)

  return (
    <>
      {skeletons.map((skeleton) => (
        <tr key={skeleton}>
          {Array.from({ length: numCols }, (_x, i) => i).map((i) => (
            <td key={i}>
              <div className="bg-slate-100 animate-pulse" style={{ height: `${rowHeightInRem}rem` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
