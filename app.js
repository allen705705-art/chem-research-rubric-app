const STORAGE_KEY = "chemResearchRubricSettings";
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyO6EgOe7KWLxg6A36_A9UlgoNzGkRTOdAnvSxL3twPwsoWD8PlDGDLBMLsKI17WPKS/exec";

const rubricDimensions = [
  {
    id: "researchLiteracy",
    kicker: "向度一",
    title: "研究素養與學理基礎",
    detail: "評估原理介紹、論文研讀、實驗室研究內容的理解深度與正確性。",
    high: "能清晰且深入地解釋化學原理或論文核心，實驗紀錄詳實且具邏輯性，展現專題專業度。",
    mid: "能說明基本原理與實驗內容，但學理探討較表面，或實驗數據與描述略顯單薄。",
    low: "原理解釋不清或有明顯錯誤，未見實質論文研讀或實驗內容。",
  },
  {
    id: "executionDocumentation",
    kicker: "向度二",
    title: "實作紀實與專案執行力",
    detail: "評估時間規劃、實驗室照片佐證、研究歷程紀錄與進度掌控。",
    high: "時間規劃合理且具體，照片清晰並能真實佐證積極參與實作。",
    mid: "有列出時間規劃但稍嫌籠統，照片與文字描述關聯較弱，僅能部分證明參與度。",
    low: "缺乏時間規劃，或未附實驗室照片佐證實作過程。",
  },
  {
    id: "reflectionPlanning",
    kicker: "向度三",
    title: "未來延展與反思規劃",
    detail: "評估學生是否能根據目前成果提出暑期完整規劃、下一步研究方向與自我修正。",
    high: "能具體指出目前限制、後續實驗或資料需求，暑期規劃完整且可執行。",
    mid: "能提出基本後續方向，但規劃較粗略，和目前研究成果的連結仍需加強。",
    low: "缺乏反思或暑期規劃，未能說明專題下一步要如何推進。",
  },
];

const defaultRoster = [
  "101 王小明",
  "102 李同學",
  "103 陳同學",
  "104 林同學",
];

const form = document.querySelector("#evaluationForm");
const rubricList = document.querySelector("#rubricList");
const rubricTemplate = document.querySelector("#rubricTemplate");
const rosterDatalist = document.querySelector("#studentRoster");
const rosterInput = document.querySelector("#rosterInput");
const scriptUrlInput = document.querySelector("#scriptUrl");
const setupNotice = document.querySelector("#setupNotice");
const settingsDetails = document.querySelector(".settings-panel details");
const scoreSummary = document.querySelector("#scoreSummary");
const submitButton = document.querySelector("#submitButton");
const formMessage = document.querySelector("#formMessage");
const raterInput = document.querySelector("#rater");
const targetInput = document.querySelector("#target");
const saveSettingsButton = document.querySelector("#saveSettingsButton");
const clearSettingsButton = document.querySelector("#clearSettingsButton");

let settings = loadSettings();

renderRubrics();
applySettings(settings);
updateSetupNotice();
updateScoreSummary();

form.addEventListener("input", (event) => {
  if (event.target.name === "assessmentType" && event.target.value === "自我評量") {
    targetInput.value = raterInput.value;
  }

  if (event.target === raterInput && getAssessmentType() === "自我評量") {
    targetInput.value = raterInput.value;
  }

  updateScoreSummary();
});

saveSettingsButton.addEventListener("click", () => {
  settings = {
    scriptUrl: scriptUrlInput.value.trim(),
    roster: parseRoster(rosterInput.value),
  };
  saveSettings(settings);
  applySettings(settings);
  setMessage("設定已儲存。", "success");
});

clearSettingsButton.addEventListener("click", () => {
  settings = { scriptUrl: DEFAULT_SCRIPT_URL, roster: defaultRoster };
  saveSettings(settings);
  applySettings(settings);
  setMessage("設定已清除，已恢復範例學生名單。", "success");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  if (!form.reportValidity()) {
    setMessage("請先完成所有必填欄位。", "error");
    return;
  }

  const scriptUrl = scriptUrlInput.value.trim();
  if (!scriptUrl) {
    revealSettings();
    setMessage("請先貼上 Google Apps Script Web App URL。", "error");
    return;
  }

  settings = {
    scriptUrl,
    roster: parseRoster(rosterInput.value),
  };
  saveSettings(settings);

  const payload = buildPayload(scriptUrl);

  setSubmitting(true);
  setMessage("送出中...");

  try {
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    form.reset();
    scriptUrlInput.value = settings.scriptUrl;
    rosterInput.value = settings.roster.join("\n");
    updateScoreSummary();
    window.alert("評分成功");
    setMessage("評分成功，表單已清空。", "success");
  } catch (error) {
    setMessage(`送出失敗：${error.message}`, "error");
  } finally {
    setSubmitting(false);
  }
});

