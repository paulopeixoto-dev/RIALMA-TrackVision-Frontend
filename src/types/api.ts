export interface LaravelResource<T> {
  data: T
}

export interface LaravelPaginated<T> {
  data: T[]
  links?: Record<string, string | null>
  meta?: Record<string, unknown>
}

export type FieldErrors = Record<string, string[]>
