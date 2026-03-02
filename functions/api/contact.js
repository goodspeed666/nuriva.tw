export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { 機構名稱, 聯絡人, 職稱, 聯絡電話, Email, 留言 } = body;

    if (!聯絡人 || !職稱 || !聯絡電話 || !Email) {
      return new Response(JSON.stringify({ error: '缺少必填欄位' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'NurivaCRM', email: 'hello@nuriva.tw' },
        to: [{ email: 'hello@nuriva.tw' }],
        replyTo: { email: Email },
        subject,
        htmlContent: html
      })
    });

    if (res.ok) {
      console.log(`[${new Date().toISOString()}] 表單送出成功：${聯絡人} <${Email}>`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const errText = await res.text();
      console.error('Brevo 錯誤：', errText);
      return new Response(JSON.stringify({ error: '寄信失敗' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err) {
    console.error('表單錯誤：', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
