/* eslint-disable max-len */
export const defaultText = `
<strong role="heading" aria-level="3">Reutilización y redistribución de este contenido en formato digital o impreso:</strong>
<ul>
  <li>
    Este libro no puede ser utilizado en la formación de grandes modelos de lenguaje ni incorporado de otra manera en grandes modelos de lenguaje u ofertas de IA generativa sin el permiso previo por escrito de OpenStax.
  </li>
  <li>
    Este libro utiliza la <a target="_blank" rel="noopener" href="{bookLicenseUrl}">
      {bookLicenseName} {bookLicenseVersion}
    </a>, lo que significa que puede reutilizar y modificar el material únicamente con fines no comerciales, debe atribuir a {copyrightHolder} y debe distribuir cualquier obra derivada bajo la misma licencia.{originalMaterialLink, select,
      null {}
      other { El material original está disponible en: <a target="_blank" rel="noopener" href="{originalMaterialLink}">
        {originalMaterialLink}
      </a>.}
    }{copyrightHolder, select,
      OpenStax {}
      other { Se realizaron cambios en el material original, incluidas actualizaciones de arte, estructura y otras actualizaciones de contenido.}}
  </li>
  <li>
    Cualquier impresión comercial de este libro de texto, incluido el uso de una impresora local o personalizada, debe ser aprobada por OpenStax y proporcionarse la cita adecuada.
  </li>
  <li>
    Las imágenes, actividades, evaluaciones y componentes similares de este libro protegidos por derechos de autor de OpenStax están sujetos a la misma licencia: CC-BY-NC-SA. Pueden utilizarse con fines no comerciales siempre que se otorgue el crédito correspondiente. El uso comercial requiere autorización.
  </li>
  <li>
    <strong>Solicitudes de permiso:</strong>: Cualquier persona que desee incorporar este contenido (incluidos texto, imágenes y otros componentes) a grandes modelos de lenguaje o LLMs, utilizarlo en productos o servicios de IA, emplearlo con fines comerciales (incluso en formato impreso) o que tenga preguntas sobre otro caso de uso, puede completar nuestro 
    <a target="_blank" rel="noopener" href="{permissionRequestUrl}">
      formulario de solicitud de reutilización
    </a>.
  </li>
</ul>

<strong>Información de atribución</strong>
<ul>
  <li>
    Si redistribuye todo o parte de este libro en formato impreso sin fines comerciales, debe incluir en cada página física la siguiente atribución:
    <blockquote>
    Acceso gratis en https://openstax.org{introPageUrl}
    </blockquote>
  </li>
  <li>
    Si redistribuye todo o parte de este libro en formato digital sin fines comerciales, entonces por cada página que incluya contenido de OpenStax, debe licenciar la obra derivada bajo la misma licencia CC-BY-NC-SA que la original e incluir en cada vista de la página digital la siguiente atribución:
    <blockquote>
      Acceso gratuito en <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
    </blockquote>
  </li>
  
</ul>

<strong>Información sobre citas</strong>
<ul>
  <li>
    La siguiente información incluye los detalles necesarios para crear una cita utilizando los estilos principales (APA, MLA, etc.). Debe reformatear y organizar la información según sea necesario para cumplir con los requisitos del estilo. Utilice la información que aparece a continuación para generar una cita. Recomendamos utilizar una
    herramienta de citas como
    <a target="_blank" rel="noopener" href="https://www.lib.ncsu.edu/citationbuilder/#/default/default">this one</a>.
    <ul>
      <li>
        Autores: {bookAuthors}
      </li>
      <li>
        Editorial/sitio web: OpenStax
      </li>
      <li>
        Título del libro: {bookTitle}
      </li>
      <li>
        Fecha de publicación: {bookPublishDate, date, medium}
      </li>
      <li>
        Ubicación: Houston, Texas
      </li>
      <li>
        URL del libro: <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
      </li>
      <li>
        URL de la sección: <a href="https://openstax.org{currentPath}">https://openstax.org{currentPath}</a>
      </li>
    </ul>
  </li>
</ul>

<p>
  © {bookLatestRevision, date, medium} {copyrightHolder}. {copyrightHolder, select,
    OpenStax {El contenido de los libros de texto que produce OpenStax tiene una licencia de {bookLicenseName} {bookLicenseVersion}. }
    other {}}<strong>El nombre de OpenStax, el logotipo de OpenStax, las portadas de libros de OpenStax, el nombre de OpenStax CNX y el logotipo de OpenStax CNX, así como el nombre y el logotipo de Rice University (incluidas sus marcas denominativas), no están sujetos a la licencia de Creative Commons y no se pueden reproducir sin el previo y expreso consentimiento por escrito de Rice University.</strong>
</p>
`;
