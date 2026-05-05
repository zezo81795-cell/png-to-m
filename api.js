// هذا الكود مصمم للعمل مع Cloudflare Workers (مجاني وسريع)
// أو يمكن تعديله للعمل مع Node.js + Express

export default {
  async fetch(request, env, ctx) {
    // استخراج رقم القناة من رابط الطلب: https://your-worker.workers.dev/156588
    const url = new URL(request.url);
    let channelId = url.pathname.slice(1); // يزيل الشرطة الأولى
    
    if (!channelId) {
      return new Response('الرجاء إدخال رقم القناة، مثال: /156588', { status: 400 });
    }
    
    // 1. جلب ملف الـ PNG الذي يحتوي على M3U8
    const pngUrl = `https://ostora.pages.dev/api/${channelId}.png`;
    const response = await fetch(pngUrl);
    const m3u8Text = await response.text();
    
    // 2. استخراج سطر الجودة الأعلى (720p) - يمكن تعديله حسب رغبتك
    const lines = m3u8Text.split('\n');
    let bestQualityPath = null;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('RESOLUTION=1280x720')) { // يبحث عن 720p
        bestQualityPath = lines[i + 1]; // السطر التالي يحتوي على المسار
        break;
      }
    }
    
    if (!bestQualityPath) {
      return new Response('لم يتم العثور على رابط M3U8', { status: 404 });
    }
    
    // 3. بناء الرابط الكامل
    const baseUrl = 'https://ostora.pages.dev/api/';
    const fullM3U8Url = baseUrl + bestQualityPath;
    
    // 4. إرجاع الرابط إما كنص عادي أو إعادة توجيه
    return new Response(fullM3U8Url, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
