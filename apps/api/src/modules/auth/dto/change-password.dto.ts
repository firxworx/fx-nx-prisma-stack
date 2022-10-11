import { IsString, IsNotEmpty, Length } from 'class-validator'
import { IsStrongPassword } from '../decorators/validation/is-strong-password.decorator'

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 128, { message: 'Password must be between 8-128 characters long' })
  @IsStrongPassword()
  newPassword!: string
}
