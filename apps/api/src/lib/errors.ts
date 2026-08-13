export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const badRequest = (msg: string) => new ApiError(400, msg);
export const unauthorized = (msg = 'Não autorizado') => new ApiError(401, msg);
export const forbidden = (msg = 'Acesso negado') => new ApiError(403, msg);
export const notFound = (msg = 'Não encontrado') => new ApiError(404, msg);