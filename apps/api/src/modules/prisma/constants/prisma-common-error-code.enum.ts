export enum PrismaCommonErrorCode {
  /**
   * Authentication failed against database server at `{database_host}`, the provided database credentials for `{database_user}` are not valid. Please make sure to provide valid database credentials for the database server at `{database_host}`.
   */
  AuthenticationFailed = 'P1000',
  /**
   * Can't reach database server at `{database_host}`:`{database_port}` Please make sure your database server is running at `{database_host}`:`{database_port}`.
   */
  CouldNotConnectToDatabase = 'P1001',
  /**
   * The database server at `{database_host}`:`{database_port}` was reached but timed out. Please try again. Please make sure your database server is running at `{database_host}`:`{database_port}`.
   */
  ConnectionTimedOut = 'P1002',
  /**
   * Database `{database_file_name}` does not exist at `{database_file_path}`
   *
   * Database `{database_name}.{database_schema_name}` does not exist on the database server at `{database_host}:{database_port}`.
   *
   * Database `{database_name}` does not exist on the database server at `{database_host}:{database_port}`.
   */
  DatabaseFileNotFound = 'P1003',
  /**
   * Operations timed out after `{time}`
   */
  OperationsTimedOut = 'P1008',
  /**
   * Database `{database_name}` already exists on the database server at `{database_host}:{database_port}`
   */
  DatabaseAlreadyExists = 'P1009',
  /**
   * User `{database_user}` was denied access on the database `{database_name}`
   */
  AccessDeniedForUser = 'P1010',
  /**
   * Error opening a TLS connection: `{message}`
   */
  TLSConnectionError = 'P1011',
  /**
   * `{full_error}`
   */
  Error = 'P1012',
  /**
   * The provided database string is invalid. `{details}`
   */
  InvalidDatabaseString = 'P1013',
  /**
   * The underlying `{kind}` for model `{model}` does not exist.
   */
  KindForModelDoesNotExist = 'P1014',
  /**
   * Your Prisma schema is using features that are not supported for the version of the database. Database version: `{database_version}` Errors:
   */
  UnsupportedFeaturesAtPrismaSchema = 'P1015',
  /**
   * Your raw query had an incorrect number of parameters. Expected: `{expected}`, actual: `{actual}`.
   */
  IncorrectNumberOfParameters = 'P1016',
  /**
   * Server has closed the connection.
   */
  ServerClosedConnection = 'P1017',
}
