const fetch = global.fetch || require('node-fetch');
const apiBase = process.env.API_BASE;
const query = process.argv[2] || 'Nairobi';
const url = `${apiBase}/locations/search?q=${encodeURIComponent(query)}`;

console.log('Testing', url);
(async () => {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('HTTP', res.status);
    console.log(text);
    process.exit(res.ok ? 0 : 2);
  } catch (err) {
    console.error(err.message || err);
    process.exit(2);
  }
})();
