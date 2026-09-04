import axiosInstance from "./axios";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class CrudService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(): Promise<T[]> {
    const response = await axiosInstance.get<T[] | PageResponse<T> | { data?: T[] }>(this.endpoint);
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray((payload as PageResponse<T>)?.content)) return (payload as PageResponse<T>).content;
    if (Array.isArray((payload as { data?: T[] })?.data)) return (payload as { data: T[] }).data;
    throw new Error(`Expected a list response from ${this.endpoint}`);
  }

  async getById(id: number | string): Promise<T> {
    const response = await axiosInstance.get<T>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await axiosInstance.post<T>(this.endpoint, data);
    return response.data;
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    const response = await axiosInstance.put<T>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: number | string): Promise<void> {
    await axiosInstance.delete(`${this.endpoint}/${id}`);
  }
}
