import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'

import { useAuthSignIn } from '../../api/auth'
import { useIsMounted } from '../../hooks/useIsMounted'
import { FormButton } from '../elements/forms/FormButton'
import { FormInput } from '../elements/forms/FormInput'

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
  const { handleSubmit } = form

  useEffect(() => {
    if (isSuccess) {
      if (!isMounted()) {
        return
      }

      if (typeof onSignIn === 'function') {
        onSignIn()
      }

      routerPush(signInRedirectPath ?? DEFAULT_SIGN_IN_REDIRECT_PATH)
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
        <div className="space-y-4">
          <FormInput
            name="email"
            label="Email Address"
            placeholder="Email Address"
            hideLabel
            validationOptions={{ required: true, pattern: /.+@.+/ }}
          />

          <FormInput
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            hideLabel
            validationOptions={{ required: true }}
          />

          <FormButton type="submit">Sign In</FormButton>
        </div>
      </form>
    </FormProvider>
  )
}

SignInForm.defaultProps = {
  signInRedirectPath: DEFAULT_SIGN_IN_REDIRECT_PATH,
}
