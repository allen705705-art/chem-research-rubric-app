# 化學專題研究成果評分系統

這是一個給「化學專題研究」期末成果報告使用的自評與互評 Web App。學生在網頁送出評分後，資料會透過 Google Apps Script 寫入 Google Sheets。

## 功能

- 評分者與被評者欄位，可搭配學生名單下拉建議或直接輸入。
- 評量類型：自我評量、同儕互評。
- 三個 1 到 5 分評分向度：
  - 研究素養與學理基礎
  - 實作紀實與專案執行力
  - 未來延展與反思規劃
- 必填文字回饋欄位。
- 送出時顯示「送出中」，成功後顯示「評分成功」並清空表單。
- Google Apps Script URL 與學生名單會存在該瀏覽器的 localStorage。

## Google Sheets 設定

1. 建立一份 Google 試算表。
2. 點選「擴充功能」→「Apps Script」。
3. 將 `apps-script/Code.gs` 的內容貼到 Apps Script 編輯器。
4. 儲存後選擇「部署」→「新增部署作業」。
5. 類型選「網頁應用程式」。
6. 執行身分選「我」。
7. 存取權限依課程需求選擇，常見設定是「任何知道連結的人」。
8. 部署後複製 Web App URL，貼回網頁下方的設定區。

Apps Script 會自動建立 `Responses` 工作表與標題列。

## 本機預覽

這是純靜態網頁，可以直接開啟 `index.html`，也可以用任一靜態伺服器預覽。

```bash
python3 -m http.server 5173
```

然後開啟 `http://localhost:5173/chem-research-rubric-app/`。

## GitHub Pages

推到 GitHub 後，可在 repository 的 Pages 設定中選擇部署來源。若整個 repository 只放這個專案，可直接部署根目錄；若放在子資料夾，請依 GitHub Pages 設定調整。
