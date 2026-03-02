require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

// ── SMTP 設定（讀取 .env）──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ── 聯絡表單 API ──
app.post('/api/contact', async (req, res) => {
  const { 機構名稱, 聯絡人, 職稱, 聯絡電話, Email, 留言 } = req.body;

  if (!聯絡人 || !職稱 || !聯絡電話 || !Email) {
    return res.status(400).json({ error: '缺少必填欄位' });
  }

  const subject = `【NurivaCRM 試用申請】${聯絡人}${機構名稱 ? ' / ' + 機構名稱 : ''}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;border:1px solid #E8ECF2;border-radius:12px;">
      <div style="background:#1E2D4A;padding:20px 28px;border-radius:8px;margin-bottom:28px;">
        <h2 style="color:white;margin:0;font-size:18px;">🌸 NurivaCRM 新試用申請</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #E8ECF2;">
          <td style="padding:12px 8px;color:#5E6B82;width:110px;">機構名稱</td>
          <td style="padding:12px 8px;color:#1A1F2E;font-weight:600;">${機構名稱 || '（未填寫）'}</td>
        </tr>
        <tr style="border-bottom:1px solid #E8ECF2;">
          <td style="padding:12px 8px;color:#5E6B82;">聯絡人</td>
          <td style="padding:12px 8px;color:#1A1F2E;font-weight:600;">${聯絡人}</td>
        </tr>
        <tr style="border-bottom:1px solid #E8ECF2;">
          <td style="padding:12px 8px;color:#5E6B82;">職稱</td>
          <td style="padding:12px 8px;color:#1A1F2E;font-weight:600;">${職稱}</td>
        </tr>
        <tr style="border-bottom:1px solid #E8ECF2;">
          <td style="padding:12px 8px;color:#5E6B82;">聯絡電話</td>
          <td style="padding:12px 8px;color:#1A1F2E;font-weight:600;">${聯絡電話}</td>
        </tr>
        <tr style="border-bottom:1px solid #E8ECF2;">
          <td style="padding:12px 8px;color:#5E6B82;">Email</td>
          <td style="padding:12px 8px;color:#1A1F2E;font-weight:600;"><a href="mailto:${Email}">${Email}</a></td>
        </tr>
        <tr>
          <td style="padding:12px 8px;color:#5E6B82;vertical-align:top;">留言</td>
          <td style="padding:12px 8px;color:#1A1F2E;">${留言 ? 留言.replace(/\n/g, '<br>') : '（無）'}</td>
        </tr>
      </table>
      <div style="margin-top:28px;padding:16px;background:#FDF0F5;border-radius:8px;font-size:12px;color:#8B3558;">
        此信件由 NurivaCRM 官網表單自動發送，請勿直接回覆。
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: Email,
      subject,
      html
    });
    console.log(`[${new Date().toISOString()}] 表單送出成功：${聯絡人} <${Email}>`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 寄信失敗：`, err.message);
    res.status(500).json({ error: '寄信失敗，請稍後再試' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ NurivaCRM 伺服器啟動 → http://localhost:${PORT}`);
});
