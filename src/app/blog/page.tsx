/**
 * @file This file contains the blog page component.
 * @exports default
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// blog route
const postsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * Retrieves and sorts the blog posts data.
 * @returns {{id: string, title: string, publishedAt: string, category: string}[]} An array of blog post data.
 */
function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".mdx" from file name to get id
    const id = fileName.replace(/\.mdx$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...(matterResult.data as { title: string; publishedAt: string; category: string }),
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * A page component for displaying a list of blog posts.
 * @returns {JSX.Element} The BlogPage component.
 */
export default function BlogPage() {
  const allPostsData = getSortedPostsData();
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPostsData.map(({ id, title, publishedAt, category }) => (
          <Link href={`/blog/${id}`} key={id}>
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{publishedAt} - {category}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}