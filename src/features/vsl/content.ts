// Textos de la landing. Los que están entre [corchetes] son de ejemplo y se
// reemplazan cuando llegue el contenido final.

export const content = {
  scarcity: "Cupos limitados por zona",
  headline:
    "Si haces flipping y compras menos de 4 casas al mes, el problema no es el dinero: es de dónde salen.",
  subhead:
    "Mira este video de 5 minutos. Si tu operación califica, al final podrás agendar una sesión con nuestro equipo.",
  chapters: ["Por qué no te llegan casas", "Cómo funciona el sistema", "Casos reales y tu sesión"],

  locked: {
    title: "Tu sesión estratégica está bloqueada",
    body: "Mira el video para desbloquear tu agenda",
    note: "Solo agendamos con flippers que ya vieron cómo funciona el sistema.",
  },
  unlocked: {
    badge: "Agenda desbloqueada",
    title: "Ya puedes apartar tu sesión",
    body: "Responde 5 preguntas rápidas y elige tu horario. Revisamos tu zona y te decimos cuántas citas con propietarios podemos conseguirte.",
    cta: "Agendar mi sesión",
    foot: "Cupos limitados por zona · toma 1 minuto",
  },

  form: {
    step: "Paso 1 de 2 · Aplicación",
    title: "Aplica a tu sesión",
    intro: "5 preguntas rápidas. Si tu operación califica, eliges día y hora en el siguiente paso.",
    keepWatching: "Puedes seguir viendo el video mientras llenas tus datos",
    submit: "Ver horarios disponibles",
    privacy: "Al enviar aceptas nuestro",
    privacyLink: "aviso de privacidad",
  },

  testimonials: {
    title: "Flippers que ya reciben citas con propietarios",
    // Uno por video, en el mismo orden que VITE_VSL_TESTIMONIAL_1…5 del .env.
    // Mientras el nombre siga entre [corchetes], el video se muestra sin texto debajo.
    items: [
      { name: "[CLIENTE]", city: "[CIUDAD]", result: "[N] casas compradas en [N] meses" },
      { name: "[CLIENTE]", city: "[CIUDAD]", result: "[N] casas compradas en [N] meses" },
      { name: "[CLIENTE]", city: "[CIUDAD]", result: "[N] casas compradas en [N] meses" },
      { name: "[CLIENTE]", city: "[CIUDAD]", result: "[N] casas compradas en [N] meses" },
      { name: "[CLIENTE]", city: "[CIUDAD]", result: "[N] casas compradas en [N] meses" },
    ],
  },

  guarantee: {
    title: "Si en 90 días no ves resultados, trabajamos gratis hasta que los veas.",
    // Letra chica debajo del título. Liga a vslConfig.termsUrl cuando exista la página de términos.
    terms: "*Aplican términos y condiciones.",
  },

  faq: [
    {
      q: "¿En qué estados trabajan?",
      a: "Trabajamos con flippers en 13 estados de la República Mexicana. En la sesión revisamos tu zona y te decimos si hay suficientes propietarios con casa Infonavit para que funcione.",
    },
    {
      q: "¿Quién atiende a los propietarios?",
      a: "Un asistente con inteligencia artificial contesta al instante y hace las preguntas clave: dónde está la casa, a nombre de quién está, cuánto debe y cuánto quiere. Después, nuestro equipo de asesores inmobiliarios le da seguimiento hasta agendar la cita. Tú recibes cada cita con su ficha técnica y solo vas a hacer la oferta.",
    },
    {
      q: "¿Qué pasa si en mi zona no hay casas?",
      a: "Lo revisamos antes de empezar. En la sesión analizamos tu zona, cuántas casas quieres comprar y cuántas citas necesitas. Si los números no dan, te lo decimos de frente.",
    },
    {
      q: "¿Cuánto cuesta?",
      a: "Depende de tu zona y de cuántas casas quieres comprar al mes. En la sesión te decimos cuántas citas necesitas y cuánto cuesta.",
    },
    // Las tres siguientes venían como «sugeridas, opcional» en el documento del 13 nov 2026.
    {
      q: "¿Trabajan con otros flippers en mi zona?",
      a: "Trabajamos con pocos flippers por zona, para que no compitas con otro cliente por las mismas casas.",
    },
    {
      q: "¿Quién paga la publicidad?",
      a: "La inversión en anuncios de Meta la pagas directo a Meta, con tu tarjeta. Así siempre sabes cuánto se invierte.",
    },
    {
      q: "¿Para quién no es este servicio?",
      a: "No es para ti si todavía no compras tu primera casa, si no tienes capital o si buscas un curso. Es para flippers que ya operan y quieren pasar de 2 a 5, 10 o 15 casas al mes.",
    },
  ],

  schedule: {
    step: "Paso 2 de 2 · Agenda",
    title: "¡Calificas! Elige día y hora para tu sesión",
    body: "Videollamada de 45 minutos con nuestro equipo. Revisamos tu zona, tu operación y cuántas casas quieres comprar.",
  },

  thanks: {
    title: "Tu sesión quedó agendada",
    // Por decidir: Calendly solo manda correo; el WhatsApp tendría que salir de Kommo.
    body: "Te enviamos la confirmación por WhatsApp y correo. Mira este mensaje antes de la llamada.",
    videoLabel: "Video corto de Edgar (60–90 s): qué vamos a ver en la sesión",
    checklistTitle: "Para aprovechar la sesión, ten a la mano:",
    checklist: [
      "Zona o ciudades donde compras",
      "Cuántas casas compraste este año",
      "Cuántas quieres comprar al mes",
    ],
    cta: "Confirmar asistencia por WhatsApp",
  },

  notYet: {
    title: "Gracias por ver el video",
    body: "Tengo un mensaje para ti antes de que te vayas.",
    videoLabel: "Video de Edgar · 60–90 s",
  },
};
