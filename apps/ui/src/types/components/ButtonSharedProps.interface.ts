/**
 * Common base button props for different types of buttons in this project's UI.
 */
export interface ButtonSharedProps {
  /**
   * Button styles for different UX cases. Default variant is solid.
   */
  variant?: 'solid' | 'outline' | 'transparent'

  /**
   * Border style. Default 'standard' has a >1px border.
   */
  border?: 'standard' | 'thin'

  /**
   * Control if the button click/submit behavior is disabled or not.
   */
  disabled?: boolean

  /**
   * Append additional css class names after the component's own className for positioning and additional
   * customization. This prop can be useful for setting margins/spacing classNames.
   */
  appendClassName?: string

  /**
   * Conditionally render the button in a loading/submitting state with the button disabled and an animated spinner
   * inside the button, prepended to the left of the button's children.
   *
   * This prop/feature may be used in place of setting `disabled` and implementing conditional child
   * content during a loading state.
   */
  isLoading?: boolean

  /**
   * Conditionally render the button in a submitting/loading state with the button disabled and an animated spinner
   * inside the button, prepended to the left of the button's children.
   *
   * This prop/feature may be used in place of setting `disabled` and implementing conditional child
   * content during a loading state.
   *
   * This prop/feature is not available for `FormButton`'s as integrated with react-hook-form because this state
   * value is obtained from the form library.
   */
  isSubmitting?: boolean
}
