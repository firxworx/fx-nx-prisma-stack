export class FormError extends Error {
  public readonly status: number
  private readonly data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    // Error will break the prototype chain here (see next line)
    super(message)

    // preserve prototype chain as required when extending a built-in class (ts 2.2+)
    Object.setPrototypeOf(this, FormError.prototype)

    // explicitly set `name` property for stack traces
    this.name = FormError.name

    this.status = status
    this.data = data
  }

  getErrorMessage(): string {
    return `Form submit error (${this.status}): ${this.message}`
  }

  getData(): unknown {
    return this.data
  }
}
