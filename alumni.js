
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
        alumni.push({ heading: line });
        continue;
      }

      // Start a new numbered alumnus.
      const match = line.match(/^(\d+)\.\s*(.+)$/);

      if (match) {
        saveCurrent();

        // Separate the name from the graduation information.
        const nameMatch = match[2].match(
          /^(.*?),\s*Graduated\b/i
        );

        current = {
          number: match[1],
          name: nameMatch ? nameMatch[1].trim() : match[2].trim(),
          graduation: nameMatch
            ? match[2].slice(nameMatch[0].length).trim()
            : "",
          thesis: "",
          position: "",
          profile: ""
        };

        continue;
      }

      if (!current) continue;

      // Read the thesis.
      if (/^Thesis\s*:/i.test(line)) {
        current.thesis = line.replace(/^Thesis\s*:\s*/i, "");
      }

      // Read the profile URL.
      else if (/^Profile\s*:/i.test(line)) {
        current.profile = line
          .replace(/^Profile\s*:\s*/i, "")
          .trim();
      }

      // Read the position or current affiliation.
      else {
        current.position = current.position
          ? current.position + " " + line
          : line;
      }
    }

    saveCurrent();

    list.replaceChildren();
    error.textContent = "";

    if (alumni.length === 0) {
      throw new Error("No numbered alumni records were found.");
    }

    for (const person of alumni) {
      // Display subsection headings.
      if (person.heading) {
        const heading = document.createElement("h3");
        heading.className = "alumni-group-heading";
        heading.textContent = person.heading;
        list.appendChild(heading);
        continue;
      }

      const item = document.createElement("article");
      item.className = "alumni-item";

      // Name and graduation information.
      const nameLine = document.createElement("div");
      nameLine.className = "alumni-name";

      const name = document.createElement("strong");
      name.textContent = `${person.number}. ${person.name}`;
      nameLine.appendChild(name);

      if (person.graduation) {
        const graduation = document.createElement("span");
        graduation.textContent = `, Graduated ${person.graduation}`;
        nameLine.appendChild(graduation);
      }

      // Add the Visit Profile button only when a URL exists.
      if (person.profile && /^https?:\/\//i.test(person.profile)) {
        const profileButton = document.createElement("a");
        profileButton.className = "alumni-profile-button";
        profileButton.href = person.profile;
        profileButton.target = "_blank";
        profileButton.rel = "noopener noreferrer";
        profileButton.textContent = "Visit Profile";
        nameLine.appendChild(profileButton);
      }

      // Thesis.
      const thesis = document.createElement("div");
      thesis.className = "alumni-thesis";

      const thesisLabel = document.createElement("strong");
      thesisLabel.textContent = "Thesis: ";

      thesis.append(
        thesisLabel,
        person.thesis || "Not provided"
      );

      // Position or current affiliation.
      const position = document.createElement("div");
      position.className = "alumni-position";
      position.textContent = person.position;

      item.append(nameLine, thesis, position);
      list.appendChild(item);
    }
  
   } catch (err) {
     console.error("Alumni error:", err);

     list.textContent = "Unable to load alumni information.";
     error.textContent = "Error details: " + err.message;
   }

}

loadAlumni();
