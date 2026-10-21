
async function loadAlumni() {
  const list = document.getElementById("alumni-list");
  const error = document.getElementById("alumni-error");

  if (!list || !error) {
    console.error("Alumni HTML elements were not found.");
    return;
  }

  list.textContent = "Loading alumni information...";
  error.textContent = "";

  try {
    // Load the JSON file from the website folder.
    const response = await fetch("./alumni.json");

    if (!response.ok) {
      throw new Error(
        `Could not load alumni.json (HTTP ${response.status}).`
      );
    }

    const alumni = await response.json();

    if (!Array.isArray(alumni) || alumni.length === 0) {
      throw new Error(
        "alumni.json must contain a nonempty JSON array."
      );
    }

    list.replaceChildren();

    alumni.forEach((person, index) => {
      if (!person.name) {
        console.warn(
          `Skipping alumni entry ${index + 1}: missing name.`
        );
        return;
      }

      // Create the alumni entry.
      const item = document.createElement("article");
      item.className = "alumni-item";

      // Name and graduation date.
      const nameLine = document.createElement("div");
      nameLine.className = "alumni-name";

      const name = document.createElement("strong");
      const number = person.number ?? index + 1;

      name.textContent = `${number}. ${person.name}`;
      nameLine.appendChild(name);

      if (person.graduation) {
        const graduation = document.createElement("span");
        graduation.textContent =
          `, Graduated ${person.graduation}`;

        nameLine.appendChild(graduation);
      }

      // Add a profile button only for valid HTTP(S) URLs.
      const profileUrl = (person.profile || "").trim();

      if (profileUrl) {
        try {
          const url = new URL(profileUrl);

          if (url.protocol === "https:" || url.protocol === "http:") {
            const button = document.createElement("a");

            button.className = "alumni-profile-button";
            button.href = url.href;
            button.target = "_blank";
            button.rel = "noopener noreferrer";
            button.textContent = "LinkedIn";

            nameLine.appendChild(button);
          }
        } catch {
          console.warn(
            `Invalid profile URL for ${person.name}: ${profileUrl}`
          );
        }
      }

      // Thesis.
      const thesis = document.createElement("div");
      thesis.className = "alumni-thesis";

      const thesisLabel = document.createElement("strong");
      thesisLabel.textContent = "Thesis: ";

      thesis.append(
        thesisLabel,
        document.createTextNode(person.thesis || "Not provided")
      );

      // Current or former position.
      const position = document.createElement("div");
      position.className = "alumni-position";
      position.textContent = person.position || "";

      item.append(nameLine, thesis, position);
      list.appendChild(item);
    });

    if (!list.children.length) {
      throw new Error("No valid alumni entries were found.");
    }
  } catch (err) {
    console.error("Alumni loading error:", err);

    list.textContent = "Unable to load alumni information.";
    error.textContent =
      `${err.message} Check that alumni.json is valid JSON ` +
      "and is included in the published website.";
  }
}

loadAlumni();
