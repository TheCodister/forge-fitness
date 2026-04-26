export type ApiErrorShape = {
  message: string;
  code: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
