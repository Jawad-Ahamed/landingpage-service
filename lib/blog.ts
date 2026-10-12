// Blog posts are Markdown files in content/blog with front matter. Parsed at build time (server only).
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

export type Post = {
  slug: string;
  title: string;
  headline: [string, string];   // the H1 in two lines (line 2 highlighted)
  description: string;
  published: string;
  updated?: string;
  author: string;
  tags: string[];
  answer: string;            // the 40–60 word direct answer shown first
  readingMinutes: number;
  html: string;
  headings: { id: string; text: string }[];
};

const DIR = path.join(process.cwd(), 'content/blog');
const slugify = (s: string) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function load(): Post[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter(f => f.endsWith('.md')); } catch { return []; }
  return files.map(f => {
    const { data, content } = matter(readFileSync(path.join(DIR, f), 'utf8'));
    const headings: Post['headings'] = [];
    const renderer = new marked.Renderer();
    renderer.heading = ({ tokens, depth }) => {
      const text = marked.Parser.parseInline(tokens);
      const id = slugify(text);
      if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, '') });
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    };
    const html = marked.parse(content, { renderer, async: false }) as string;
    const words = content.split(/\s+/).length;
    return {
      slug: f.replace(/\.md$/, ''),
      title: data.title, headline: data.headline || [data.title, ''], description: data.description, published: data.published, updated: data.updated,
      author: data.author || 'MetaWurks team', tags: data.tags || [], answer: data.answer,
      readingMinutes: Math.max(1, Math.round(words / 230)), html, headings,
    } satisfies Post;
  }).sort((a, b) => (a.published < b.published ? 1 : -1));
}

export const POSTS: Post[] = load();
export const post = (slug: string) => POSTS.find(p => p.slug === slug);
