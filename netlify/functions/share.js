const FIREBASE_DB =
  "https://desher-news-default-rtdb.asia-southeast1.firebasedatabase.app";

function esc(v = "") {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

exports.handler = async (event) => {
  try {
    const id =
      event.queryStringParameters &&
      event.queryStringParameters.id;

    if (!id) {
      return {
        statusCode: 302,
        headers: { Location: "/" },
        body: ""
      };
    }

    const r = await fetch(
      `${FIREBASE_DB}/news/${encodeURIComponent(id)}.json`
    );

    const n = await r.json();

    if (!n || n.status !== "published") {
      return {
        statusCode: 302,
        headers: { Location: "/" },
        body: ""
      };
    }

    const host =
      event.headers.host || "desher-news.netlify.app";

    const origin = `https://${host}`;

    const articleUrl =
      `${origin}/?news=${encodeURIComponent(id)}`;

    const title = esc(
      n.title || "দেশের নিউজ"
    );

    const desc = esc(
      String(
        n.summary ||
        n.description ||
        n.content ||
        ""
      )
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200)
    );

    const image = esc(
      n.image ||
      "https://placehold.co/1200x630/b00020/ffffff?text=Desher+News"
    );

    return {
      statusCode: 200,

      headers: {
        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "public, max-age=60"
      },

      body: `<!doctype html>

<html lang="bn">

<head>

<meta charset="utf-8">

<title>${title} | দেশের নিউজ</title>

<meta
  name="description"
  content="${desc}"
>

<meta
  property="og:type"
  content="article"
>

<meta
  property="og:site_name"
  content="দেশের নিউজ"
>

<meta
  property="og:title"
  content="${title}"
>

<meta
  property="og:description"
  content="${desc}"
>

<meta
  property="og:url"
  content="${articleUrl}"
>

<meta
  property="og:image"
  content="${image}"
>

<meta
  property="og:image:secure_url"
  content="${image}"
>

<meta
  name="twitter:card"
  content="summary_large_image"
>

<meta
  name="twitter:title"
  content="${title}"
>

<meta
  name="twitter:description"
  content="${desc}"
>

<meta
  name="twitter:image"
  content="${image}"
>

<link
  rel="canonical"
  href="${articleUrl}"
>

<meta
  http-equiv="refresh"
  content="0;url=${articleUrl}"
>

</head>

<body>

<a href="${articleUrl}">
সংবাদটি খুলুন
</a>

</body>

</html>`
    };

  } catch (e) {

    return {
      statusCode: 302,
      headers: {
        Location: "/"
      },
      body: ""
    };

  }
};
