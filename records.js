
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

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Could not load ${file}`);
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

      count.textContent =
        `${filtered.length} ${kind}${filtered.length === 1 ? "" : "s"}`;

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

        const title = document.createElement("h3");
        title.textContent = record.title || "Untitled";
        article.appendChild(title);

        const metadata = document.createElement("p");
        metadata.className = "publication-details";

        const fields = kind === "patent"
          ? [record.inventors, record.number, record.status, record.year]
          : [record.type, record.authors, record.publisher,
             record.year, record.details];

        metadata.textContent = fields.filter(Boolean).join(" · ");
        article.appendChild(metadata);

        if (record.url) {
          try {
            const url = new URL(record.url, window.location.href);

            if (["https:", "http:"].includes(url.protocol)) {
              const link = document.createElement("a");
              link.href = url.href;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.className = "publication-link";
              link.textContent = kind === "patent"
                ? "View Patent →"
                : "View Publication →";

              article.appendChild(link);
            }
          } catch {
            // Skip invalid URLs.
          }
        }

        list.appendChild(article);
      });
    }

    search.addEventListener("input", render);
    render();
  } catch (err) {
    console.error(err);
    error.hidden = false;
    error.textContent =
      `Unable to load ${kind} records. Check the data file and try again.`;
    list.replaceChildren();
  }
}

setupRecordList({
  file: "patents.json",
  searchId: "patents-search",
  listId: "patents-list",
  countId: "patents-count",
  errorId: "patents-error",
  kind: "patent"
});

setupRecordList({
  file: "books-chapters.json",
  searchId: "books-search",
  listId: "books-list",
  countId: "books-count",
  errorId: "books-error",
  kind: "book or chapter"
});
