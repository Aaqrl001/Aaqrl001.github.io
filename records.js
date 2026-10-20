
async function setupRecordList({
  file,
  searchId,
  listId,
  countId,
  errorId,
  kind
}) {
  const search = document.getElementById(searchId);
  const list = document.getElementById(listId);
  const count = document.getElementById(countId);
  const error = document.getElementById(errorId);

  // Skip this list if its elements are not on the current page.
  if (!search || !list || !count || !error) return;

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Could not load ${file}`);
    }

    const records = await response.json();

    if (!Array.isArray(records)) {
      throw new Error(`${file} must contain a JSON array`);
    }

    function getYear(record) {
      const year = String(record.year || "").match(/\b\d{4}\b/);
      if (year) return year[0];

      const date = String(record.date || "").match(/\b\d{4}\b/);
      if (date) return date[0];

      // Extract the year from a citation if necessary.
      const citation = String(record.citation || "");
      const citationYear = citation.match(/\((\d{4})\)/);

      if (citationYear) return citationYear[1];

      return "Year not specified";
    }

    function render() {
      const query = search.value.trim().toLowerCase();

      const filtered = records.filter(record =>
        Object.values(record).some(value =>
          String(value ?? "").toLowerCase().includes(query)
        )
      );

      const countLabel =
        kind === "book or chapter"
          ? "book or chapter"
          : "patent";

      count.textContent =
        `${filtered.length} ${countLabel}` +
        (filtered.length === 1 ? "" : "s");

      list.replaceChildren();

      if (filtered.length === 0) {
        const message = document.createElement("p");
        message.className = "publication-empty";
        message.textContent = "No matching records found.";
        list.appendChild(message);
        return;
      }

      // Group records by year, newest first.
      const groups = new Map();

      filtered.forEach(record => {
        const year = getYear(record);

        if (!groups.has(year)) {
          groups.set(year, []);
        }

        groups.get(year).push(record);
      });

      const sortedYears = [...groups.keys()].sort((a, b) => {
        if (a === "Year not specified") return 1;
        if (b === "Year not specified") return -1;

        return Number(b) - Number(a);
      });

      sortedYears.forEach(year => {
        const heading = document.createElement("h3");
        heading.className = "publication-year-heading";
        heading.textContent = year;
        list.appendChild(heading);

        const yearRecords = groups.get(year);

        yearRecords.forEach((record, index) => {
          const article = document.createElement("article");
          article.className =
            "publication-item publication-record";

          const number = document.createElement("span");
          number.className = "publication-record-number";

          // Use the explicit number if supplied in the JSON.
          // Otherwise, number entries within the year.
          number.textContent =
            record.number != null && record.number !== ""
              ? `${record.number}.`
              : `${yearRecords.length - index}.`;

          const content = document.createElement("div");
          content.className = "publication-content";

          // BOOKS AND CHAPTERS
          // Display the complete citation instead of patent fields.
          if (kind === "book or chapter") {
            const citation = document.createElement("p");
            citation.className = "publication-citation";
            citation.textContent =
              record.citation || record.title || "Citation unavailable.";

            content.appendChild(citation);

            // Prefer the DOI URL, then fall back to the general URL.
            const doiUrl = record.doi || record.url;

            if (doiUrl) {
              const links = document.createElement("div");
              links.className = "publication-links";

              const link = document.createElement("a");
              link.href = doiUrl;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.className = "publication-link";

              link.textContent = record.doi
                ? "DOI →"
                : "View publication →";

              links.appendChild(link);
              content.appendChild(links);
            }
          } else {
            // PATENTS
            // Preserve the existing patent details layout.
            const fields = [
              ["Title", record.title],
              ["Name", record.authors],
              ["Patent Number", record.patentNumber],
              ["Assignee", record.assignee],
              ["Licensee", record.licensee],
              ["Status", record.status],
              ["Grant Date", record.grantDate],
              ["Year", record.year]
            ];

            const details = document.createElement("div");
            details.className = "patent-details";

            fields.forEach(([label, value]) => {
              if (
                value !== undefined &&
                value !== null &&
                value !== ""
              ) {
                const line = document.createElement("p");
                line.className = "patent-detail-line";

                const strong = document.createElement("strong");
                strong.textContent = `${label}: `;

                line.appendChild(strong);
                line.appendChild(
                  document.createTextNode(String(value))
                );

                details.appendChild(line);
              }
            });

            content.appendChild(details);

            if (record.url) {
              const links = document.createElement("div");
              links.className = "publication-links";

              const link = document.createElement("a");
              link.href = record.url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.className = "publication-link";
              link.textContent = "Patent →";

              links.appendChild(link);
              content.appendChild(links);
            }
          }

          article.appendChild(number);
          article.appendChild(content);
          list.appendChild(article);
        });
      });
    }

    search.addEventListener("input", render);
    render();

  } catch (err) {
    console.error(`Error loading ${file}:`, err);

    error.hidden = false;
    error.textContent =
      `Unable to load ${kind} records. Check the data file and try again.`;

    list.replaceChildren();
  }
}


// Patent records
setupRecordList({
  file: "patents.json",
  searchId: "patents-search",
  listId: "patents-list",
  countId: "patents-count",
  errorId: "patents-error",
  kind: "patent"
});


// Books and chapters
setupRecordList({
  file: "books-chapters.json",
  searchId: "books-search",
  listId: "books-list",
  countId: "books-count",
  errorId: "books-error",
  kind: "book or chapter"
});
