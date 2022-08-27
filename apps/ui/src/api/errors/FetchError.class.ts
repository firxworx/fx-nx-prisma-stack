export class FetchError extends Error {
  private readonly status: number

  constructor(status: number, message?: string) {
    // Error will break the prototype chain here (see next line)
    super(message)

    // preserve prototype chain as required when extending a built-in class (ts 2.2+)
    Object.setPrototypeOf(this, FetchError.prototype)

    // explicitly set `name` property for stack traces
    this.name = FetchError.name
    this.status = status
  }

  getErrorMessage() {
    return `Error fetching data (${this.status}): ${this.message}`
  }
}
