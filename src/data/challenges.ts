export interface Challenge {
  id: number;
  original: string;
  context: string;
  situation: string;
  difficulty: 'Baja' | 'Media' | 'Alta';
}

export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    original: "Usted nunca hace nada bien.",
    context: "Trabajo",
    situation: "Un compañero o subordinado cometió un error en un reporte de Excel.",
    difficulty: "Baja"
  },
  {
    id: 2,
    original: "Si no me contestas ya mismo, no me busques más.",
    context: "Pareja",
    situation: "Tu pareja no ha respondido tus mensajes de texto en toda la tarde.",
    difficulty: "Baja"
  },
  {
    id: 3,
    original: "No te preocupes, yo hago todo el trabajo del grupo solo como siempre.",
    context: "Universidad",
    situation: "Tus compañeros de grupo no han enviado sus partes para el trabajo final.",
    difficulty: "Baja"
  },
  {
    id: 4,
    original: "Pensé que eras mi amigo, pero ya veo que no te importo.",
    context: "Amigos",
    situation: "Un amigo cercano organizó una reunión de fin de semana y olvidó invitarte.",
    difficulty: "Baja"
  },
  {
    id: 5,
    original: "Me da igual lo que hagan con mi pedido, total siempre atienden mal.",
    context: "Servicio al Cliente",
    situation: "Llegó tu comida a domicilio fría y con ingredientes equivocados.",
    difficulty: "Baja"
  },
  {
    id: 6,
    original: "Tu propuesta me parece una total tontería, mejor hagamos la mía.",
    context: "Trabajo",
    situation: "En una reunión, un colega expuso una idea diferente a la tuya para resolver un problema.",
    difficulty: "Baja"
  },
  {
    id: 7,
    original: "No me pasa nada, déjame en paz.",
    context: "Familia",
    situation: "Estás visiblemente molesto por algo que ocurrió en el trabajo y tu madre te pregunta qué tienes.",
    difficulty: "Baja"
  },
  {
    id: 8,
    original: "Perdón por molestar, pero tal vez si tienes tiempo podrías revisar esto... si no puedes, no pasa nada.",
    context: "Trabajo",
    situation: "Necesitas que tu jefe apruebe un documento urgente antes de enviarlo a un cliente.",
    difficulty: "Baja"
  },
  {
    id: 9,
    original: "Siempre llegas tarde. Eres un egoísta que no valora mi tiempo.",
    context: "Amigos",
    situation: "Quedaste de ver a un amigo a las 7:00 PM y llegó a las 7:45 PM sin avisar.",
    difficulty: "Baja"
  },
  {
    id: 10,
    original: "Haz lo que quieras, al final siempre haces lo que te da la gana.",
    context: "Pareja",
    situation: "Tu pareja quiere pasar el fin de semana con sus amigos en lugar de ir a cenar contigo.",
    difficulty: "Baja"
  },
  {
    id: 11,
    original: "O me cambian este producto inservible ahora mismo o los demando con el gobierno.",
    context: "Servicio al Cliente",
    situation: "Compraste un teléfono celular que dejó de encender al segundo día de uso.",
    difficulty: "Baja"
  },
  {
    id: 12,
    original: "Tú no sabes de lo que estás hablando, eres nuevo aquí.",
    context: "Trabajo",
    situation: "Un colega recién contratado sugirió cambiar el método de almacenamiento de archivos de la empresa.",
    difficulty: "Baja"
  },
  {
    id: 13,
    original: "No te pedí tu opinión, así que cállate.",
    context: "Universidad",
    situation: "Un integrante de tu equipo opinó sobre tu diseño en una presentación grupal.",
    difficulty: "Baja"
  },
  {
    id: 14,
    original: "Claro, como tú eres perfecto y yo siempre me equivoco.",
    context: "Familia",
    situation: "Tu hermano te señaló que olvidaste apagar la luz de la sala al salir.",
    difficulty: "Baja"
  },
  {
    id: 15,
    original: "Está bien, haré horas extra gratis otra vez. No es como si tuviera una vida familiar.",
    context: "Trabajo",
    situation: "Tu supervisor te pide quedarte dos horas adicionales un viernes por la tarde debido a un retraso.",
    difficulty: "Baja"
  },
  {
    id: 16,
    original: "Eres un incompetente. Este trabajo está lleno de errores tontos.",
    context: "Trabajo",
    situation: "Revisas la presentación de un subordinado y ves que tiene errores ortográficos y datos erróneos.",
    difficulty: "Baja"
  },
  {
    id: 17,
    original: "Si fueras un buen hijo, me visitarías más seguido en lugar de poner excusas.",
    context: "Familia",
    situation: "Un padre le reclama a su hijo adulto que trabaja a tiempo completo por no ir a cenar cada semana.",
    difficulty: "Baja"
  },
  {
    id: 18,
    original: "Ya no me hables. Consigue a alguien más para tu estúpido proyecto.",
    context: "Universidad",
    situation: "Tu compañero de tesis sugirió hacer algunos cambios importantes a la estructura que tú hiciste.",
    difficulty: "Baja"
  },
  {
    id: 19,
    original: "Bueno, supongo que comeré solo. No importa, ya estoy acostumbrado a que me cancelen.",
    context: "Amigos",
    situation: "Un amigo te cancela el almuerzo del día a última hora debido a un imprevisto médico.",
    difficulty: "Baja"
  },
  {
    id: 20,
    original: "Ustedes son los peores. Su servicio es un chiste y sus empleados son inútiles.",
    context: "Servicio al Cliente",
    situation: "El banco cobró una comisión mensual errónea a tu tarjeta de débito.",
    difficulty: "Baja"
  },
  {
    id: 21,
    original: "Tu departamento es un desastre y siempre retrasa todos mis proyectos.",
    context: "Trabajo",
    situation: "El equipo de diseño no entregó las imágenes que tu equipo de marketing necesitaba hoy.",
    difficulty: "Baja"
  },
  {
    id: 22,
    original: "Si de verdad me quisieras, sabrías lo que me pasa sin que tenga que decírtelo.",
    context: "Pareja",
    situation: "Tu pareja nota que estás triste pero tú te niegas a explicarle de manera directa qué te molestó.",
    difficulty: "Baja"
  },
  {
    id: 23,
    original: "No sé para qué vengo a estas reuniones si al final ignoran todo lo que digo.",
    context: "Trabajo",
    situation: "En una mesa redonda de lluvia de ideas, tus dos sugerencias fueron descartadas.",
    difficulty: "Baja"
  },
  {
    id: 24,
    original: "Qué sorpresa, otra vez no lavaste los platos. ¿Acaso crees que soy tu sirviente?",
    context: "Familia",
    situation: "Tu compañero de piso o hermano prometió lavar los platos del almuerzo y los dejó sucios hasta la noche.",
    difficulty: "Baja"
  },
  {
    id: 25,
    original: "Lo lamento, no quería molestarte con mis dudas tontas. Olvídalo.",
    context: "Universidad",
    situation: "Le escribes a un profesor para aclarar una duda sobre el examen y sientes que responde cortante.",
    difficulty: "Baja"
  },
  {
    id: 26,
    original: "No me vuelvas a dar órdenes en público. Tú no eres mi jefe.",
    context: "Trabajo",
    situation: "Un compañero de tu mismo nivel te asignó tareas en frente de todo el equipo en una reunión.",
    difficulty: "Baja"
  },
  {
    id: 27,
    original: "Por tu culpa perdimos la reservación del restaurante. Nunca puedes estar listo a tiempo.",
    context: "Pareja",
    situation: "Tu pareja se tardó vistiéndose y llegaron 30 minutos tarde al restaurante, perdiendo la reserva.",
    difficulty: "Baja"
  },
  {
    id: 28,
    original: "Supongo que mi opinión no vale nada porque soy el menor de la familia.",
    context: "Familia",
    situation: "Tus padres decidieron a dónde ir de vacaciones familiares sin consultarte.",
    difficulty: "Baja"
  },
  {
    id: 29,
    original: "Si vas a estar con esa cara tan aburrida, mejor vete de mi fiesta.",
    context: "Amigos",
    situation: "Tu amigo está callado y cansado en tu fiesta de cumpleaños porque tuvo un mal día laboral.",
    difficulty: "Baja"
  },
  {
    id: 30,
    original: "Tu presentación fue aburridísima, casi me quedo dormido en la sala.",
    context: "Trabajo",
    situation: "Retroalimentas a un compañero de trabajo sobre su presentación trimestral.",
    difficulty: "Baja"
  },
  {
    id: 31,
    original: "No debí haberte contado mis problemas, ya veo que tienes cosas 'más importantes' que escucharme.",
    context: "Amigos",
    situation: "Le estabas contando algo difícil a un amigo y este revisó su celular dos veces durante la plática.",
    difficulty: "Baja"
  },
  {
    id: 32,
    original: "Si vuelves a tocar mis cosas sin pedir permiso, te vas a arrepentir.",
    context: "Familia",
    situation: "Tu hermano menor tomó prestado tu abrigo favorito sin avisar y lo dejó en la sala.",
    difficulty: "Baja"
  },
  {
    id: 33,
    original: "No sé para qué pagamos colegiatura si los profesores explican de una forma tan pésima.",
    context: "Universidad",
    situation: "No entendiste la clase de programación y te sientes frustrado con el método de enseñanza.",
    difficulty: "Baja"
  },
  {
    id: 34,
    original: "Tu llamada de ventas me hizo perder el tiempo. No me vuelvas a marcar en tu vida.",
    context: "Servicio al Cliente",
    situation: "Un agente telefónico te llamó en tu hora de almuerzo para ofrecerte un seguro de vida.",
    difficulty: "Baja"
  },
  {
    id: 35,
    original: "Déjalo así, yo lo hago. Es más rápido hacerlo yo mismo que explicarte y que lo arruines.",
    context: "Trabajo",
    situation: "Le estás enseñando a un nuevo pasante a usar el software de la empresa y se equivoca varias veces.",
    difficulty: "Baja"
  },
  {
    id: 36,
    original: "Siempre pones a tu trabajo y a tus amigos antes que a mí.",
    context: "Pareja",
    situation: "Tu pareja canceló la cita del viernes porque debe terminar un reporte de última hora.",
    difficulty: "Baja"
  },
  {
    id: 37,
    original: "Oye, ¿podrías guardar silencio? A algunos sí nos interesa pasar el examen.",
    context: "Universidad",
    situation: "Dos compañeros en la fila de atrás están susurrando y riendo mientras el profesor explica.",
    difficulty: "Baja"
  },
  {
    id: 38,
    original: "No sé por qué me cobraron esto, pero quiero mi dinero de vuelta ya mismo.",
    context: "Servicio al Cliente",
    situation: "Aparece un cargo por seguro de $5 USD en tu factura mensual de internet que no recuerdas haber contratado.",
    difficulty: "Baja"
  },
  {
    id: 39,
    original: "Tu perro hace un ruido insoportable todo el día y ya me tiene harto.",
    context: "Familia",
    situation: "El perro de tu vecino o familiar directo ladra recurrentemente por las mañanas cuando intentas dormir.",
    difficulty: "Baja"
  },
  {
    id: 45,
    original: "A ver si esta vez sí pones atención a las especificaciones que te di.",
    context: "Trabajo",
    situation: "Un diseñador te entrega una imagen que no cumple con el tamaño y colores que le habías indicado.",
    difficulty: "Baja"
  },
  {
    id: 40,
    original: "Me parece increíble que organices una fiesta y no seas capaz de poner buena música.",
    context: "Amigos",
    situation: "Estás en una reunión en casa de un conocido y no te agrada el género musical que está sonando.",
    difficulty: "Baja"
  },
  {
    id: 41,
    original: "No te pedí ayuda porque sé que siempre estás demasiado ocupada para mí.",
    context: "Familia",
    situation: "Tu madre te reclama por no haberle pedido ayuda para pintar tu habitación.",
    difficulty: "Baja"
  },
  {
    id: 42,
    original: "Si sigues explicándome de esa manera tan grosera, me voy a salir de la clase.",
    context: "Universidad",
    situation: "Un profesor te responde de forma sarcástica frente al grupo cuando le haces una pregunta académica.",
    difficulty: "Baja"
  },
  {
    id: 43,
    original: "Ustedes siempre pierden mis paquetes. Son el peor servicio de envíos de este país.",
    context: "Servicio al Cliente",
    situation: "El sistema de rastreo de tu paquete muestra que está demorado por tercera vez consecutiva.",
    difficulty: "Baja"
  },
  {
    id: 44,
    original: "Se nota que no te importa que este proyecto fracase por tu culpa.",
    context: "Trabajo",
    situation: "Un miembro de tu equipo no entregó las diapositivas para la junta con el cliente internacional.",
    difficulty: "Baja"
  },
  {
    id: 46,
    original: "Seguro que ni te acordaste de que hoy cumplimos meses.",
    context: "Pareja",
    situation: "Llega la noche de su aniversario de meses y tu pareja no ha mencionado el tema ni te ha enviado un detalle.",
    difficulty: "Baja"
  },
  {
    id: 47,
    original: "Si no me prestas dinero ahora, consideraré que nuestra amistad terminó.",
    context: "Amigos",
    situation: "Le pides dinero prestado a un amigo porque tienes una urgencia y él duda debido a sus propias deudas.",
    difficulty: "Baja"
  },
  {
    id: 48,
    original: "Claro, ignórame de nuevo. Es lo único que sabes hacer bien.",
    context: "Pareja",
    situation: "Le envías una pregunta sobre el almuerzo a tu novio/a y ve el mensaje pero no te responde.",
    difficulty: "Baja"
  },
  {
    id: 49,
    original: "Ustedes nunca cumplen sus plazos de entrega, mejor busco a otro proveedor.",
    context: "Servicio al Cliente",
    situation: "La imprenta te prometió los folletos para el lunes en la mañana y es martes y aún no están listos.",
    difficulty: "Baja"
  },
  {
    id: 50,
    original: "Es obvio que me vas a reprobar porque te caigo mal.",
    context: "Universidad",
    situation: "Ves que tu calificación en la tarea fue de 5.0 y sientes que el profesor fue injusto al calificar tu entrega.",
    difficulty: "Baja"
  }
];
