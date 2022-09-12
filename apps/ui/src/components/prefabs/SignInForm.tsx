import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'

import { DEFAULT_AUTHENTICATED_ROUTE } from '../../pages/_app'
import { useAuthSignIn } from '../../api/auth'
import { useIsMounted } from '../../hooks/useIsMounted'
import { FormButton } from '../elements/forms/FormButton'
import { FormInput } from '../elements/forms/FormInput'
import { getValidatedPathUri } from '../../lib/uri/paths'
import { getQueryStringValue } from '../../lib/uri/query'

export interface SignInFormInputs {
  email: string
  password: string
}

export interface SignInFormProps {
  signInRedirectPath?: string
  onSignIn?: () => unknown
}

const LABELS = {
  EMAIL_ADDRESS: 'Email Address',
  PASSWORD: 'Password',
  SIGN_IN: 'Sign In',
}

export const SignInForm: React.FC<SignInFormProps> = ({ signInRedirectPath, onSignIn }) => {
  const isMounted = useIsMounted()
  const { push: routerPush, query: routerQuery } = useRouter()

  const { signIn, isSuccess } = useAuthSignIn() // @todo add error to sign in (add user feedback)

  const form = useForm<SignInFormInputs>()
  const { handleSubmit } = form

  const redirectPath =
    signInRedirectPath ?? getValidatedPathUri(getQueryStringValue(routerQuery?.redirect)) ?? DEFAULT_AUTHENTICATED_ROUTE

  useEffect(() => {
    if (isSuccess) {
      if (!isMounted()) {
        return
      }

      if (typeof onSignIn === 'function') {
        onSignIn()
      }

      routerPush(redirectPath)
    }
  }, [isSuccess, isMounted, routerPush, onSignIn, redirectPath])

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
            label={LABELS.EMAIL_ADDRESS}
            placeholder={LABELS.EMAIL_ADDRESS}
            hideLabel
            validationOptions={{ required: true, pattern: /.+@.+/ }}
          />

          <FormInput
            type="password"
            name="password"
            label={LABELS.PASSWORD}
            placeholder={LABELS.PASSWORD}
            hideLabel
            validationOptions={{ required: true }}
          />

          <FormButton type="submit">{LABELS.SIGN_IN}</FormButton>
        </div>
      </form>
    </FormProvider>
  )
}
