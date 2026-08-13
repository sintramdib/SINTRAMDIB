import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { badRequest } from '../../lib/errors';
import { storage } from '../storage';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_SIGNATURE_BYTES = 2 * 1024 * 1024; // 2 MB
const PHOTO_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const SIGN_MIME = ['image/png', 'image/jpeg'];

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Data em formato inválido')
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

const dependentSchema = z.object({
  name: optionalString(120),
  birthDate: optionalDate,
  kinship: optionalString(40),
  cpf: optionalString(14),
});

const associateSchema = z.object({
  // Informações gerais
  fullName: z.string().trim().min(2, 'Nome completo é obrigatório').max(120),
  preferredName: optionalString(120),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Data de nascimento é obrigatória e inválida')
    .transform((v) => new Date(v)),
  sex: optionalString(20),
  cpf: optionalString(14),
  rg: optionalString(20),
  rgIssuer: optionalString(20),
  rgIssueDate: optionalDate,
  fatherName: optionalString(120),
  motherName: optionalString(120),
  maritalStatus: optionalString(20),
  originState: optionalString(40),
  originCity: optionalString(80),

  // Profissionais
  workRegime: z.string().trim().min(2, 'Regime trabalhista é obrigatório').max(40),
  company: optionalString(120),
  workplace: optionalString(120),
  role: z.string().trim().min(2, 'Função/Cargo é obrigatório').max(120),
  council: optionalString(60),

  // Endereço
  cep: optionalString(9),
  street: optionalString(120),
  number: optionalString(20),
  neighborhood: optionalString(80),
  city: optionalString(80),
  state: optionalString(40),
  complement: optionalString(120),

  // Contato
  phone: optionalString(20),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === '' || (typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v)),
      'E-mail inválido',
    )
    .transform((v) => (v ? v : null)),
  instagram: optionalString(120),

  // Arquivos (data URLs base64) e dependentes
  photoBase64: z.string().optional().nullable(),
  signatureBase64: z.string().optional().nullable(),
  dependents: z.array(dependentSchema).optional().default([]),
});

export async function associateRoutes(app: FastifyInstance) {
  app.post('/api/associates', async (req, reply) => {
    const body = associateSchema.parse(req.body ?? {});

    // Salva foto e assinatura em disco antes de gravar no banco.
    let photoPath: string | null = null;
    let signaturePath: string | null = null;

    if (body.photoBase64) {
      const { ext, buffer } = storage.decodeDataUrl(body.photoBase64, PHOTO_MIME);
      if (buffer.length > MAX_PHOTO_BYTES) throw badRequest('Foto muito grande (máx. 5 MB)');
      photoPath = await storage.write('photo', ext, buffer);
    }

    if (body.signatureBase64) {
      const { ext, buffer } = storage.decodeDataUrl(body.signatureBase64, SIGN_MIME);
      if (buffer.length > MAX_SIGNATURE_BYTES) throw badRequest('Assinatura muito grande (máx. 2 MB)');
      signaturePath = await storage.write('signature', ext, buffer);
    }

    // Assinatura é obrigatória para o fluxo de filiação.
    if (!signaturePath) {
      throw badRequest('A assinatura é obrigatória para o envio do cadastro.');
    }

    const associate = await prisma.associate.create({
      data: {
        status: 'PENDENTE',
        fullName: body.fullName,
        preferredName: body.preferredName,
        birthDate: body.birthDate,
        sex: body.sex,
        cpf: body.cpf,
        rg: body.rg,
        rgIssuer: body.rgIssuer,
        rgIssueDate: body.rgIssueDate,
        fatherName: body.fatherName,
        motherName: body.motherName,
        maritalStatus: body.maritalStatus,
        originState: body.originState,
        originCity: body.originCity,
        workRegime: body.workRegime,
        company: body.company,
        workplace: body.workplace,
        role: body.role,
        council: body.council,
        cep: body.cep,
        street: body.street,
        number: body.number,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        complement: body.complement,
        phone: body.phone,
        email: body.email,
        instagram: body.instagram,
        photoPath,
        signaturePath,
        dependents: {
          create: body.dependents.map((d) => ({
            name: d.name,
            birthDate: d.birthDate,
            kinship: d.kinship,
            cpf: d.cpf,
          })),
        },
      },
    });

    return reply.code(201).send({
      ok: true,
      message: 'Cadastro enviado com sucesso! Em breve nossa equipe entrará em contato.',
      id: associate.id,
      status: associate.status,
    });
  });

  return app;
}