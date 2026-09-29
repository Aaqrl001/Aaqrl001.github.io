document.addEventListener("DOMContentLoaded", () => {
  const BIB_FILE = "publications.bib";

  const publicationList = document.getElementById("publication-list");
  const publicationSearch = document.getElementById("publication-search");
  const publicationCount = document.getElementById("publication-count");

  let publications = [];

  // ---------------------------------------------------------
  // Load BibTeX
  // ---------------------------------------------------------

  fetch(BIB_FILE)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Unable to load ${BIB_FILE}`);
      }

      return response.text();
    })
    .then(bibText => {
      publications = parseBibTeX(bibText);

      publications.sort((a, b) => {
        const yearDifference =
          Number(b.year || 0) - Number(a.year || 0);

        if (yearDifference !== 0) {
          return yearDifference;
        }

        return getFirstAuthor(a.author)
          .localeCompare(getFirstAuthor(b.author));
      });

      displayPublications(publications);
    })
    .catch(error => {
      console.error(error);

      publicationList.innerHTML = `
        <p class="publication-error">
          Unable to load publications.
        </p>
      `;
    });


  // ---------------------------------------------------------
  // Parse BibTeX
  // ---------------------------------------------------------

  function parseBibTeX(text) {
    const entries = [];

    const entryPattern =
      /@ARTICLE\s*\{\s*([^,]+),([\s\S]*?)\n\}/gi;

    let match;

    while ((match = entryPattern.exec(text)) !== null) {
      const key = match[1].trim();
      const fields = parseFields(match[2]);

      entries.push({
        key,
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

    return entries;
  }


  // ---------------------------------------------------------
  // Parse individual BibTeX fields
  // ---------------------------------------------------------

  function parseFields(text) {
    const fields = {};

    const fieldPattern =
      /(\w+)\s*=\s*\{([\s\S]*?)\}\s*,?/g;

    let match;

    while ((match = fieldPattern.exec(text)) !== null) {
      const field = match[1].toLowerCase();
      const value = cleanValue(match[2]);

      fields[field] = value;
    }

    return fields;
  }


  // ---------------------------------------------------------
  // Clean BibTeX values
  // ---------------------------------------------------------

  function cleanValue(value) {
    return value
      .replace(/\{([^{}]*)\}/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }


  // ---------------------------------------------------------
  // Display publications
  // ---------------------------------------------------------

  function displayPublications(items) {
    publicationList.innerHTML = "";

    if (items.length === 0) {
      publicationList.innerHTML =
        "<p>No publications found.</p>";

      updateCount(0);
      return;
    }

    const grouped = groupByYear(items);

    Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .forEach(year => {

        const yearSection =
          document.createElement("section");

        yearSection.className =
          "publication-year-group";


        const yearHeading =
          document.createElement("h3");

        yearHeading.className =
          "publication-year-heading";

        yearHeading.textContent = year;


        yearSection.appendChild(yearHeading);


        grouped[year].forEach(publication => {

          const article =
            createPublication(publication);

          yearSection.appendChild(article);

        });


        publicationList.appendChild(yearSection);
      });


    updateCount(items.length);
  }


  // ---------------------------------------------------------
  // Group publications by year
  // ---------------------------------------------------------

  function groupByYear(items) {
    return items.reduce((groups, publication) => {

      const year = publication.year || "Other";

      if (!groups[year]) {
        groups[year] = [];
      }

      groups[year].push(publication);

      return groups;

    }, {});
  }


  // ---------------------------------------------------------
  // Create publication HTML
  // ---------------------------------------------------------

  function createPublication(publication) {
    const article =
      document.createElement("article");

    article.className =
      "publication-item";


    const citation =
      document.createElement("div");

    citation.className =
      "publication-citation";

    citation.innerHTML =
      formatAPA(publication);


    article.appendChild(citation);


    const link =
      getPublicationLink(publication);

    if (link) {

      const linkContainer =
        document.createElement("div");

      linkContainer.className =
        "publication-link-wrapper";


      const anchor =
        document.createElement("a");

      anchor.href = link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "research-card-link";

      anchor.textContent =
        "View publication →";


      linkContainer.appendChild(anchor);

      article.appendChild(linkContainer);
    }


    // Store searchable text
    article.dataset.search =
      [
        publication.author,
        publication.title,
        publication.journal,
        publication.year
      ]
        .join(" ")
        .toLowerCase();


    return article;
  }


  // ---------------------------------------------------------
  // APA formatting
  // ---------------------------------------------------------

  function formatAPA(publication) {
    const authors =
      formatAuthors(publication.author);

    const year =
      publication.year || "n.d.";

    const title =
      sentenceCase(publication.title);


    let citation = "";


    // Authors
    if (authors) {
      citation += `${escapeHTML(authors)} `;
    }


    // Year
    citation += `(${escapeHTML(year)}). `;


    // Article title
    citation +=
      `${escapeHTML(title)}. `;


    // Journal
    if (publication.journal) {
      citation +=
        `<em>${escapeHTML(publication.journal)}</em>`;
    }


    // Volume
    if (publication.volume) {
      citation +=
        `, <em>${escapeHTML(publication.volume)}</em>`;
    }


    // Issue
    if (publication.number) {
      citation +=
        `(${escapeHTML(publication.number)})`;
    }


    // Pages
    if (publication.pages) {
      citation +=
        `, ${escapeHTML(normalizePages(publication.pages))}`;
    }


    citation += ".";


    return citation;
  }


  // ---------------------------------------------------------
  // APA author formatting
  // ---------------------------------------------------------

  function formatAuthors(authorString) {
    if (!authorString) {
      return "";
    }


    const authors =
      authorString
        .split(/\s+and\s+/i)
        .map(parseAuthor)
        .filter(Boolean);


    if (authors.length === 0) {
      return "";
    }


    const formatted =
      authors.map(author => {

        return `${author.lastName}, ${author.initials}`;

      });


    // APA 7: up to 20 authors
    if (formatted.length <= 20) {

      if (formatted.length === 1) {
        return formatted[0];
      }

      if (formatted.length === 2) {
        return `${formatted[0]} & ${formatted[1]}`;
      }

      return (
        formatted.slice(0, -1).join(", ") +
        ", & " +
        formatted[formatted.length - 1]
      );
    }


    // APA 7: 21+ authors
    return (
      formatted.slice(0, 19).join(", ") +
      ", ... " +
      formatted[formatted.length - 1]
    );
  }


  // ---------------------------------------------------------
  // Parse one author
  // ---------------------------------------------------------

  function parseAuthor(author) {
    author = author.trim();

    if (!author) {
      return null;
    }


    let lastName;
    let firstNames;


    if (author.includes(",")) {

      const parts =
        author.split(",");

      lastName =
        parts[0].trim();

      firstNames =
        parts.slice(1).join(" ").trim();

    } else {

      const parts =
        author.split(/\s+/);

      lastName =
        parts.pop();

      firstNames =
        parts.join(" ");
    }


    return {
      lastName,
      initials: makeInitials(firstNames)
    };
  }


  // ---------------------------------------------------------
  // Convert first/middle names to initials
  // ---------------------------------------------------------

  function makeInitials(name) {
    if (!name) {
      return "";
    }


    return name
      .replace(/[{}]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map(part => {

        // Carey-Ann → C.-A.
        if (part.includes("-")) {

          return part
            .split("-")
            .filter(Boolean)
            .map(piece =>
              `${piece.charAt(0).toUpperCase()}.`
            )
            .join("-");
        }


        return `${part.charAt(0).toUpperCase()}.`;

      })
      .join(" ");
  }


  // ---------------------------------------------------------
  // Convert article title to sentence case
  // ---------------------------------------------------------

  function sentenceCase(title) {
    if (!title) {
      return "";
    }


    title = title
      .replace(/[{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();


    const words =
      title.toLowerCase().split(" ");


    return words
      .map((word, index) => {

        // Preserve obvious acronyms
        if (
          word.length > 1 &&
          word === word.toUpperCase()
        ) {
          return word;
        }


        if (index === 0) {
          return (
            word.charAt(0).toUpperCase() +
            word.slice(1)
          );
        }


        return word;
      })
      .join(" ");
  }


  // ---------------------------------------------------------
  // Normalize page numbers
  // ---------------------------------------------------------

  function normalizePages(pages) {
    return pages
      .replace(/\s*[–—-]\s*/g, "–")
      .trim();
  }


  // ---------------------------------------------------------
  // DOI / URL
  // ---------------------------------------------------------

  function getPublicationLink(publication) {

    if (publication.doi) {

      const doi =
        publication.doi
          .replace(/^https?:\/\/doi\.org\//i, "")
          .replace(/^doi:\s*/i, "")
          .trim();


      return `https://doi.org/${encodeURIComponent(doi)}`;
    }


    if (publication.url) {
      return publication.url;
    }


    return null;
  }


  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------

  if (publicationSearch) {

    publicationSearch.addEventListener(
      "input",
      () => {

        const query =
          publicationSearch.value
            .trim()
            .toLowerCase();


        const articles =
          publicationList.querySelectorAll(
            ".publication-item"
          );


        let visible = 0;


        articles.forEach(article => {

          const matches =
            !query ||
            article.dataset.search.includes(query);


          article.hidden =
            !matches;


          if (matches) {
            visible++;
          }
        });


        // Hide empty year sections
        const yearSections =
          publicationList.querySelectorAll(
            ".publication-year-group"
          );


        yearSections.forEach(section => {

          const visibleArticles =
            section.querySelectorAll(
              ".publication-item:not([hidden])"
            );


          section.hidden =
            visibleArticles.length === 0;
        });


        updateCount(visible, query);
      }
    );
  }


  // ---------------------------------------------------------
  // Publication count
  // ---------------------------------------------------------

  function updateCount(count, search = "") {

    if (!publicationCount) {
      return;
    }


    publicationCount.textContent =
      search
        ? `${count} publication${count === 1 ? "" : "s"} found`
        : `${count} publication${count === 1 ? "" : "s"}`;
  }


  // ---------------------------------------------------------
  // HTML escaping
  // ---------------------------------------------------------

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
