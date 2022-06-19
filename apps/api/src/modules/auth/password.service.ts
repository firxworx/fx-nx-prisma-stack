import { Injectable } from '@nestjs/common'
import { hash, verify } from 'argon2'

@Injectable()
export class PasswordService {
  public async verify(hash: string, plainText: string): Promise<boolean> {
    return verify(hash, plainText)
  }

  public async hash(input: string): Promise<string> {
    return hash(input)
  }
}
