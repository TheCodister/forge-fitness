export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}
