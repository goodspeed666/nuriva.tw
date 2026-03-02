# nuriva.tw

NurivaCRM 官方網站，包含靜態前端頁面與聯絡表單後端。

---

## 專案結構

```
nuriva.tw/
├── index.html              # 官網前端
├── server.js               # 本機開發用 Express 伺服器
├── functions/
│   └── api/
│       └── contact.js      # Cloudflare Pages Function（正式環境）
├── .env                    # 環境變數（本機用，不進 git）
├── .nvmrc                  # Node.js 版本指定（v24）
└── package.json
```

---

## 本機開發

### 環境需求

- Node.js 24（參考 `.nvmrc`）
- Yarn

### 安裝與啟動

```bash
yarn install
yarn start
```

伺服器預設啟動於 `http://localhost:3999`

### 環境變數（`.env`）

請在專案根目錄建立 `.env` 檔案，內容如下：

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=你的 Brevo SMTP 帳號
SMTP_PASS=你的 Brevo SMTP 密碼
MAIL_TO=hello@nuriva.tw
MAIL_FROM=NurivaCRM <hello@nuriva.tw>
PORT=3999
```

> `.env` 已加入 `.gitignore`，不會被提交至 git。

---

## 正式環境（Cloudflare Pages）

正式環境部署於 Cloudflare Pages，透過 `functions/api/contact.js` 處理表單送出，使用 **Brevo HTTP API** 寄信，不需要 Node.js 伺服器。

### 表單 API 流程

```
使用者填表 → POST /api/contact
→ Cloudflare Pages Function
→ Brevo API (https://api.brevo.com/v3/smtp/email)
→ 寄信至 hello@nuriva.tw
```

### Cloudflare Pages 環境變數設定

至 **Cloudflare Dashboard → Pages → 專案 → Settings → Environment variables** 新增：

| 變數名稱 | 說明 |
|---|---|
| `BREVO_API_KEY` | Brevo v3 API 金鑰（`xkeysib-` 開頭） |

> 取得方式：登入 [app.brevo.com](https://app.brevo.com) → 右上角頭像 → SMTP & API → API Keys

> ⚠️ 環境變數更新後需重新部署才會生效（推新 commit 即可觸發）。

### DNS 設定（Cloudflare）

| 類型 | 設定 |
|---|---|
| MX | 指向 Cloudflare Email Routing |
| SPF | `v=spf1 include:_spf.mx.cloudflare.net include:spf.sendinblue.com ~all` |
| DKIM | 由 Brevo 後台取得，加入 `mail._domainkey.nuriva.tw` |

### Email Routing

`hello@nuriva.tw` 透過 Cloudflare Email Routing 轉寄至實際收信信箱。

---

## 表單防重複送出機制

前端實作三層保護：

1. **送出中鎖定**：按下送出後立即鎖定，收到伺服器回應前無法再次送出
2. **60 秒冷卻**：成功送出後 60 秒內再次嘗試會提示等待
3. **成功後隱藏**：表單送出成功後直接隱藏，不再可操作

---

## Node.js 版本管理

專案指定 Node.js 24，使用 nvm 可自動切換：

```bash
nvm install 24
nvm use        # 自動讀取 .nvmrc
nvm alias default 24  # 設為全域預設
```

---

## 部署流程

推送至 `main` 分支後，Cloudflare Pages 會自動觸發部署。

```bash
git add .
git commit -m "說明"
git push origin main
```
