import { z } from 'zod';

export const MAX_NAME = 120;
export const MAX_DESC = 500;

export const productSchema = z.object({
  name: z.string().min(1, 'Informe o nome').max(MAX_NAME, `Máx. ${MAX_NAME} caracteres`),
  description: z
    .string()
    .max(MAX_DESC, `Máx. ${MAX_DESC} caracteres`)
    .optional()
    .or(z.literal('')),
  price: z
    .coerce.number({ invalid_type_error: 'Preço inválido' })
    .nonnegative('Preço deve ser ≥ 0'),
  quantity: z
    .coerce.number({ invalid_type_error: 'Quantidade inválida' })
    .int('Use número inteiro')
    .nonnegative('Quantidade deve ser ≥ 0'),
});

export type ProductForm = z.infer<typeof productSchema>;
