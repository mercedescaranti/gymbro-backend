import { VISIT_MAX_HOURS } from './config';
import { prisma } from './db';

const MAX_MS = VISIT_MAX_HOURS * 3600_000;

// true si el alumno tiene una visita abierta que ya superó el máximo (todavía sin cerrar).
export async function tieneVisitaVencida(userId: number, now: Date = new Date()): Promise<boolean> {
  const visit = await prisma.gymVisit.findFirst({
    where: { userId, exitedAt: null, enteredAt: { lt: new Date(now.getTime() - MAX_MS) } },
    select: { id: true },
  });
  return visit !== null;
}

// Cierra las visitas abiertas hace más de VISIT_MAX_HOURS con exitedAt = enteredAt + VISIT_MAX_HOURS.
// Devuelve cuántas cerró. El filtro exitedAt: null evita pisar una salida real que llegue justo ahora.
export async function cerrarVisitasVencidas(now: Date = new Date()): Promise<number> {
  const expired = await prisma.gymVisit.findMany({
    where: { exitedAt: null, enteredAt: { lt: new Date(now.getTime() - MAX_MS) } },
    select: { id: true, enteredAt: true },
  });
  if (expired.length === 0) return 0;

  const results = await prisma.$transaction(
    expired.map((visit) =>
      prisma.gymVisit.updateMany({
        where: { id: visit.id, exitedAt: null },
        data: { exitedAt: new Date(visit.enteredAt.getTime() + MAX_MS) },
      })
    )
  );
  return results.reduce((total, result) => total + result.count, 0);
}
