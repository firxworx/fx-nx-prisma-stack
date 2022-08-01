import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'

import { useAuthSignIn } from '../api/auth'
import { useIsMounted } from '../hooks/useIsMounted'
import { FormButton } from './forms/FormButton'

const DEFAULT_SIGN_IN_REDIRECT_PATH = '/app'

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

  const { signIn, isSuccess } = useAuthSignIn() // @todo add error to sign in (add user feedback)

  const form = useForm<SignInFormInputs>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  useEffect(() => {
    if (isSuccess) {
      if (typeof onSignIn === 'function') {
        onSignIn()
      }

      if (isMounted()) {
        routerPush(signInRedirectPath ?? DEFAULT_SIGN_IN_REDIRECT_PATH)
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
    <FormProvider {...form}>
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

          <div>
            <FormButton type="submit">Sign In</FormButton>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

SignInForm.defaultProps = {
  signInRedirectPath: DEFAULT_SIGN_IN_REDIRECT_PATH,
}
