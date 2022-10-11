import { StrongPassword } from '../validation/is-strong-password.decorator'

// yarn test:api --test-name-pattern="StrongPassword Validator"

describe('StrongPassword Validator', () => {
  let validator: StrongPassword

  beforeEach(async () => {
    validator = new StrongPassword()
  })

  it('should be defined', () => {
    expect(validator).toBeDefined()
  })

  it('should have a default message', () => {
    // expect(validator.defaultMessage()).toMatchInlineSnapshot('')
    expect(typeof validator.defaultMessage()).toBe('string')
    expect(validator.defaultMessage().length).toBeGreaterThanOrEqual(12)
  })

  describe('validate', () => {
    describe('valid passwords', () => {
      it('accepts passwords that meet length and character requirements', () => {
        const passwords = ['!AbC1234', 'cccbbbA3', 'abcABC123456abc']

        passwords.forEach((password) => {
          expect(validator.validate(password)).toBe(true)
        })
      })

      it('accepts passwords that do not contain special characters', () => {
        const password = 'ABCabc123'
        expect(validator.validate(password)).toBe(true)
      })
    })

    describe('invalid paswords', () => {
      it('rejects passwords that are too short', () => {
        const password = 'AbC1234'
        expect(validator.validate(password)).toBe(false)
      })

      it('rejects passwords with no letters', () => {
        const password = '12345678_12345678'
        expect(validator.validate(password)).toBe(false)
      })

      it('rejects passwords with no numbers', () => {
        const password = 'ABCabcABCabc'
        expect(validator.validate(password)).toBe(false)
      })

      it('rejects passwords with no uppercase characters', () => {
        const password = 'abc1234abc1234!'
        expect(validator.validate(password)).toBe(false)
      })

      it('rejects passwords with no lowercase characters', () => {
        const password = 'ABC1234ABC1234!'
        expect(validator.validate(password)).toBe(false)
      })

      it('rejects passwords that are too long (>128 characters)', () => {
        const password = `ABCabc123`.repeat(15) // 135 characters
        expect(validator.validate(password)).toBe(false)
      })
    })
  })
})
