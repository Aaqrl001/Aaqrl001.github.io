
async function loadAlumni() {
  const list = document.getElementById("alumni-list");
  const error = document.getElementById("alumni-error");

  try {
    const response = await fetch("alumni.docx");

    if (!response.ok) {
      throw new Error("Could not load alumni.docx");
    }

    const arrayBuffer = await response.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer
    });

    const lines = result.value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    const alumni = [];
    let current = null;
    let sectionHeading = "";

    function saveCurrent() {
      if (current && current.name) {
        alumni.push(current);
      }
      current = null;
    }

    for (const line of lines) {
      // Preserve subsection headings.
      if (
        /Washington University in St\. Louis Graduates/i.test(line)
      ) {
        saveCurrent();
        sectionHeading = line;
        alumni.push({ heading: sectionHeading });
        continue;
      }

      // Start a new numbered alumnus.
      const match = line.match(/^(\d+)\.\s*(.+)$/);

      if (match) {
        saveCurrent();

        current = {
          number: match[1],
          name: match[2],
          thesis: "",
          position: ""
        };

        // Extract a LinkedIn URL if one exists in the same line.
        const urlMatch = line.match(/https?:\/\/\S+/i);
        current.linkedin = urlMatch ? urlMatch[0] : "";

        continue;
      }

      if (!current) continue;

      if (/^Thesis\s*:/i.test(line)) {
        current.thesis = line.replace(/^Thesis\s*:\s*/i, "");
      } else {
        current.position = current.position
          ? current.position + " " + line
          : line;
      }
    }

    saveCurrent();

    list.replaceChildren();

    if (alumni.length === 0) {
      throw new Error("No numbered alumni records were found.");
    }

    for (const person of alumni) {
      if (person.heading) {
        const heading = document.createElement("h3");
        heading.className = "alumni-group-heading";
        heading.textContent = person.heading;
        list.appendChild(heading);
        continue;
      }

      const item = document.createElement("article");
      item.className = "alumni-item";

      const nameLine = document.createElement("div");
      nameLine.className = "alumni-name";

      const name = document.createElement("strong");
      name.textContent = `${person.number}. ${person.name}`;
      nameLine.appendChild(name);

      if (person.linkedin) {
        const link = document.createElement("a");
        link.href = person.linkedin;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = " LinkedIn";
        nameLine.append(" (", link, ")");
      }

      const thesis = document.createElement("div");
      thesis.className = "alumni-thesis";

      const thesisLabel = document.createElement("strong");
      thesisLabel.textContent = "Thesis: ";
      thesis.append(thesisLabel, person.thesis || "Not provided");

      const position = document.createElement("div");
      position.className = "alumni-position";
      position.textContent = person.position;

      item.append(nameLine, thesis, position);
      list.appendChild(item);
    }
  } catch (err) {
    console.error(err);
    list.textContent = "Unable to load alumni information.";
    error.textContent =
      "Check that alumni.docx is in the website folder and that the site is served over HTTP.";
  }
}

loadAlumni();
