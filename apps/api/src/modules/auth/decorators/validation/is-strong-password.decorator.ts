import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

export const MESSAGES = {
  ERROR_PASSWORD_VALIDATION:
    'Password must be between 8-128 characters long and include at least a lowercase letter, an uppercase letter, and a digit.',
}

/**
 * Strong password DTO validator that implements a `IsStrongPassword()` decorator for DTO classes that leverage
 * the class-validator library.
 *
 * Credit: @mattlehrer on GitHub (<https://github.com/mattlehrer/nest-starter-pg-auth>)
 */
@ValidatorConstraint({ name: 'strongPassword', async: false })
export class StrongPassword implements ValidatorConstraintInterface {
  /**
   * Return a boolean indicating if the given password input is a string within the required length
   * range and has at least one lowercase character, one uppercase character, and a digit.
   *
   * This method is called by the `IsStrongPassword()` decorator.
   */
  validate(password: string): boolean {
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
 * Validation decorator for DTO's that enforces a length between 8-100 characters and requires passwords to
 * have at least 1 lowercase, uppercase, and digit characters.
 */
export function IsStrongPassword(validationOptions?: ValidationOptions): (object: any, propertyName: string) => void {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: StrongPassword,
    })
  }
}
