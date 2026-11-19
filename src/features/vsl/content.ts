// Textos de la landing. Los que están entre [corchetes] son de ejemplo y se
// reemplazan cuando llegue el contenido final.

export const content = {
  scarcity: "Solo 3 flippers por ciudad",
  eyebrow: "Para flippers que compran menos de 4 casas al mes",
  headline: "Recibe citas con propietarios que quieren vender su casa Infonavit, sin salir a buscarlas",
  subhead:
    "El problema no es el dinero: es de dónde salen las casas. Mira este video de 5 minutos. Si tu operación califica, al final agendas tu sesión.",
  benefits: ["Nosotros atendemos a los propietarios", "Tú solo vas a la cita"],
  chapters: ["Por qué no te llegan casas", "Cómo funciona el sistema", "Casos reales y tu sesión"],

  stats: [
    { value: "13 estados", label: "con operación activa" },
    { value: "+650 citas", label: "con propietarios entregadas" },
    { value: "+90 casas", label: "firmadas por nuestros clientes" },
  ],

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

  howItWorks: {
    title: "Cómo funciona",
    steps: [
      { title: "Lanzamos anuncios en tu zona", body: "Buscamos propietarios con casa Infonavit y urgencia de vender." },
      { title: "Nuestro equipo los califica", body: "Hablamos con el propietario y filtramos a quien sí quiere vender." },
      { title: "Recibes la cita en tu agenda", body: "Tú solo vas, ves la casa y negocias." },
    ],
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
    // Ciudad y resultado van vacíos hasta tener el dato; vacío = no se muestra.
    // Karla y Gerardo solo tienen audio: su tarjeta aparece cuando haya video en el .env.
    items: [
      { name: "Javier Chávez", city: "", result: "" },
      { name: "Armando Pérez", city: "", result: "" },
      { name: "Alberto Celorio", city: "", result: "" },
      { name: "Karla Jordan", city: "", result: "" },
      { name: "Gerardo Leal", city: "", result: "" },
    ],
  },

  guarantee: {
    title: "Si en 90 días no te entregamos citas calificadas, seguimos trabajando hasta lograrlo.",
    condition: "Condición: mantener la pauta activa y atender las citas en 24 horas.",
    // Enlace opcional debajo de la condición; solo aparece si vslConfig.termsUrl tiene valor.
    terms: "Ver términos de la garantía",
  },

  faq: [
    {
      q: "¿En qué estados trabajan?",
      a: "Trabajamos con flippers en 13 estados de la República Mexicana. En la sesión revisamos tu zona y te decimos si hay suficientes propietarios con casa Infonavit para que funcione.",
    },
    {
      q: "¿Qué pasa si en mi zona no hay casas?",
      a: "Lo revisamos antes de empezar. En la sesión analizamos tu zona, cuántas casas quieres comprar y cuántas citas necesitas. Si los números no dan, te lo decimos de frente.",
    },
    {
      q: "¿Cuánto cuesta?",
      a: "Depende de tu zona y de cuántas casas quieres comprar al mes. En la sesión te decimos cuántas citas necesitas y cuánto cuesta.",
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

  finalCta: {
    title: "¿Listo para que las casas lleguen a ti?",
    cta: "Agendar mi sesión estratégica",
    lockedNote: "Mira el video para desbloquear tu agenda",
  },

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
