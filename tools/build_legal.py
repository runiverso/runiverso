"""Páginas legales: /privacidad/ y /condiciones/. Uso: python3 tools/build_legal.py"""
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import build_seo as B

B.REVISADO = "5 de noviembre de 2026"
FORM = B.FORM

PRIV = f"""
  <section class="box"><h2>Quién es el responsable</h2><p>Runiverso (runiverso.com) es un proyecto independiente de información sobre carreras de running en España. Para cualquier duda sobre tus datos escríbenos a <a href="mailto:hola@runiverso.com">hola@runiverso.com</a>.</p></section>
  <section class="box"><h2>Qué datos guardamos</h2><ul>
    <li><b>Si solo visitas la web o usas la app sin cuenta:</b> no te pedimos ningún dato. Lo que guardas en la app (marcas, carreras apuntadas, tu zona) se queda en tu móvil. Usamos una analítica de Cloudflare sin cookies que solo cuenta visitas.</li>
    <li><b>Si creas una cuenta:</b> tu correo electrónico, el nombre que elijas, tu provincia y comunidad, y los datos que añadas tú: marcas (carrera, distancia, tiempo y fecha) y carreras a las que te apuntas. Si entras con Google, recibimos de Google solo tu nombre, tu correo y tu foto de perfil.</li>
    <li><b>Ranking:</b> solo apareces si lo activas tú. En ese caso se muestran tu nombre, tu club (si lo pones) y el número de carreras y kilómetros de la temporada.</li>
  </ul></section>
  <section class="box"><h2>Comunidad: qué ven los demás</h2><p>Si usas la comunidad de la app, los demás corredores con cuenta pueden ver tu <b>nombre</b> y tu <b>provincia</b>, a quién sigues y quién te sigue, los clubes de los que formas parte y lo que publiques en el muro (texto, fotos y reacciones). También tu foto de perfil y tus comentarios. Tus marcas solo se ven si activas «Aparecer en el ranking»; con esa misma opción apareces con tu nombre en «¿Quién va?» de las carreras a las que te apuntes (sin ella solo cuentas en el total). Las fotos del muro se guardan en Supabase y cualquiera que tenga su enlace puede abrirlas. Puedes borrar tus publicaciones cuando quieras; al eliminar tu cuenta se borran tus publicaciones, tus reacciones, tus seguidores y tu pertenencia a clubes.</p></section>
  <section class="box"><h2>Para qué los usamos</h2><p>Únicamente para darte el servicio: guardar tus datos en tu cuenta, que los veas en cualquier dispositivo, mandarte los correos de acceso y, si lo activas, mostrarte en el ranking. No vendemos ni cedemos tus datos y no los usamos para publicidad.</p><p>La base legal es tu consentimiento al crear la cuenta y la ejecución del servicio que pides.</p></section>
  <section class="box"><h2>Dónde se guardan</h2><p>Los datos de las cuentas se guardan en <b>Supabase</b>, en servidores de la Unión Europea. Los correos de acceso se envían con <b>Resend</b> (servidor en Irlanda). La web se sirve desde <b>Cloudflare</b>. Si entras con Google, el inicio de sesión lo gestiona <b>Google</b>.</p></section>
  <section class="box"><h2>Cuánto tiempo</h2><p>Mientras tengas la cuenta. Puedes eliminarla tú mismo en la app, en Perfil → «Eliminar mi cuenta»: se borran al momento tu cuenta, tu correo, tu perfil, tus marcas, tus carreras apuntadas y tus avisos. También puedes pedirlo por correo (<a href="../borrar-cuenta/">cómo eliminar tu cuenta</a>).</p></section>
  <section class="box"><h2>Tus derechos</h2><p>Puedes acceder a tus datos, corregirlos, llevártelos o pedir que los borremos, y retirar tu consentimiento cuando quieras. Escríbenos a <a href="mailto:hola@runiverso.com">hola@runiverso.com</a> desde el correo de tu cuenta. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p></section>
  <section class="box"><h2>Uso de los datos de Google</h2><p>El uso que hace Runiverso de la información recibida de las API de Google cumple la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">Política de Datos del Usuario de los Servicios de las API de Google</a>, incluidos los requisitos de uso limitado.</p></section>
"""

