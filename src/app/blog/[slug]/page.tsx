import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export async function generateStaticParams() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.mdx$/, ''),
  }));
}

async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { content, data } = matter(fileContents);

  return {
    content,
    data,
  };
}

export default async function BlogPostPage({ params: { slug } }: { params: { slug: string } }) {
  const { content, data } = await getPostData(slug);

  return (
    <article className="container mx-auto py-12 prose lg:prose-xl">
      <h1>{data.title}</h1>
      <p className="text-muted-foreground">{data.publishedAt} - {data.category}</p>
      <MDXRemote source={content} />
    </article>
  );
}