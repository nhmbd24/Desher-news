const DB = "https://desher-news-default-rtdb.asia-southeast1.firebasedatabase.app";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

exports.handler = async (event) => {
  try {
    const id = (event.path || "")
      .split("/")
      .filter(Boolean)
      .pop();

    if (!id || id === "share") {
      return {
        statusCode: 404,
        body: "News not found"
      };
    }

    const response = await fetch(
      `${DB}/news/${encodeURIComponent(id)}.json`
    );

    const news = await response.json();

    if (!news || news.status !== "published") {
      return {
        statusCode: 404,
        body: "News not found"
      };
    }

    const proto =
      (event.headers["x-forwarded-proto"] || "https")
        .split(",")[0];

    const host =
      event.headers["x-forwarded-host"] ||
      event.headers.host ||
      "desher-news.netlify.app";

    const origin = `${proto}://${host}`;

    const shareUrl =
      `${origin}/share/${encodeURIComponent(id)}`;

    const articleUrl =
      `${origin}/?news=${encodeURIComponent(id)}`;

    const title = esc(
      news.title || "দেশের নিউজ"
    );

    const description = esc(
      news.summary ||
      String(news.body || "")
        .replace(/\s+/g, " ")
        .slice(0, 180) ||
      "সত্যের সাথে, দেশের কথা"
    );

    let image =
      news.image ||
      "https://placehold.co/1200x630/b00020/ffffff?text=Desher+News";

    if (
      image.includes("res.cloudinary.com") &&
      image.includes("/image/upload/")
    ) {
      image = image.replace(
        "/image/upload/",
        "/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_auto/"
      );
    }

    image = esc(image);

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>

<meta charset="UTF-8">

<title>${title} | দেশের নিউজ</title>

<meta
  name="description"
  content="${description}"
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
  content="${description}"
>

<meta
  property="og:url"
  content="${shareUrl}"
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
  property="og:image:width"
  content="1200"
>

<meta
  property="og:image:height"
  content="630"
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
  content="${description}"
>

<meta
  name="twitter:image"
  content="${image}"
>

<link
  rel="canonical"
  href="${articleUrl}"
>

</head>

<body>

<h1>${title}</h1>

<p>${description}</p>

<a href="${articleUrl}">
সংবাদটি পড়ুন
</a>

<script>

if (
  !/facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp/i
  .test(navigator.userAgent)
) {
  location.replace(${JSON.stringify(articleUrl)});
}

</script>

</body>
</html>`;

    return {
      statusCode: 200,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",

        "Cache-Control":
          "public, max-age=300"
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
