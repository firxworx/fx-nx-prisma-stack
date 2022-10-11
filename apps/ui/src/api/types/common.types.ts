/**
 * Parent context of API data objects that are children of Box Profiles.
 * Examples: Videos + Video Groups.
 */
export type BoxProfileContext = Partial<{
  boxProfileUuid: string
}>

/**
 * Generic parent context required for API queries for child data objects.
 *
 * This interface is intersected with the interface of the hook/fetch function argument object to add a
 * `parentContext` object with properties corresponding to the required identifiers.
 *
 * API data hooks and fetch functions that depend on parent context should provide these as the type/interface
 * argument `CTX` (parent context) to this generic, e.g. a query for line items belonging to a given invoice.
 *
 * Note: `CTX` is cast as a `PartialType` to satisfy the nuances of the underlying NextJS router + react-query.
 * All property values of `CTX` are required at the time of execution of any API query/fetch function.
 *
 * Any "fetcher" functions should be implemented to throw an Error if they are provided a `parentContext`
 * object (if/where one is required) that contains any `undefined`/nullish property values.
 *
 * @see ApiParentContext
 */
export interface ApiParentContext<CTX extends Record<string, unknown>> {
  parentContext: Partial<CTX>
}
