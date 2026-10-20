async function loadRecords(file, listId, countId, searchId, kind) {
  const list = document.getElementById(listId);
  const count = document.getElementById(countId);
  const search = document.getElementById(searchId);

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error("Could not load records");

    const records = await response.json();

    function render() {
      const query = search.value.trim().toLowerCase();

      const filtered = records.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(query)
        )
      );

      count.textContent =
        `${filtered.length} ${kind}${filtered.length === 1 ? "" : "s"}`;

      list.replaceChildren();

      filtered.forEach(record => {
        const article = document.createElement("article");
        article.className = "publication-item";

        const title = document.createElement("h3");
        title.textContent = record.title;
        article.appendChild(title);

        const details = kind === "patent"
          ? [record.inventors, record.number, record.year, record.status]
          : [record.authors, record.publisher, record.year, record.details];

        const text = document.createElement("p");
        text.textContent = details.filter(Boolean).join(" · ");
        article.appendChild(text);

        if (record.url) {
          try {
            const url = new URL(record.url);
            if (url.protocol === "https:" || url.protocol === "http:") {
              const link = document.createElement("a");
              link.href = url.href;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.textContent = kind === "patent"
                ? "View Patent →"
                : "View Publication →";
              article.appendChild(link);
            }
          } catch {}
        }

        list.appendChild(article);
      });
    }

    search.addEventListener("input", render);
    render();
  } catch (error) {
    list.textContent =
      "Records could not be loaded. Please try again later.";
    console.error(error);
  }
}

loadRecords(
  "books-chapters.json",
  "books-list",
  "books-count",
  "books-search",
  "book or chapter"
);

loadRecords(
  "patents.json",
  "patents-list",
  "patents-count",
  "patents-search",
  "patent"
);
