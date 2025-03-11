import { AppError } from '@/common/domain/errors/app-error';
/**
 *
 * @param schema object with zod validation schema
 * @param data data for validation
 * @returns valited data
 */
export function dataValidation(schema: any, data: any) {
  const validatedData = schema.safeParse(data);
  if (validatedData.success === false) {
    console.error('Invalid param: ', validatedData.error.format());
    throw new AppError(
      `${validatedData.error.errors.map(err => {
        return `${err.path} -> ${err.message}`;
      })}`,
    );
  }
  return validatedData.data;
}
