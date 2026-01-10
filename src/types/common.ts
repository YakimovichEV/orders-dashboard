export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T extends string = string> {
  field: T;
  direction: SortDirection;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export const PAGINATION_OPTIONS = [10, 25, 50] as const;
export type PageSize = (typeof PAGINATION_OPTIONS)[number];

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
