// api/proxy.js
import { request } from 'undici'; // از undici برای درخواست‌های HTTP استفاده می‌کنیم که در محیط Vercel بهینه شده

export default async function handler(req, res) {
    const { url } = req.query; // آدرس URL که از کاربر گرفتیم

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // سعی می‌کنیم URL را با متد GET درخواست کنیم.
        // شما می‌توانید متدها و هدرهای دیگر را هم پشتیبانی کنید.
        const targetResponse = await request(url, { method: req.method || 'GET', headers: req.headers });

        // پاسخ سرور مقصد را به کاربر برمی‌گردانیم
        res.status(targetResponse.statusCode);
        for (const [key, value] of targetResponse.headers) {
            // هدرهایی که نباید فوروارد شوند را فیلتر می‌کنیم
            if (!key.startsWith('transfer-encoding') && !key.startsWith('connection')) {
                res.setHeader(key, value);
            }
        }

        // خواندن بادی پاسخ و ارسال آن
        const body = await targetResponse.body.text();
        res.send(body);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch the URL', details: error.message });
    }
}

// توجه: برای استفاده از import در Node.js در Vercel، باید فایل را با پسوند .mjs ذخیره کنید
// یا در package.json پروژه، "type": "module" را اضافه کنید.
// برای سادگی، فرض می‌کنیم package.json تنظیم شده است.
