import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useAsyncFn } from 'react-use'

import { signIn } from '../api/auth'
import { useIsMountedRef } from '../hooks/useIsMountedRef'

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
  const isMountedRef = useIsMountedRef()
  const { push: routerPush } = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>()

  const handleSignIn: SubmitHandler<SignInFormInputs> = useCallback(
    async ({ email, password }) => {
      if (!isMountedRef.current) {
        return
      }

      try {
        await signIn(email, password)

        if (typeof onSignIn === 'function') {
          await onSignIn()
        }

        routerPush(signInRedirectPath)
      } catch (error: unknown) {
        console.error((error && error instanceof Error && error.message) || String(error))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isMountedRef is a ref (eslint false positive)
    [routerPush, signInRedirectPath],
  )

  const [{ loading }, submit] = useAsyncFn(handleSignIn) // @todo if redirecting should maybe do in effect... or refactor for onSignIn

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
          <input type="submit" className="py-2 px-4 bg-slate-300 border-slate-400 rounded-md" />
        </div>
      </div>
    </form>
  )
}

SignInForm.defaultProps = {
  signInRedirectPath: SIGN_IN_REDIRECT_PATH,
}
