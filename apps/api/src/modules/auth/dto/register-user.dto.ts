import { IsEmail, IsString, IsNotEmpty, Length, MinLength } from 'class-validator'

export class RegisterUserDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string

  @Length(8, 128)
  password!: string
}
