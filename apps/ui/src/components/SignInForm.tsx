import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { useAuthSignIn } from '../api/auth'
import { useIsMounted } from '../hooks/useIsMounted'

const DEAFULT_SIGN_IN_REDIRECT_PATH = '/app'

export interface SignInFormInputs {
  email: string
  password: string
}

export interface SignInFormProps {
  signInRedirectPath?: string
  onSignIn?: () => unknown
}

export const SignInForm: React.FC<SignInFormProps> = ({ signInRedirectPath, onSignIn }) => {
  const isMounted = useIsMounted()
  const { push: routerPush } = useRouter()

  const { signIn, isLoading, isSuccess } = useAuthSignIn() // @todo add error to sign in (add user feedback)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormInputs>()

  useEffect(() => {
    if (isSuccess) {
      if (typeof onSignIn === 'function') {
        onSignIn()
      }

      if (isMounted()) {
        routerPush(signInRedirectPath ?? DEAFULT_SIGN_IN_REDIRECT_PATH)
      }
    }
  }, [isSuccess, isMounted, routerPush, onSignIn, signInRedirectPath])

  const handleSignInSubmit: SubmitHandler<SignInFormInputs> = useCallback(
    async ({ email, password }) => {
      if (!isMounted()) {
        return
      }

      await signIn({ email, password })
    },
    [signIn, isMounted],
  )

  return (
    <form onSubmit={handleSubmit(handleSignInSubmit)}>
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

        {isLoading && <div>Loading...</div>}

        <div>
          <input type="submit" className="py-2 px-4 bg-sky-700 text-white rounded-md" />
        </div>
      </div>
    </form>
  )
}

SignInForm.defaultProps = {
  signInRedirectPath: DEAFULT_SIGN_IN_REDIRECT_PATH,
}
