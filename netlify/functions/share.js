const DB = "https://desher-news-default-rtdb.asia-southeast1.firebasedatabase.app";

const esc = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters?.id || "";

    const host =
      event.headers["x-forwarded-host"] ||
      event.headers.host;

    const proto =
      event.headers["x-forwarded-proto"] || "https";

    const origin = proto + "://" + host;

    if (!id) {
      return {
        statusCode: 302,
        headers: { Location: origin + "/" },
        body: ""
      };
    }

    const response = await fetch(
      DB + "/news/" + encodeURIComponent(id) + ".json"
    );

    const news = await response.json();

    if (!news || news.status !== "published") {
      return {
        statusCode: 302,
        headers: { Location: origin + "/" },
        body: ""
      };
    }

    const article =
      origin + "/?news=" + encodeURIComponent(id);

    const shareUrl =
      origin + "/share/" + encodeURIComponent(id);

    const title = esc(news.title || "দেশের নিউজ");

    const description = esc(
      news.summary ||
      String(news.body || "")
        .replace(/\s+/g, " ")
        .slice(0, 180) ||
      "সর্বশেষ সংবাদ"
    );

    const image = esc(news.image || "");

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">

<title>${title} | দেশের নিউজ</title>

<meta name="description" content="${description}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="দেশের নিউজ">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${shareUrl}">

${image ? `
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
` : ""}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">

${image ? `
<meta name="twitter:image" content="${image}">
` : ""}

<link rel="canonical" href="${article}">

</head>

<body>

<h1>${title}</h1>

<p>${description}</p>

<p>
<a href="${article}">
সম্পূর্ণ সংবাদ পড়ুন
</a>
</p>

<script>
if (
  !/facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp/i.test(
    navigator.userAgent
  )
) {
  location.replace(${JSON.stringify(article)});
}
</script>

</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=300"
      },
      body: html
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: "Share preview error"
    };

  }
};