function renderRubrics() {
  rubricDimensions.forEach((dimension) => {
    const node = rubricTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".dimension-kicker").textContent = dimension.kicker;
    node.querySelector("h3").textContent = dimension.title;
    node.querySelector(".dimension-detail").textContent = dimension.detail;
    node.querySelector(".anchor-high").textContent = dimension.high;
    node.querySelector(".anchor-mid").textContent = dimension.mid;
    node.querySelector(".anchor-low").textContent = dimension.low;

    const legend = node.querySelector(".score-picker legend");
    legend.textContent = `${dimension.title}評分`;

    const options = node.querySelector(".score-options");
    for (let score = 1; score <= 5; score += 1) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      const text = document.createElement("span");
      input.type = "radio";
      input.name = dimension.id;
      input.value = String(score);
      input.required = true;
      text.textContent = String(score);
      label.append(input, text);
      options.append(label);
    }

    rubricList.append(node);
  });
}

function buildPayload(scriptUrl) {
  const formData = new FormData(form);
  const scores = Object.fromEntries(
    rubricDimensions.map((dimension) => [dimension.id, Number(formData.get(dimension.id))])
  );

  return {
    submittedAt: new Date().toISOString(),
    localSubmittedAt: new Date().toLocaleString("zh-TW", { hour12: false }),
    rater: formData.get("rater").trim(),
    target: formData.get("target").trim(),
    assessmentType: formData.get("assessmentType"),
    scores,
    totalScore: Object.values(scores).reduce((sum, score) => sum + score, 0),
    averageScore: Number((Object.values(scores).reduce((sum, score) => sum + score, 0) / rubricDimensions.length).toFixed(2)),
    feedback: formData.get("feedback").trim(),
    appVersion: "1.0.0",
    scriptUrlHost: new URL(scriptUrl).host,
  };
}

function updateScoreSummary() {
  const formData = new FormData(form);
  const values = rubricDimensions
    .map((dimension) => Number(formData.get(dimension.id)))
    .filter(Boolean);

  if (values.length !== rubricDimensions.length) {
    scoreSummary.textContent = `已完成 ${values.length}/${rubricDimensions.length} 個向度`;
    scoreSummary.classList.remove("is-complete");
    return;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const average = (total / values.length).toFixed(2);
  scoreSummary.textContent = `總分 ${total} / 平均 ${average}`;
  scoreSummary.classList.add("is-complete");
}

function getAssessmentType() {
  return new FormData(form).get("assessmentType");
}

function parseRoster(value) {
  const roster = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return roster.length ? roster : defaultRoster;
}

function applySettings(nextSettings) {
  scriptUrlInput.value = nextSettings.scriptUrl || "";
  rosterInput.value = nextSettings.roster.join("\n");
  rosterDatalist.replaceChildren(
    ...nextSettings.roster.map((student) => {
      const option = document.createElement("option");
      option.value = student;
      return option;
    })
  );
  updateSetupNotice();
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      scriptUrl: saved?.scriptUrl || DEFAULT_SCRIPT_URL,
      roster: Array.isArray(saved?.roster) && saved.roster.length ? saved.roster : defaultRoster,
    };
  } catch {
    return { scriptUrl: DEFAULT_SCRIPT_URL, roster: defaultRoster };
  }
}

function saveSettings(nextSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  updateSetupNotice();
}

function updateSetupNotice() {
  setupNotice.classList.toggle("is-visible", !scriptUrlInput.value.trim());
}

function revealSettings() {
  settingsDetails.open = true;
  scriptUrlInput.scrollIntoView({ behavior: "smooth", block: "center" });
  scriptUrlInput.focus({ preventScroll: true });
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.classList.toggle("is-loading", isSubmitting);
  submitButton.querySelector(".button-label").textContent = isSubmitting ? "送出中" : "送出評分";
}

function setMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = type ? `is-${type}` : "";
}

function clearMessage() {
  setMessage("");
}
