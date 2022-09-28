import React from 'react'

/**
 * Responsive container for forms that sets a max width + centers the form for smaller viewports,
 * plus adds vertical spacing to its children.
 */
export const FormContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="w-full sm:w-4/6 mx-auto space-y-4">{children}</div>
}
