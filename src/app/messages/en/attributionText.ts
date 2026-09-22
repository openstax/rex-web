/* eslint-disable max-len */
export const defaultText = `
<strong role="heading" aria-level="3">Reuse and redistribution of this content in digital or print format:</strong>
<ul>
  <li>
    This book may not be used in the training of large language models or otherwise be ingested into large language models or generative AI offerings without OpenStax's prior written permission.
  </li>
  <li>
    This book uses the
    <a target="_blank" rel="noopener" href="{bookLicenseUrl}">
      {bookLicenseName}{bookLicenseVersion}</a>, which means that you can reuse and modify the material only for noncommercial purposes, must attribute {copyrightHolder}, and must distribute any derivative works under the same license.{originalMaterialLink, select,
      null {}
      other { The original material is available at: <a target="_blank" rel="noopener" href="{originalMaterialLink}">
        {originalMaterialLink}
      </a>.}
    }{isOpenStaxCopyright, select,
      true {}
      other { Changes were made to the original material, including updates to art, structure, and other content updates.}}
  </li>
  <li>
    Any commercial printing of this textbook, including using a local or custom printer, must be approved by OpenStax, and proper citation provided.
  </li>
  <li>
    OpenStax-copyrighted images, activities, assessments, and similar components of this book are subject to the same licensing – CC-BY-NC-SA. They can be used for noncommercial purposes with attribution. Commercial use requires permission.
  </li>
  <li>
    <strong>Permission requests:</strong> Anyone who intends to incorporate this content (including text, images, and other components) into large language models, use it in AI offerings, use it commercially (including in print), and/or has questions about another use case is welcome to complete our
    <a target="_blank" rel="noopener" href="{permissionRequestUrl}">
      reuse request form</a>.
  </li>
</ul>

<strong role="heading" aria-level="3">Attribution information</strong>
<ul>
  <li>
    If you are redistributing all or part of this book in a noncommercial print format, 
    then you must include on every physical page the following attribution:
    <p>
      Access for free at https://openstax.org{introPageUrl}
    </p>
  </li>
  <li>
    If you are redistributing all or part of this book in a noncommercial digital format, 
    then for every page that includes OpenStax content, you must license the derivative work 
    under the same CC-BY-NC-SA license as the original, and include on every digital page 
    view the following attribution:
    <p>
      Access for free at <a target="_blank" rel="noopener" href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
    </p>
  </li>
</ul>

<strong role="heading" aria-level="3">Citation information</strong>
<p>
  The information below includes the information needed to generate citations in most 
  major styles (APA, MLA, etc.); you must reformat and organize the information as needed 
  to fit the requirements of the style. Use the information below to generate a citation. 
  We recommend using a citation tool such as
  <a target="_blank" rel="noopener" href="https://www.lib.ncsu.edu/citationbuilder/#/default/default">this one</a>.
</p>
<ul>
  <li>
    Authors: {bookAuthors}
  </li>
  <li>
    Publisher/website: OpenStax
  </li>
  <li>
    Book title: {bookTitle}
  </li>
  <li>
    Publication date: {bookPublishDate, date, medium}
  </li>
  <li>
    Location: Houston, Texas
  </li>
  <li>
    Book URL: <a target="_blank" rel="noopener" href="https://openstax.org{introPageUrl}">https://openstax.org{introPageUrl}</a>
  </li>
  <li>
    Section URL: <a target="_blank" rel="noopener" href="https://openstax.org{currentPath}">https://openstax.org{currentPath}</a>
  </li>
</ul>

<p>
  © {bookLatestRevision, date, medium} {copyrightHolder}. {isOpenStaxCopyright, select,
    true {Textbook content produced by OpenStax is licensed under a {bookLicenseName}{bookLicenseVersion}. }
    other {}}<strong>The OpenStax name, OpenStax logo, OpenStax book covers, OpenStax CNX name, and OpenStax CNX logo, 
    and Rice University name, and Rice University logo trademarks, or wordmarks are not subject to the Creative 
    Commons license and may not be reproduced without the prior and express written consent of Rice University.</strong>
</p>
`;
