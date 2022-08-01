import type { NextPage } from 'next'

const CustomError500Page: NextPage = (_props) => {
  return (
    <div className="p-8 rounded-md bg-red-300">
      <h1>500</h1>
    </div>
  )
}

export default CustomError500Page
