/**
 * @see PrismaErrorCode
 */
export enum PrismaMigrationErrorCode {
  /**
   * Failed to create database: `{database_error}`
   */
  FailedToCreateDatabase = 'P3000',
  /**
   * Migration possible with destructive changes and possible data loss: `{migration_engine_destructive_details}`
   */
  PossibleDestructiveOrDataLossChanges = 'P3001',
  /**
   * The attempted migration was rolled back: `{database_error}`
   */
  MigrationRolledBack = 'P3002',
  /**
   * The format of migrations changed, the saved migrations are no longer valid. To solve this problem, please follow the steps at: https://pris.ly/d/migrate
   */
  InvalidMigrationFormat = 'P3003',
  /**
   * The `{database_name}` database is a system database, it should not be altered with prisma migrate. Please connect to another database.
   */
  SystemDatabaseNotSupported = 'P3004',
  /**
   * The database schema for `{database_name}` is not empty. Read more about how to baseline an existing production database: https://pris.ly/d/migrate-baseline
   */
  DatabaseNotEmpty = 'P3005',
  /**
   * Migration `{migration_name}` failed to apply cleanly to a temporary database.
   */
  CouldNotApplyCleanlyToTemporaryDatabase = 'P3006',
  /**
   * Some of the requested preview features are not yet allowed in migration engine. Please remove them from your data model before using migrations.
   */
  PreviewFeaturesNotAllowedInMigrationEngine = 'P3007',
  /**
   * The migration `{migration_name}` is already recorded as applied in the database.
   */
  MigrationAlreadyApplied = 'P3008',
  /**
   * migrate found failed migrations in the target database, new migrations will not be applied. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve `{details}`
   */
  FailedMigrationsFound = 'P3009',
  /**
   * The name of the migration is too long. It must not be longer than 200 characters (bytes).
   */
  MigrationNameTooLong = 'P3010',
  /**
   * Migration `{migration_name}` cannot be rolled back because it was never applied to the database.
   */
  CannotRollBackANeverAppliedMigration = 'P3011',
  /**
   * Migration `{migration_name}` cannot be rolled back because it is not in a failed state.
   */
  CannotRollBackANotFailedMigration = 'P3012',
  /**
   * Datasource provider arrays are no longer supported in migrate. Please change your datasource to use a single provider. Read more at https://pris.ly/multi-provider-deprecation
   */
  DatasourceProviderArraysNotSupported = 'P3013',
  /**
   * The datasource provider `{provider}` specified in your schema does not match the one specified in the migration_lock.toml. You will encounter errors when you try to apply migrations generated for a different provider. Please archive your current migration directory at a different location and start a new migration history with `prisma migrate dev`.
   */
  DatasourceProviderDontMatchMigrationLock = 'P3014',
  /**
   * Could not find the migration file at `{migration_file_path}`. Please delete the directory or restore the migration file.
   */
  MissingMigrationFile = 'P3015',
  /**
   * The fallback method for database resets failed, meaning Migrate could not clean up the database entirely. Original error: `{error_code}`
   * `{inner_error}`
   */
  CouldNotCleanupDatabase = 'P3016',
  /**
   * The migration `{migration_name}` could not be found. Please make sure that the migration exists, and that you included the whole name of the directory. (example: `"20201207184859_initial_migration"`)
   */
  MigrationNotFound = 'P3017',
  /**
   * A migration failed to apply. New migrations can not be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve
   *
   * Migration name: `{migration_name}`
   *
   * Database error code: `{database_error_code}`
   *
   * Database error:
   * `{database_error}`
   */
  FailedToApplyMigration = 'P3018',
  /**
   * The datasource provider `{provider}` specified in your schema does not match the one specified in the migration_lock.toml, `{expected_provider}`. Please remove your current migration directory and start a new migration history with prisma migrate dev. Read more: https://pris.ly/d/migrate-provider-switch
   */
  DatasourceProvidersDontMatch = 'P3019',
  /**
   * The automatic creation of shadow databases is disabled on Azure SQL. Please set up a shadow database using the `shadowDatabaseUrl` datasource attribute.
   *
   * Read the docs page for more details: https://pris.ly/d/migrate-shadow
   */
  ShadowDatabasesAutomaticCreationIsDisabled = 'P3020',
}
