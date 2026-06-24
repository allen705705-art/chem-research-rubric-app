const SHEET_NAME = 'Responses';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getResponseSheet_();
    sheet.appendRow([
      new Date(),
      payload.submittedAt || '',
      payload.localSubmittedAt || '',
      payload.rater || '',
      payload.target || '',
      payload.assessmentType || '',
      payload.scores?.researchLiteracy || '',
      payload.scores?.executionDocumentation || '',
      payload.scores?.reflectionPlanning || '',
      payload.totalScore || '',
      payload.averageScore || '',
      payload.feedback || '',
      payload.appVersion || '',
    ]);

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Chemistry research rubric endpoint is running.' });
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const headers = [
    '寫入時間',
    'UTC送出時間',
    '本地送出時間',
    '評分者',
    '被評者',
    '評量類型',
    '向度一：研究素養與學理基礎',
    '向度二：實作紀實與專案執行力',
    '向度三：未來延展與反思規劃',
    '總分',
    '平均',
    '具體優點與建議',
    'App版本',
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
