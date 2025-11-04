import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE = (process.env.API_BASE || "https://api.yourdomain.tld").replace(/\/+$/,"");

const escapeHtml = (s: string) =>
  s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
   .replace(/"/g,"&quot;").replace(/'/g,"&#39;");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const shareId = Array.isArray(req.query.shareId) ? req.query.shareId[0] : String(req.query.shareId || "");
    if (!shareId) return res.status(400).send("Bad request");
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = req.headers.host || "localhost";
    const canonical = `${proto}://${host}/share/${shareId}`;

    const r = await fetch(`${API_BASE}/share-meta/${encodeURIComponent(shareId)}`, { cache: "no-store" });
    if (!r.ok) return res.status(404).send("<h1>Not found</h1>");
    const meta = await r.json();

    const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${escapeHtml(meta.title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mood Gardens">
<meta property="og:title" content="${escapeHtml(meta.title)}">
<meta property="og:description" content="${escapeHtml(meta.desc)}">
${meta.img ? `<meta property="og:image" content="${meta.img}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(meta.title)}">
<meta name="twitter:description" content="${escapeHtml(meta.desc)}">
${meta.img ? `<meta name="twitter:image" content="${meta.img}">` : ""}
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;line-height:1.5;}
.card{max-width:680px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;}
.img{display:block;width:100%;}.content{padding:16px;}
.btn{display:inline-block;border:1px solid #111;padding:8px 12px;border-radius:8px;text-decoration:none;color:#111;}
</style>
</head><body>
<div class="card">
${meta.img ? `<img class="img" src="${meta.img}" alt="Mood garden image">` : ""}
<div class="content">
<h1>${escapeHtml(meta.title)}</h1>
<p>${escapeHtml(meta.desc)}</p>
<a class="btn" href="${meta.viewLink}">Open Mood Gardens</a>
</div></div>
</body></html>`;
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    console.error("share function failed", e);
    res.status(502).send("<h1>Upstream error</h1>");
  }
}
