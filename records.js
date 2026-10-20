
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

  if (!search || !list || !count || !error) {
    console.error(`Missing HTML elements for ${file}`);
    return;
  }

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Could not load ${file}: ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records)) {
      throw new Error(`${file} must contain a JSON array`);
    }

    function render() {
      const query = search.value.trim().toLowerCase();

      const filtered = records.filter(record =>
        Object.values(record).some(value =>
          String(value ?? "").toLowerCase().includes(query)
        )
      );

      const label = kind === "patent"
        ? "patent"
        : "book or chapter";

      count.textContent =
        `${filtered.length} ${label}${filtered.length === 1 ? "" : "s"}`;

      list.replaceChildren();

      if (filtered.length === 0) {
        const message = document.createElement("p");
        message.className = "publication-loading";
        message.textContent = "No matching records found.";
        list.appendChild(message);
        return;
      }

      filtered.forEach(record => {
        const article = document.createElement("article");
        article.className = "publication-item";

        // Full citation on one line/paragraph
        const citation = document.createElement("p");
        citation.className = "publication-citation";
        citation.textContent = record.citation || record.title || "";
        article.appendChild(citation);

        // Link to the patent or publication
        if (record.url) {
          try {
            const url = new URL(record.url, window.location.href);

            if (url.protocol === "https:" || url.protocol === "http:") {
              const link = document.createElement("a");
              link.href = url.href;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.className = "publication-link";
              link.textContent =
                kind === "patent" ? "Patent →" : "DOI →";

              article.appendChild(link);
            }
          } catch (err) {
            console.warn("Invalid publication URL:", record.url);
          }
        }

        list.appendChild(article);
      });
    }

    search.addEventListener("input", render);
    render();

  } catch (err) {
    console.error(`Error loading ${file}:`, err);

    error.hidden = false;
    error.textContent =
      `Unable to load ${kind} records. Check ${file} and try again.`;

    list.replaceChildren();
    count.textContent = "";
  }
}

// Load patents
setupRecordList({
  file: "patents.json",
  searchId: "patents-search",
  listId: "patents-list",
  countId: "patents-count",
  errorId: "patents-error",
  kind: "patent"
});

// Load books and chapters
setupRecordList({
  file: "books-chapters.json",
  searchId: "books-search",
  listId: "books-list",
  countId: "books-count",
  errorId: "books-error",
  kind: "book or chapter"
});
