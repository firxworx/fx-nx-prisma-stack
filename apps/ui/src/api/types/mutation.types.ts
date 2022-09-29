export type ApiMutationProps =
  | 'mutate'
  | 'mutateAsync'
  | 'error'
  | 'reset'
  | 'isLoading'
  | 'isSuccess'
  | 'isError'
  | 'data'

export type ApiDeleteHookProps = Exclude<ApiMutationProps, 'data'>

export interface ApiMutation {
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}
