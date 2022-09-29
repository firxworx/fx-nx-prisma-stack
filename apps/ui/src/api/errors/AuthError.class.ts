export class AuthError extends Error {
  public readonly status: number

  constructor(message?: string) {
    // Error will break the prototype chain here (see next line)
    super(message)

    // preserve prototype chain as required when extending a built-in class (ts 2.2+)
    Object.setPrototypeOf(this, AuthError.prototype)

    // explicitly set `name` property for stack traces
    this.name = AuthError.name
    this.status = 401
  }

  getErrorMessage(): string {
    return `Unauthorized (${this.status}): ${this.message}`
  }
}
