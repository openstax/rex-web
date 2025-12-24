/* eslint-disable max-len */
export const defaultText = `
<p>Este libro no puede ser utilizado en la formación de grandes modelos de lenguaje ni incorporado de otra manera en grandes modelos de lenguaje u ofertas de IA generativa sin el permiso de OpenStax.</p>
<p>
  ¿Desea citar, compartir o modificar este libro? Este libro utiliza la <a target="_blank" rel="noopener" href="{bookLicenseUrl}">
    {bookLicenseName} {bookLicenseVersion}
  </a> y debe atribuir a {copyrightHolder}.{originalMaterialLink, select,
    null {}
    other { El material original está disponible en: <a target="_blank" rel="noopener" href="{originalMaterialLink}">
      {originalMaterialLink}
    </a>.}
  }{copyrightHolder, select,
    OpenStax {}
    other { Se realizaron cambios en el material original, incluidas actualizaciones de arte, estructura y otras actualizaciones de contenido.}}
</p>

<strong>Información de atribución</strong>
<ul>
  <li>
    Si redistribuye todo o parte de este libro en formato impreso, debe incluir en cada página física la siguiente atribución:
    <blockquote>
    Acceso gratis en https://openstax.org{introPageUrl}
    </blockquote>
  </li>
  <li>
    Si redistribuye todo o parte de este libro en formato digital, debe incluir en cada vista de la página digital la siguiente atribución:
    <blockquote>
      Acceso gratuito en <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
    </blockquote>
  </li>
</ul>

<strong>Información sobre citas</strong>
<ul>
  <li>
    Utilice la siguiente información para crear una cita. Recomendamos utilizar una
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
    other {}}<strong>El nombre de OpenStax, el logotipo de OpenStax, las portadas de libros de OpenStax, el nombre de OpenStax CNX y el logotipo de OpenStax CNX no están sujetos a la licencia de Creative Commons y no se pueden reproducir sin el previo y expreso consentimiento por escrito de Rice University.</strong>
</p>
`;
