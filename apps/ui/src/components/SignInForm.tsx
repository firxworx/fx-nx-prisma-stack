import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useAsyncFn } from 'react-use'

import { signIn } from '../api/auth'
import { useSession } from '../context/SessionContextProvider'
import { useIsMounted } from '../hooks/useIsMounted'

const SIGN_IN_REDIRECT_PATH = '/app'

export interface SignInFormInputs {
  email: string
  password: string
}

export interface SignInFormProps {
  signInRedirectPath?: string
  onSignIn?: () => Promise<unknown>
}

export const SignInForm: React.FC<SignInFormProps> = ({ signInRedirectPath, onSignIn }) => {
  const isMounted = useIsMounted()
  const { push: routerPush } = useRouter()
  const session = useSession()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>()

  const handleSignIn: SubmitHandler<SignInFormInputs> = useCallback(
    async ({ email, password }) => {
      if (!isMounted()) {
        return
      }

      try {
        await signIn(email, password)

        if (typeof onSignIn === 'function') {
          await onSignIn()
        }

        // session.clear()
        await session.refetch()

        routerPush(signInRedirectPath)
      } catch (error: unknown) {
        console.error((error && error instanceof Error && error.message) || String(error))
      }
    },
    [routerPush, signInRedirectPath, onSignIn, session, isMounted],
  )

  // @todo if redirecting should maybe do in effect... or refactor for onSignIn + to implement w/ a react-query mutation
  const [{ loading }, submit] = useAsyncFn(handleSignIn)

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="space-y-4 p-4 mt-4">
        <div>
          <input type="text" {...register('email', { required: true, pattern: /.+@.+/ })} />
          {errors.email?.type === 'required' && <span>This field is required</span>}
          {errors.email?.type === 'pattern' && <span>Valid email required</span>}
        </div>

        <div>
          <input type="password" {...register('password', { required: true })} />
          {errors.password && <span>This field is required</span>}
        </div>

        {loading && <div>Loading...</div>}

        <div>
          <input type="submit" className="py-2 px-4 bg-sky-700 text-white rounded-md" />
        </div>
      </div>
    </form>
  )
}

SignInForm.defaultProps = {
  signInRedirectPath: SIGN_IN_REDIRECT_PATH,
}
