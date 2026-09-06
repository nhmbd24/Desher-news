দেশের নিউজ — FINAL

এতে একসাথে আছে:
• আগের Facebook article preview setup
• News title + image preview
• View counter fix
• Netlify Function
• Firebase rules

GitHub root-এ ZIP-এর ভিতরের সব ফাইল/ফোল্ডার একই structure-এ রাখুন:
netlify/functions/share.js
index.html
_redirects
netlify.toml
firebase-rules.json

Firebase Realtime Database > Rules-এ firebase-rules.json-এর rules Publish করুন।
তারপর Netlify deploy Published হওয়া পর্যন্ত অপেক্ষা করুন।
পুরোনো Facebook post দিয়ে পরীক্ষা না করে নতুন করে article Share চাপুন; Facebook cache থাকলে পুরোনো preview কিছু সময় দেখা যেতে পারে।
