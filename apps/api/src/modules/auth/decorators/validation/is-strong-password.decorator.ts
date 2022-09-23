import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

export const MESSAGES = {
  ERROR_PASSWORD_VALIDATION:
    'Password length must be 8-128 characters long and must include at least a lowercase letter, an uppercase letter, and a digit.',
}

/**
 * Strong password DTO validator that implements a `IsStrongPassword()` decorator for DTO classes that leverage
 * the class-validator library.
 *
 * Acknowledgement: adapted from MIT-license code by @mattlehrer (<https://github.com/mattlehrer/nest-starter-pg-auth>)
 */
@ValidatorConstraint({ name: 'strongPassword', async: false })
export class StrongPassword implements ValidatorConstraintInterface {
  /**
   * Return a boolean indicating if the given input is a string of 8-128 length inclusive that includes
   * at least 1x lowercase, 1x uppercase, and 1x digit characters.
   *
   * This method is invoked by the `IsStrongPassword()` decorator.
   */
  validate(password: unknown): boolean {
    return (
      typeof password === 'string' &&
      password.length >= 8 &&
      password.length <= 128 &&
      !!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    )
  }

  defaultMessage(): string {
    return MESSAGES.ERROR_PASSWORD_VALIDATION
  }
}

/**
 * Validation decorator for DTO property values that enforces: a string of length 8-128 inclusive that includes
 * at least 1x lowercase, 1x uppercase, and 1x digit characters.
 */
export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): (object: unknown, propertyName: string) => void {
  return function (object: InstanceType<new (...args: unknown[]) => unknown>, propertyName: string): void {
    if (!(object instanceof Object)) {
      throw new Error(
        'IsStrongPassword validation decorator can only be applied to class properties (e.g. DTO classes).',
      )
    }

    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: StrongPassword,
    })
  }
}
