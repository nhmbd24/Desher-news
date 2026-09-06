const FIREBASE_DB =
  "https://desher-news-default-rtdb.asia-southeast1.firebasedatabase.app";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

exports.handler = async function (event) {
  try {
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 302,
        headers: {
          Location: "/"
        },
        body: ""
      };
    }

    const response = await fetch(
      `${FIREBASE_DB}/news/${encodeURIComponent(id)}.json`
    );

    const news = await response.json();

    if (!news || news.status !== "published") {
      return {
        statusCode: 302,
        headers: {
          Location: "/"
        },
        body: ""
      };
    }

    const host = event.headers.host || "desher-news.netlify.app";

    const origin = `https://${host}`;

    const articleUrl =
      `${origin}/?news=${encodeURIComponent(id)}`;

    const shareUrl =
      `${origin}/share/${encodeURIComponent(id)}`;

    const title = escapeHtml(
      news.title || "দেশের নিউজ"
    );

    const description = escapeHtml(
      (news.summary || news.description || news.content || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200)
    );

    const image = escapeHtml(
      news.image ||
      "https://placehold.co/1200x630/b00020/ffffff?text=Desher+News"
    );

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>${title} | দেশের নিউজ</title>

<meta name="description"
content="${description}">

<meta property="og:type"
content="article">

<meta property="og:site_name"
content="দেশের নিউজ">

<meta property="og:title"
content="${title}">

<meta property="og:description"
content="${description}">

<meta property="og:image"
content="${image}">

<meta property="og:image:secure_url"
content="${image}">

<meta property="og:image:width"
content="1200">

<meta property="og:image:height"
content="630">

<meta property="og:url"
content="${shareUrl}">

<meta name="twitter:card"
content="summary_large_image">

<meta name="twitter:title"
content="${title}">

<meta name="twitter:description"
content="${description}">

<meta name="twitter:image"
content="${image}">

<link rel="canonical"
href="${articleUrl}">

<meta http-equiv="refresh"
content="1;url=${articleUrl}">

</head>

<body>

<p>সংবাদটি খুলছে...</p>

<script>
setTimeout(function () {
  window.location.href = ${JSON.stringify(articleUrl)};
}, 500);
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

    console.error(error);

    return {
      statusCode: 302,
      headers: {
        Location: "/"
      },
      body: ""
    };
  }
};
