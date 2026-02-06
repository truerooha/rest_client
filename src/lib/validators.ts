import { z } from 'zod'

const optionalString = z.string().trim().optional()

export const testUserInputSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    firstName: z.string().trim().min(1),
    lastName: optionalString.or(z.literal('')),
    username: optionalString.or(z.literal('')),
    photoUrl: z.string().trim().url().optional().or(z.literal('')),
  })
  .transform((value) => ({
    id: value.id,
    firstName: value.firstName,
    lastName: value.lastName ? value.lastName : undefined,
    username: value.username ? value.username : undefined,
    photoUrl: value.photoUrl ? value.photoUrl : undefined,
  }))

export const apiUrlSchema = z.string().trim().url()
