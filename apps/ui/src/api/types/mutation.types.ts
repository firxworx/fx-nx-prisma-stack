export type ApiMutationProps =
  | 'mutate'
  | 'mutateAsync'
  | 'error'
  | 'reset'
  | 'isLoading'
  | 'isSuccess'
  | 'isError'
  | 'data'

export type ApiDeletionProps = Exclude<'data', ApiMutationProps>

export interface ApiMutation {
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}
