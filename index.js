let linkedInLeads = JSON.parse(localStorage.getItem("linkedInLeads")) || [];

const addBtnEl = document.getElementById("add-btn-el");
const clearBtnEl = document.getElementById("clear-btn-el");
const content = document.getElementById("content");

clearBtnEl.addEventListener("click", () => {
  localStorage.removeItem("linkedInLeads");
  linkedInLeads = [];
  renderPage();
});

addBtnEl.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const isValidLinkedIn =
      /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/.test(tab.url);

    if (!isValidLinkedIn) {
      alert("This is not a valid LinkedIn profile URL");
      return;
    }

    const rawTitle = tab.title;

    let cleanName = rawTitle.replace(/\s*\|\s*LinkedIn$/, "").trim();

    const invalidNames = ["LinkedIn Member", "Profile not available", ""];

    if (invalidNames.includes(cleanName)) {
      alert("Invalid or Private profile");
      return;
    }

    if (linkedInLeads.some((l) => l.url === tab.url)) {
      alert("Already added to list");
      return;
    }
    linkedInLeads.push({
      id: Date.now(),
      name: cleanName,
      url: tab.url,
    });
    saveData();
    renderPage();
  });
});

function saveData() {
  localStorage.setItem("linkedInLeads", JSON.stringify(linkedInLeads));
}

function generateMessage(name) {
  const firstName = name.split(" ")[0];

  return `

  Hello ${firstName},

  I came across your profile and was really impressed by your background.
  I'd love to connect and learn more about your journey.

  Best regards,
  [Your Name]`;
}

function renderPage() {
  content.innerHTML = ``;
  linkedInLeads.forEach((lead) => {
    content.innerHTML += `
      <div class="person-group">
        <div>Name: <span>${lead.name}</span></div>
        <div>URL: <span>${lead.url}</span></div>
        <button class="copy-btn" data-id="${lead.id}">Copy Cold DM</button>
      </div>
    `;
  });

  content.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const lead = linkedInLeads.find((l) => l.id === id);
      const message = generateMessage(lead.name);
      navigator.clipboard.writeText(message);
      alert("Copied Cold DM");
    });
  });
}

renderPage();
