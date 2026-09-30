/* ============================================================
   Publications
   Loads publications.bib and displays APA-style citations
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const publicationList = document.getElementById("publication-list");
  const publicationError = document.getElementById("publication-error");
  const searchInput = document.getElementById("publication-search");
  const publicationCount = document.getElementById("publication-count");

  if (!publicationList) {
    console.error("Publication list element not found.");
    return;
  }

  loadPublications();

  async function loadPublications() {
    try {
      const response = await fetch("publications.bib", {
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(
          `Could not load publications.bib (${response.status})`
        );
      }

      const bibText = await response.text();

      if (!bibText.trim()) {
        throw new Error("publications.bib is empty.");
      }

      const publications = parseBibTeX(bibText);

      if (!publications.length) {
        throw new Error("No publications were found in publications.bib.");
      }

      publications.sort((a, b) => {
        const yearA = parseInt(a.year, 10) || 0;
        const yearB = parseInt(b.year, 10) || 0;

        return yearB - yearA;
      });

      window.allPublications = publications;

      renderPublications(publications);

      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const query = searchInput.value.trim().toLowerCase();

          if (!query) {
            renderPublications(publications);
            return;
          }

          const filtered = publications.filter(publication => {
            const searchableText = [
              publication.title,
              publication.author,
              publication.journal,
              publication.year,
              publication.doi
            ]
              .join(" ")
              .toLowerCase();

            return searchableText.includes(query);
          });

          renderPublications(filtered);
        });
      }

    } catch (error) {
      console.error("Publication loading error:", error);

      publicationList.innerHTML = "";

      if (publicationError) {
        publicationError.hidden = false;
        publicationError.textContent =
          "Unable to load publications. Please check that publications.bib is in the same folder as publications.html.";
      }
    }
  }


  /* ==========================================================
     BIBTEX PARSER
     ========================================================== */

  function parseBibTeX(text) {
    const publications = [];

    /*
     * Match each BibTeX entry.
     *
     * Example:
     *
     * @ARTICLE{Luo2026,
     *   author = {...},
     *   title = {...},
     *   year = {2026},
     *   ...
     * }
     */

    const entryRegex =
      /@([A-Za-z]+)\s*\{\s*([^,]+),([\s\S]*?)\n\s*\}/g;

    let match;

    while ((match = entryRegex.exec(text)) !== null) {
      const entryType = match[1];
      const entryKey = match[2].trim();
      const fieldsText = match[3];

      const fields = {};

      /*
       * Match:
       *
       * field = {value}
       *
       * or
       *
       * field = "value"
       */

      const fieldRegex =
        /([A-Za-z_]+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)")\s*,?/g;

      let fieldMatch;

      while ((fieldMatch = fieldRegex.exec(fieldsText)) !== null) {
        const fieldName = fieldMatch[1].toLowerCase();

        const fieldValue =
          fieldMatch[2] !== undefined
            ? fieldMatch[2]
            : fieldMatch[3];

        fields[fieldName] = cleanBibValue(fieldValue);
      }

      if (fields.title) {
        publications.push({
          key: entryKey,
          type: entryType,
          author: fields.author || "",
          title: fields.title || "",
          year: fields.year || "",
          journal: fields.journal || "",
          volume: fields.volume || "",
          number: fields.number || "",
          pages: fields.pages || "",
          doi: fields.doi || "",
          url: fields.url || ""
        });
      }
    }

    return publications;
  }


  /* ==========================================================
     CLEAN BIBTEX VALUES
     ========================================================== */

  function cleanBibValue(value) {
    return value
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[{}]/g, "")
      .trim();
  }


  /* ==========================================================
     APA AUTHOR FORMAT
     ========================================================== */

  function formatAuthors(authorString) {
    if (!authorString) {
      return "";
    }

    const authors = authorString
      .split(/\s+and\s+/i)
      .map(author => author.trim())
      .filter(Boolean);

    const formattedAuthors = authors.map(formatAuthor);

    if (formattedAuthors.length === 1) {
      return formattedAuthors[0];
    }

    if (formattedAuthors.length === 2) {
      return `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
    }

    return (
      formattedAuthors.slice(0, -1).join(", ") +
      ", & " +
      formattedAuthors[formattedAuthors.length - 1]
    );
  }


  /* ==========================================================
     FORMAT INDIVIDUAL AUTHOR
     ========================================================== */

  function formatAuthor(author) {
    /*
     * BibTeX format:
     *
     * Last, First Middle
     *
     * becomes:
     *
     * Last, F. M.
     */

    if (author.includes(",")) {
      const parts = author.split(",");

      const lastName = parts[0].trim();

      const firstNames = (parts[1] || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const initials = firstNames
        .map(name => {
          const clean = name.replace(/[{}]/g, "");

          return clean ? `${clean.charAt(0).toUpperCase()}.` : "";
        })
        .filter(Boolean)
        .join(" ");

      return initials
        ? `${lastName}, ${initials}`
        : lastName;
    }

    /*
     * Handles names that aren't written as
     * Last, First.
     */

    const parts = author.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0];
    }

    const lastName = parts.pop();

    const initials = parts
      .map(name => `${name.charAt(0).toUpperCase()}.`)
      .join(" ");

    return `${lastName}, ${initials}`;
  }


  /* ==========================================================
     APA CITATION
     ========================================================== */

  function createCitation(publication) {
    const authors = formatAuthors(publication.author);

    let citation = "";

    if (authors) {
      citation += `${escapeHTML(authors)} `;
    }

    if (publication.year) {
      citation += `(${escapeHTML(publication.year)}). `;
    }

    citation += `<span class="publication-title">${escapeHTML(
      publication.title
    )}</span>. `;

    if (publication.journal) {
      citation += `<em class="publication-journal">${escapeHTML(
        publication.journal
      )}</em>`;

      if (publication.volume) {
        citation += `, <em>${escapeHTML(
          publication.volume
        )}</em>`;
      }

      if (publication.number) {
        citation += `(${escapeHTML(
          publication.number
        )})`;
      }

      if (publication.pages) {
        citation += `, ${escapeHTML(
          publication.pages
        )}`;
      }

      citation += ".";
    }

    return citation;
  }


  /* ==========================================================
     RENDER PUBLICATIONS
     ========================================================== */

  function renderPublications(publications) {
    publicationList.innerHTML = "";

    if (!publications.length) {
      publicationList.innerHTML = `
        <p class="publication-empty">
          No publications found.
        </p>
      `;

      if (publicationCount) {
        publicationCount.textContent = "0 publications";
      }

      return;
    }

    if (publicationCount) {
      publicationCount.textContent =
        `${publications.length} publication${
          publications.length === 1 ? "" : "s"
        }`;
    }

    /*
     * Group publications by year
     */

    const grouped = {};

    publications.forEach(publication => {
      const year = publication.year || "Unknown year";

      if (!grouped[year]) {
        grouped[year] = [];
      }

      grouped[year].push(publication);
    });

    const years = Object.keys(grouped).sort((a, b) => {
      const yearA = parseInt(a, 10) || 0;
      const yearB = parseInt(b, 10) || 0;

      return yearB - yearA;
    });


    let publicationNumber = publications.length;

years.forEach(year => {
  const yearHeading = document.createElement("h3");

  yearHeading.className =
    "publication-year-heading";

  yearHeading.textContent = year;

  publicationList.appendChild(yearHeading);

  grouped[year].forEach(publication => {
    const article =
      document.createElement("article");

    article.className =
      "publication-item";

    const numberElement =
      document.createElement("div");

    numberElement.className =
      "publication-number";

    numberElement.textContent =
      `${publicationNumber}.`;

    publicationNumber--;

    const yearElement =
      document.createElement("div");

    yearElement.className =
      "publication-year";

    yearElement.textContent = year;

    const content =
      document.createElement("div");

    content.className =
      "publication-content";

    const citation =
      document.createElement("p");

    citation.className =
      "publication-citation";

    citation.innerHTML =
      createCitation(publication);

    content.appendChild(citation);

    const links =
      document.createElement("div");

    links.className =
      "publication-links";

    if (publication.doi) {
      const doiLink =
        document.createElement("a");

      doiLink.className =
        "publication-link";

      doiLink.href =
        `https://doi.org/${publication.doi}`;

      doiLink.target = "_blank";
      doiLink.rel = "noopener noreferrer";

      doiLink.textContent = "DOI →";

      links.appendChild(doiLink);

    } else if (publication.url) {
      const publicationLink =
        document.createElement("a");

      publicationLink.className =
        "publication-link";

      publicationLink.href =
        publication.url;

      publicationLink.target = "_blank";
      publicationLink.rel =
        "noopener noreferrer";

      publicationLink.textContent =
        "View publication →";

      links.appendChild(publicationLink);
    }

    if (links.children.length > 0) {
      content.appendChild(links);
    }

    article.appendChild(numberElement);
    article.appendChild(yearElement);
    article.appendChild(content);

    publicationList.appendChild(article);
  });
});
  }


  /* ==========================================================
     HTML ESCAPING
     ========================================================== */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
