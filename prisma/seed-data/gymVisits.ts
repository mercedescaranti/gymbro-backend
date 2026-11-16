// Visitas al gimnasio de prueba (tabla GymVisit: entrada y salida de cada alumno).
// Se calculan relativas al momento de correr el seed, así "los activos" siempre tienen sentido
// (si fueran fechas fijas, las entradas abiertas quedarían vencidas a las 3 horas).
export type GymVisitSeed = {
  userId: number;
  enteredAt: Date;
  exitedAt: Date | null;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function buildGymVisits(now: Date = new Date()): GymVisitSeed[] {
  const ago = (ms: number) => new Date(now.getTime() - ms);
  // Visita ya terminada: entró hace `daysAgo` días y se quedó `minutes` minutos.
  const done = (userId: number, daysAgo: number, minutes: number): GymVisitSeed => {
    const enteredAt = ago(daysAgo * DAY);
    return { userId, enteredAt, exitedAt: new Date(enteredAt.getTime() + minutes * MINUTE) };
  };

  return [
    // Historial cerrado (entró y escaneó la salida).
    done(2, 1, 75),
    done(2, 3, 90),
    done(2, 5, 60),
    done(2, 8, 80),
    done(3, 1, 65),
    done(3, 2, 70),
    done(3, 4, 95),
    done(4, 2, 55),
    done(4, 6, 85),
    done(6, 1, 100),
    done(6, 3, 60),
    done(7, 2, 70),
    done(8, 4, 90),
    done(9, 5, 75),

    // Activos ahora: entraron hace poco y todavía no escanearon la salida.
    { userId: 3, enteredAt: ago(40 * MINUTE), exitedAt: null },
    { userId: 6, enteredAt: ago(90 * MINUTE), exitedAt: null },

    // Se olvidó de escanear la salida: pasaron más de 3 h, así que el backend la cierra sola
    // (con exitedAt = enteredAt + 3 h) la primera vez que se consulte la asistencia.
    { userId: 4, enteredAt: ago(5 * HOUR), exitedAt: null },
  ];
}
