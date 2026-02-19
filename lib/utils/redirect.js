import fs from 'fs';

export function generateRedirectJson({ allPages }) {
  let uuidSlugMap = {};
  allPages.forEach((page) => {
    if (page.type === 'Post' && page.status === 'Published') {
      uuidSlugMap[page.id] = page.slug;
    }
  });
  try {
    fs.writeFileSync('./public/redirect.json', JSON.stringify(uuidSlugMap));
  } catch (error) {
    console.warn("\u30D5\u30A1\u30A4\u30EB\u306B\u66F8\u304D\u8FBC\u3080\u3053\u3068\u304C\u3067\u304D\u307E\u305B\u3093\u3002", error);
  }
}