import { IsEmail, IsString, IsNotEmpty, Length, MinLength } from 'class-validator'
import { IsStrongPassword } from '../decorators/validation/is-strong-password.decorator'

export class RegisterUserDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string

  @Length(8, 128, { message: 'Password must be between 8-128 characters long' })
  @IsStrongPassword()
  password!: string
}
