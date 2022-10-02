/**
 * LocalStorage key for persisting the enabled/disabled state of the session context query.
 *
 * The value 'enabled' or 'disabled' is saved to LocalStorage. If the corresponding value does
 * not exist or if the value is 'disabled' the user is presumed to be unauthenticated and the
 * session query will be disabled.
 *
 * @see SessionContextProvider
 */
export const LOCAL_STORAGE_SESSION_CTX_FLAG_KEY = 'FX_SESSION_CTX_FLAG' as const
