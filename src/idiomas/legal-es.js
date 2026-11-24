export const privacidad = {
  etiqueta: "Privacidad",
  titulo: "Política de privacidad",
  intro:
    "GiftSquad, desarrollada por {autor}, respeta tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos, con quién los compartimos y cuáles son tus derechos.",
  secciones: [
    {
      titulo: "Datos que recopilamos",
      bloques: [
        {
          tipo: "p",
          texto:
            "Recopilamos únicamente los datos necesarios para que la app funcione y puedas coordinar regalos con tu grupo.",
        },
        {
          tipo: "tabla",
          filas: [
            { clave: "Nombre y email", valor: "Para crear tu cuenta. Los entrega Google o Apple al iniciar sesión." },
            { clave: "Foto de perfil", valor: "Opcional. Se muestra en tu perfil y en los grupos donde participás." },
            { clave: "Tus listas", valor: "Los ítems que cargás: nombre, link, precio e imagen del producto." },
            { clave: "Grupos", valor: "Los grupos que creás y las personas que invitás a cada uno." },
            { clave: "Reservas", valor: "Qué regalos reservaste. Nunca es visible para el destinatario." },
            { clave: "Token del dispositivo", valor: "Para enviarte notificaciones cuando pasa algo en tus grupos." },
          ],
        },
        {
          tipo: "p",
          texto:
            "No pedimos ni almacenamos tu contraseña: el inicio de sesión lo maneja Google o Apple. Tampoco pedimos datos de tarjetas, porque dentro de la app no se compra nada.",
        },
      ],
    },
    {
      titulo: "Cómo usamos tus datos",
      bloques: [
        {
          tipo: "lista",
          items: [
            "**Autenticación:** para verificar tu identidad y darte acceso a tu cuenta.",
            "**Coordinación:** para mostrar tus listas a los grupos que elegiste y registrar qué ítems ya fueron reservados.",
            "**Notificaciones:** para avisarte cuando alguien te suma a un grupo o cuando se sortea un amigo invisible.",
            "**Historial:** para dejar registro de qué se regaló y cuándo, y que el año siguiente nadie repita.",
          ],
        },
        {
          tipo: "p",
          texto:
            "No vendemos, alquilamos ni compartimos tus datos con terceros para fines publicitarios o comerciales. La app no tiene publicidad.",
        },
      ],
    },
    {
      titulo: "Quién puede ver qué",
      bloques: [
        {
          tipo: "p",
          texto:
            "Es la parte central de GiftSquad, y está garantizada por las reglas de seguridad del servidor, no solamente por la interfaz de la app:",
        },
        {
          tipo: "lista",
          items: [
            "Quien recibe un regalo **no puede acceder** a la identidad de quien lo reservó, ni siquiera consultando los datos en crudo.",
            "Quién entregó cada regalo del historial se guarda en una colección aparte, que solo puede leer esa misma persona.",
            "En el amigo invisible, cada participante solo puede leer su propia asignación. Ni el organizador del evento ve el sorteo completo.",
            "Las notas privadas de un ítem son visibles solo para el dueño de la lista.",
          ],
        },
      ],
    },
    {
      titulo: "Terceros que intervienen",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad se apoya en los siguientes servicios externos, cada uno con su propia política de privacidad:",
        },
        {
          tipo: "tabla",
          filas: [
            {
              clave: "Firebase / Google",
              valor:
                "Autenticación, base de datos Firestore, almacenamiento de imágenes y envío de notificaciones. Datos alojados en servidores de Google.",
            },
            { clave: "Apple", valor: "Inicio de sesión con Apple y distribución de la app a través del App Store." },
            {
              clave: "Tiendas online",
              valor:
                "Cuando pegás el link de un producto, consultamos esa página para traer el título, la imagen y el precio.",
            },
          ],
        },
        { tipo: "p", texto: "Cada uno recibe solo los datos estrictamente necesarios para cumplir su función." },
      ],
    },
    {
      titulo: "Links a tiendas y precios",
      bloques: [
        {
          tipo: "p",
          texto:
            "La consulta que hace la app a la tienda es **anónima**: no se le envía ningún dato tuyo, ni tu cuenta, ni tu ubicación. La tienda solo ve un pedido de la página del producto.",
        },
        {
          tipo: "nota",
          texto:
            "Los precios que trae la app son orientativos. Provienen de la tienda en el momento en que cargás el link y pueden variar según el país de entrega y los impuestos que apliquen. Para el precio definitivo, siempre vale el de la tienda al momento de comprar.",
        },
      ],
    },
    {
      titulo: "Retención y eliminación",
      bloques: [
        {
          tipo: "p",
          texto:
            "Tus datos se conservan mientras tengas una cuenta activa. Podés pedir la eliminación de tu cuenta y de todo su contenido escribiéndonos a {email}.",
        },
        {
          tipo: "p",
          texto:
            "La eliminación incluye tus listas e ítems, tus grupos, tus reservas, tus notas privadas, las imágenes que hayas subido y tu usuario de autenticación. Es permanente e irreversible.",
        },
      ],
    },
    {
      titulo: "Transferencias internacionales de datos",
      bloques: [
        {
          tipo: "p",
          texto:
            "Tus datos se almacenan en servidores de Google (Firebase) ubicados fuera de tu país de residencia, principalmente en Estados Unidos. Al usar la app prestás tu conformidad para esa transferencia.",
        },
      ],
    },
    {
      titulo: "Seguridad",
      bloques: [
        {
          tipo: "lista",
          items: [
            "Todas las comunicaciones entre la app y Firebase van cifradas con TLS.",
            "Las reglas de seguridad de Firestore garantizan que cada usuario solo puede leer y modificar lo que le corresponde.",
            "Firebase App Check (App Attest en producción) impide que un cliente que no sea la app legítima acceda a los datos.",
            "El sorteo del amigo invisible se ejecuta en el servidor, para que el resultado no pueda deducirse desde el dispositivo.",
          ],
        },
      ],
    },
    {
      titulo: "Privacidad de menores",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad no está dirigida a personas menores de 13 años. No recopilamos intencionalmente datos de menores. Si creés que un menor registró una cuenta, escribinos a {email} y la eliminamos.",
        },
      ],
    },
    {
      titulo: "Cambios en esta política",
      bloques: [
        {
          tipo: "p",
          texto:
            "Podemos actualizar esta política ante cambios en la app o requerimientos legales. Los cambios importantes se notifican dentro de la app, y la fecha de última actualización siempre está visible al inicio de esta página.",
        },
      ],
    },
    {
      titulo: "Contacto",
      bloques: [
        {
          tipo: "p",
          texto:
            "Para consultas sobre privacidad o para ejercer tus derechos de acceso, rectificación o eliminación de datos: {email}",
        },
      ],
    },
  ],
};

