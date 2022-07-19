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
  onSignInRedirectPath?: string
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSignInRedirectPath }) => {
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
        routerPush(onSignInRedirectPath)
      } catch (error: unknown) {
        console.error((error && error instanceof Error && error.message) || String(error))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isMountedRef is a ref (eslint false positive)
    [routerPush, onSignInRedirectPath],
  )

  const [{ loading }, submit] = useAsyncFn(handleSignIn) // if redirecting should prob do it in an effect, no?

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
          <input type="submit" className="py-2 px-4 bg-slate-500 rounded-md" />
        </div>
      </div>
    </form>
  )
}

SignInForm.defaultProps = {
  onSignInRedirectPath: SIGN_IN_REDIRECT_PATH,
}
