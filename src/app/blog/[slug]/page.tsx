/**
 * @file This file contains the blog post page component.
 * @exports generateStaticParams
 * @exports default
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

const postsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * Generates the static paths for the blog posts.
 * @returns {Promise<{slug: string}[]>} An array of objects containing the slug for each blog post.
 */
export async function generateStaticParams() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.mdx$/, ''),
  }));
}

/**
 * Retrieves the data for a blog post.
 * @param {string} slug - The slug of the blog post.
 * @returns {Promise<{content: string, data: {[key: string]: any}}>} An object containing the content and data for the blog post.
 */
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

/**
 * A page component for displaying a blog post.
 * @param {object} props - The props for the component.
 * @param {object} props.params - The parameters for the page.
 * @param {string} props.params.slug - The slug of the blog post.
 * @returns {Promise<JSX.Element>} The BlogPostPage component.
 */
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