export const terminos = {
  etiqueta: "Términos",
  titulo: "Términos y condiciones",
  intro:
    "Al descargar, instalar o usar GiftSquad, aceptás estos términos y condiciones. Leelos con atención antes de utilizar la aplicación.",
  secciones: [
    {
      titulo: "Descripción del servicio",
      bloques: [
        { tipo: "p", texto: "GiftSquad es una app gratuita para iOS que permite:" },
        {
          tipo: "lista",
          items: [
            "Armar listas de regalos cargando links de tiendas online.",
            "Compartir esas listas con grupos de familia, amigos o trabajo.",
            "Reservar un regalo de forma anónima, para que nadie repita y el destinatario no sepa quién lo reservó.",
            "Organizar un amigo invisible con sorteo automático y exclusiones.",
            "Recibir avisos cuando hay novedades en sus grupos.",
          ],
        },
        {
          tipo: "nota",
          texto:
            "GiftSquad **no vende productos ni procesa pagos**. Es una herramienta de coordinación: la compra siempre ocurre en la tienda que elijas, bajo sus propios términos.",
        },
      ],
    },
    {
      titulo: "Elegibilidad",
      bloques: [
        { tipo: "p", texto: "Para usar GiftSquad debés:" },
        {
          tipo: "lista",
          items: [
            "Tener al menos 13 años de edad.",
            "Proporcionar información de registro veraz y actualizada.",
            "Tener un dispositivo iOS compatible y conexión a internet.",
          ],
        },
      ],
    },
    {
      titulo: "Tu cuenta",
      bloques: [
        {
          tipo: "p",
          texto:
            "El acceso se hace con tu cuenta de Google o de Apple. Sos responsable de la actividad que ocurra desde tu cuenta y de mantener seguro el acceso al proveedor que uses para entrar.",
        },
        { tipo: "p", texto: "Si sospechás que tu cuenta fue comprometida, escribinos a {email}." },
      ],
    },
    {
      titulo: "Uso aceptable",
      bloques: [
        { tipo: "p", texto: "Queda prohibido usar GiftSquad para:" },
        {
          tipo: "lista",
          items: [
            "Suplantar la identidad de otra persona.",
            "Sumar a personas a un grupo con el fin de hostigarlas.",
            "Subir contenido ilegal, ofensivo o que vulnere derechos de terceros.",
            "Intentar acceder a las cuentas, listas o reservas de otros usuarios.",
            "Intentar deducir por medios técnicos quién reservó un regalo de tu propia lista.",
            "Realizar cualquier actividad contraria a las leyes vigentes.",
          ],
        },
        {
          tipo: "p",
          texto: "Nos reservamos el derecho de suspender o eliminar cuentas que violen estas condiciones.",
        },
      ],
    },
    {
      titulo: "Contenido que subís",
      bloques: [
        {
          tipo: "p",
          texto:
            "Al cargar ítems, textos o imágenes mantenés la propiedad de ese contenido, y nos otorgás una licencia limitada para almacenarlo y mostrarlo a los grupos que vos hayas elegido.",
        },
        {
          tipo: "p",
          texto:
            "Declarás que tenés derecho a usar el contenido que subas y que no infringe derechos de terceros.",
        },
      ],
    },
    {
      titulo: "Links, precios y marcas de terceros",
      bloques: [
        {
          tipo: "p",
          texto:
            "Los precios que muestra la app son una referencia tomada automáticamente de la tienda al momento de cargar el link. Pueden estar desactualizados o diferir según tu país de entrega y los impuestos que apliquen.",
        },
        {
          tipo: "p",
          texto:
            "Los nombres de tiendas y productos pertenecen a sus respectivos titulares. GiftSquad no está asociada, patrocinada ni avalada por ninguna de ellas, ni participa de la relación comercial entre vos y la tienda.",
        },
      ],
    },
    {
      titulo: "Disponibilidad del servicio",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad depende de servicios de terceros (Firebase, Apple) y de la conectividad de tu dispositivo. No garantizamos disponibilidad ininterrumpida. Pueden ocurrir interrupciones por mantenimiento, actualizaciones o factores fuera de nuestro control.",
        },
      ],
    },
    {
      titulo: "Propiedad intelectual",
      bloques: [
        {
          tipo: "p",
          texto:
            "GiftSquad y todo su contenido (diseño, código, marca, textos e imágenes) son propiedad de {autor}. No podés copiar, modificar, distribuir ni crear obras derivadas sin autorización escrita expresa.",
        },
      ],
    },
    {
      titulo: "Limitación de responsabilidad",
      bloques: [
        { tipo: "p", texto: "En la máxima medida permitida por la ley:" },
        {
          tipo: "lista",
          items: [
            "GiftSquad se provee «tal como está», sin garantías de ningún tipo.",
            "No somos responsables por la calidad, la entrega ni la disponibilidad de los productos que figuren en las listas.",
            "No somos responsables por acuerdos entre usuarios respecto de los regalos, que ocurren por fuera de la app.",
            "No somos responsables por daños directos, indirectos o incidentales derivados del uso o la imposibilidad de uso de la app.",
          ],
        },
      ],
    },
    {
      titulo: "Eliminación de cuenta",
      bloques: [
        {
          tipo: "p",
          texto:
            "Podés pedir la eliminación de tu cuenta y de todos tus datos en cualquier momento escribiéndonos a {email}. La eliminación es permanente e irreversible: una vez hecha, no podemos recuperar ningún dato asociado.",
        },
      ],
    },
    {
      titulo: "Licencia de Apple",
      bloques: [
        {
          tipo: "p",
          texto:
            "Este acuerdo complementa, y no reemplaza, los términos del Contrato de Licencia de Aplicaciones Estándar de Apple (Standard Licensed Application End User License Agreement).",
        },
      ],
    },
    {
      titulo: "Modificaciones",
      bloques: [
        {
          tipo: "p",
          texto:
            "Podemos modificar estos términos en cualquier momento. Los cambios significativos se notifican dentro de la app. El uso continuado de GiftSquad después de publicados los cambios implica su aceptación.",
        },
      ],
    },
    {
      titulo: "Legislación aplicable",
      bloques: [
        {
          tipo: "p",
          texto:
            "Estos términos se rigen por las leyes de la República Argentina, con foro en la Ciudad Autónoma de Buenos Aires.",
        },
      ],
    },
    {
      titulo: "Contacto",
      bloques: [{ tipo: "p", texto: "Para consultas sobre estos términos: {email}" }],
    },
  ],
};
