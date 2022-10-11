import React from 'react'

export interface FormContainerProps {}

/**
 * Responsive container for forms that sets a max width, centers the form, and adds consistent vertical spacing
 * to its children.
 */
export const FormContainer: React.FC<React.PropsWithChildren<FormContainerProps>> = ({ children }) => {
  return <div className="w-full sm:w-4/6 mx-auto space-y-4">{children}</div>
}
