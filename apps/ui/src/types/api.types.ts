/**
 * Base interface of an API object (DTO) that defines the unique identifier property of data objects
 * on the back-end: `uuid`.
 */
export interface ApiBaseDto {
  uuid: string
}

/**
 * Generic type for API mutate request data that ensures the unique identifier field is required.
 * Intended for typing API "fetcher" functions that correspond to mutation requests.
 *
 * @see ApiBaseDto
 */
export type ApiMutateRequestDto<DTO = object> = Required<ApiBaseDto> & Omit<DTO, keyof ApiBaseDto>
// export type ApiMutateRequestDto<DTO extends ApiObject> = Required<ApiObject> & Partial<Omit<DTO, keyof ApiObject>>

export type ApiDeleteRequestDto = ApiBaseDto
