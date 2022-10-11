import { FormProvider, useForm } from 'react-hook-form'

interface TestFormValues {
  dummy: string
}

/**
 * Test Form component that wraps children in a react-hook-form `FormProvider`.
 */
export const TestForm: React.FC<React.PropsWithChildren> = ({ children }) => {
  const form = useForm<TestFormValues>({
    defaultValues: { dummy: '' },
  })

  return <FormProvider {...form}>{children}</FormProvider>
}
