import type { RegisterOptions } from 'react-hook-form'

/**
 * Common props of "element" `Form*`-name-prefixed components integrated with react-hook-form.
 * The term "element" in this context refers to basic inputs: text inputs, textarea, etc. vs. "rich" form components.
 */
export interface FormElementCommonProps {
  /**
   * Name of form element. This name will be used to register the input with the underlying react-hook-form.
   */
  name: string

  /**
   * Input label. This value is also used for a11y including in the case where the `hideLabel` prop is set.
   */
  label: string

  /**
   * Small helper text that renders below the input to provide additional information to the user.
   */
  helperText?: string

  /**
   * Disable this input and show its defaultValue (as may be set via react-hook-form).
   */
  readOnly?: boolean

  /**
   * Disable display of the input's label. The `label` value is used for a11y and will still be presented to
   * screen-readers even if this prop value is `true`.
   */
  hideLabel?: boolean

  /**
   * Disable display of error (can be useful if a parent component handles error display).
   * This prop does not disable error validation.
   */
  hideErrorMessage?: boolean

  /**
   * Manual validation options to pass to react-hook-form as `RegisterOptions`.
   * Alternative validation e.g. leveraging zod or yup resolver is encouraged instead.
   */
  validationOptions?: RegisterOptions

  /**
   * Append className to the component's parent element. Useful for adding margins, flex/grid child behavior, etc.
   *
   * This prop provides a helpful convenience that requires devs to be careful to avoid conflicts with any existing
   * styles. There should not be any issues if this prop is used as intended (e.g. margins, flex/grid child behavior)
   * vs. overrides to the look-and-feel.
   */
  appendClassName?: string
}
