import React from 'react';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/blog/BlogPostPage';
import BlogNavbarWrapper from '@/components/blog/BlogNavbarWrapper';
import Footer from '@/components/Footer';
import { getPostBySlug, getAllBlogPosts } from '@/lib/blog/data';
import type { Metadata } from 'next';

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
  };
}

interface BlogPostPageRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

const BlogPostPageRoute: React.FC<BlogPostPageRouteProps> = async ({ params }) => {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white relative overflow-x-hidden flex flex-col">
      <BlogNavbarWrapper />
      <div className="flex-grow pt-0 lg:pt-24">
        <BlogPostPage post={post} />
      </div>
      <Footer />
    </div>
  );
};

export default BlogPostPageRoute;

