/* eslint-disable max-len */
export const defaultText = `
<strong role="heading" aria-level="3">Ponowne wykorzystanie i redystrybucja tej treści w formacie cyfrowym lub drukowanym:</strong>
<ul>
  <li>
    Ten podręcznik nie może być wykorzystywany do trenowania dużych modeli językowych ani w żaden inny sposób przetwarzany przez duże modele językowe lub rozwiązania generatywnej sztucznej inteligencji bez uprzedniej pisemnej zgody OpenStax.
  </li>
  <li>
    Ten podręcznik jest wydany na licencji
    <a target="_blank" rel="noopener" href="{bookLicenseUrl}">
      {bookLicenseName}{bookLicenseVersion}
    </a>, co oznacza, że możesz ponownie wykorzystywać i modyfikować materiał wyłącznie w celach niekomercyjnych, musisz uznać autorstwo {copyrightHolder} oraz musisz rozpowszechniać wszelkie utwory zależne na tej samej licencji.{originalMaterialLink, select,
      null {}
      other { Oryginalna publikacja jest dostępna na: <a target="_blank" rel="noopener" href="{originalMaterialLink}">
        {originalMaterialLink}
      </a>.}
    }{copyrightHolder, select,
      OpenStax {}
      other { Wprowadzono modyfikacje oryginalnej publikacji, w tym aktualizacje ilustracji, struktury i treści.}}
  </li>
  <li>
    Jakikolwiek komercyjny druk tego podręcznika, w tym z wykorzystaniem lokalnej lub niestandardowej drukarni, wymaga zgody OpenStax oraz podania odpowiedniego cytowania.
  </li>
  <li>
    Obrazy, aktywności, testy i podobne elementy tego podręcznika objęte prawami autorskimi OpenStax podlegają tej samej licencji – CC-BY-NC-SA. Mogą być wykorzystywane w celach niekomercyjnych z uznaniem autorstwa. Użycie komercyjne wymaga zgody.
  </li>
  <li>
    <strong>Prośby o zgodę:</strong> Każdy, kto zamierza włączyć tę treść (w tym tekst, obrazy i inne elementy) do dużych modeli językowych, wykorzystać ją w rozwiązaniach opartych na sztucznej inteligencji, użyć jej komercyjnie (w tym w druku) i/lub ma pytania dotyczące innego przypadku użycia, może skorzystać z naszego
    <a target="_blank" rel="noopener" href="{permissionRequestUrl}">
      formularza wniosku o ponowne wykorzystanie</a>.
  </li>
</ul>

<strong>Cytowanie i udostępnienia</strong>
<ul>
  <li>
Jeśli rozpowszechniasz tę książkę w formie drukowanej w celach niekomercyjnych, umieść na każdej jej kartce informację:
    <blockquote>
Treści dostępne za darmo na https://openstax.org{introPageUrl}
    </blockquote>
  </li>
  <li>

Jeśli rozpowszechniasz całą książkę lub jej fragment w formacie cyfrowym w celach niekomercyjnych, dla każdej strony zawierającej treści OpenStax musisz udostępnić utwór zależny na tej samej licencji CC-BY-NC-SA co oryginał oraz na każdym widoku strony umieścić informację:
    <blockquote>
  Treści dostępne za darmo na <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
    </blockquote>
  </li>
</ul>

<strong> Cytowanie</strong>
<ul>
  <li>
Poniższe informacje zawierają dane potrzebne do utworzenia cytowania w większości głównych stylów (APA, MLA itp.); musisz przeformatować i zorganizować te informacje zgodnie z wymaganiami danego stylu. Jeśli chcesz zacytować tę książkę, skorzystaj z dostępnych narzędzi do tworzenia wpisów bibliograficznych, jak np.:
    <a target="_blank" rel="noopener" href="https://www.lib.ncsu.edu/citationbuilder/#/default/default">ten</a>.
    <ul>
      <li>
    Autorzy: {bookAuthors}
      </li>
      <li>
     Wydawca/strona internetowa: OpenStax Poland
      </li>
      <li>
     Tytuł książki: {bookTitle}
      </li>
      <li>
        Data publikacji: {bookPublishDate, date, medium}
      </li>
      <li>
     Miejscowość: Warszawa
      </li>
      <li>
     URL książki: <a href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
      </li>
      <li>
      URL fragmentu: <a href="https://openstax.org{currentPath}">https://openstax.org{currentPath}</a>
      </li>
    </ul>
  </li>
</ul>

<p>
  © {bookLatestRevision, date, medium} {copyrightHolder}. {copyrightHolder, select,
    OpenStax {Treść książki została wytworzona przez OpenStax na licencji {bookLicenseName}{bookLicenseVersion}. }
    other {}}<strong> Nazwa OpenStax, logo OpenStax, okładki OpenStax, nazwa OpenStax CNX oraz OpenStax CNX logo,
 jak również nazwa i logo Rice University oraz powiązane znaki towarowe i słowne, nie podlegają licencji Creative Commons
 i wykorzystanie ich jest dozwolone wyłącznie na mocy uprzedniego pisemnego upoważnienia przez Rice University.</strong>
</p>
`;
