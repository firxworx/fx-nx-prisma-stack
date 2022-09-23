export interface ApiBaseDto {
  uuid: string
}

/**
 * Generic type for API mutate request DTO's for typing API "fetcher" functions that correspond to mutation requests.
 */
export type ApiMutateRequestDto<DTO = object> = Required<ApiBaseDto> & Omit<DTO, keyof ApiBaseDto>

// export type ApiMutateRequestDto<DTO extends ApiObject> = Required<ApiObject> & Partial<Omit<DTO, keyof ApiObject>>

export type ApiDeleteRequestDto = ApiBaseDto