BORRAR = f"""
  <section class="box"><h2>Desde la app (al momento)</h2><ol>
    <li>Abre la app en <a href="../app/">runiverso.com/app</a> e inicia sesión.</li>
    <li>Ve a la pestaña <b>Perfil</b>.</li>
    <li>En la tarjeta de tu cuenta pulsa <b>Eliminar mi cuenta</b> y confirma.</li>
  </ol><p>Se borran al momento y para siempre tu cuenta, tu correo, tu perfil, tus marcas y medallas, tus carreras apuntadas, tu puesto en el ranking y los avisos en el móvil.</p></section>
  <section class="box"><h2>Por correo (si ya no tienes la app)</h2><p>Escríbenos a <a href="mailto:hola@runiverso.com?subject=Eliminar%20mi%20cuenta">hola@runiverso.com</a> desde el correo con el que creaste la cuenta, con el asunto «Eliminar mi cuenta». La eliminamos en un plazo máximo de 30 días y te confirmamos por correo.</p></section>
  <section class="box"><h2>Qué se conserva</h2><p>Nada de tu cuenta. Si habías reclamado un resultado en una clasificación oficial, ese resultado sigue publicado tal y como lo publica la organización, pero ya no está unido a ti. Más detalles en la <a href="../privacidad/">política de privacidad</a>.</p></section>
"""

COND = f"""
  <section class="box"><h2>Qué es Runiverso</h2><p>Runiverso es un calendario independiente de carreras de running en España, con una app para guardar tus marcas y carreras. No organizamos ninguna carrera ni vendemos inscripciones.</p></section>
  <section class="box"><h2>La información de las carreras</h2><p>Recopilamos fechas, distancias y enlaces de fuentes públicas y de las organizaciones. Pueden cambiar o contener errores: comprueba siempre fecha, precio y plazos en la web oficial antes de inscribirte. Las clasificaciones pertenecen a cada organización y enlazamos a su fuente oficial.</p></section>
  <section class="box"><h2>Tu cuenta</h2><p>La cuenta es gratuita y personal. Eres responsable de los datos que añadas (por ejemplo, tus marcas) y te comprometes a no usar el servicio para fines ilícitos ni a publicar nombres o datos de otras personas sin permiso. Podemos retirar contenido o cuentas que incumplan estas condiciones.</p></section>
  <section class="box"><h2>Normas del muro y los clubes</h2><p>Publica solo contenido tuyo o con permiso de quien aparece, y relacionado con correr. No se permite contenido ofensivo, de odio, sexual, violento, publicidad no deseada ni datos personales de terceros. Cualquier publicación se puede denunciar desde la app (menú «⋯»): las denunciadas se ocultan y las revisamos, y podemos retirar contenido o cuentas que incumplan estas normas. Los clubes deben ser clubes o grupos reales y los crea alguien que los representa. Para avisarnos de cualquier contenido: <a href="mailto:hola@runiverso.com">hola@runiverso.com</a>.</p></section>
  <section class="box"><h2>Cambios y contacto</h2><p>Podemos actualizar estas condiciones; la versión vigente es siempre la de esta página. Para cualquier duda, escríbenos a <a href="mailto:hola@runiverso.com">hola@runiverso.com</a>. Consulta también nuestra <a href="../privacidad/">política de privacidad</a>.</p></section>
"""

for path, title, h1, desc, body in [
    ("privacidad", "Política de privacidad · Runiverso", "Política de privacidad", "Qué datos guarda Runiverso, para qué y cómo ejercer tus derechos.", PRIV),
    ("condiciones", "Condiciones de uso · Runiverso", "Condiciones de uso", "Condiciones de uso de la web y la app de Runiverso.", COND),
    ("borrar-cuenta", "Eliminar tu cuenta · Runiverso", "Eliminar tu cuenta", "Cómo eliminar tu cuenta de Runiverso y todos tus datos, desde la app o por correo.", BORRAR),
]:
    rel = "../"
    url = f"{B.SITE}/{path}/"
    ld = {"@context": "https://schema.org", "@graph": [B.crumbs_ld([(h1, f"{path}/")])]}
    html = B.head(rel, title, desc, url, "https://runiverso.com/og.png", "Runiverso", ld)
    html += f"""  {B.crumbs(rel, [(h1, None)])}
  <header class="hero"><span class="kicker">Runiverso</span><h1>{h1}</h1><div class="lanes" aria-hidden="true"></div></header>
  <p class="muted">Última actualización: {B.REVISADO}.</p>
{body}
  {B.footer()}
"""
    html += B.TAIL
    out = ROOT / path
    out.mkdir(exist_ok=True)
    (out / "index.html").write_text(html)
    print("ok", path)
