'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog/types';
import BlogSidebar from './BlogSidebar';
import TableOfContents from './TableOfContents';

// ShareButton component for mobile
interface ShareButtonProps {
  post: BlogPost;
}

const ShareButton: React.FC<ShareButtonProps> = ({ post }) => {
  const [copied, setCopied] = useState(false);
  
  const articleUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : '';
  const articleImage = post.imageUrl;
  const articleTitle = post.title;
  
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    
    // On mobile: Copy link to clipboard (same as desktop)
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback: select text
      const textArea = document.createElement('textarea');
      textArea.value = articleUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="block pt-12 lg:hidden border-t border-white/10 mb-16">
      <button
        onClick={handleShare}
        className="w-full py-6 pr-6 text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest flex justify-between items-center group transition-colors"
      >
        <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
      </button>
    </div>
  );
};

interface Section {
  id: string;
  title: string;
  level: number;
}

interface BlogPostPageProps {
  post: BlogPost;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  const router = useRouter();
  const [processedContent, setProcessedContent] = useState(post.content || '');
  const [sections, setSections] = useState<Section[]>([]);
  
  // Function to create slug from title
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Process content to extract sections and add IDs to headings (client only)
  useEffect(() => {
    if (typeof window === 'undefined' || !post.content) {
      setProcessedContent(post.content || '');
      setSections([]);
      return;
    }

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    const extractedSections: Section[] = [];

    headings.forEach((heading) => {
      const text = heading.textContent || '';
      const slug = createSlug(text);
      const id = `section-${slug}`;
      heading.id = id;
      const trimmedText = text.trim();
      const startsWithNumber = /^\d+\.\s/.test(trimmedText);
      const isConclusion = /^conclusion/i.test(trimmedText);
      const isReferences = /^references/i.test(trimmedText);
      if (startsWithNumber || isConclusion || isReferences) {
        extractedSections.push({
          id,
          title: text,
          level: heading.tagName === 'H2' ? 2 : 3
        });
      }
    });

    setProcessedContent(doc.body.innerHTML);
    setSections(extractedSections);
  }, [post.content]);

  useEffect(() => {
    // Ensure headings have proper scroll margin for offset
    const headings = document.querySelectorAll('h2[id], h3[id]');
    headings.forEach((heading) => {
      (heading as HTMLElement).style.scrollMarginTop = '100px';
    });
  }, [processedContent]);

  return (
    <>
      {/* Mobile Horizontal TOC - Fixed at bottom, rendered outside main container */}
      <div className="block lg:hidden">
        <TableOfContents sections={sections} />
      </div>
      
      <div className="relative min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row mt-0 lg:mt-4">
        {/* Sidebar */}
        <BlogSidebar sections={sections} />
      {/* RIGHT CONTENT AREA */}
      <div className="w-full lg:w-3/4 pt-4 lg:pt-0 lg:border-t border-white/10">
        {/* Back Button - Mobile only */}
        <div className="px-4 py-3 mb-4 lg:hidden flex items-center">
          <Link
            href="/blog"
            className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </Link>
        </div>
        {/* Article Image - Mobile only */}
        <div className="lg:hidden px-4 pb-4">
          <div className="relative w-full pt-[56.25%] overflow-hidden bg-neutral-900 border border-white/5">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Category and Date - Large screens only */}
        <div className="hidden lg:flex items-center px-16 py-8 border-b border-white/10">
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            <span>{post.category}</span>
            <span className="mx-2 text-neutral-600">■</span>
            <span>{post.date}</span>
          </div>
        </div>
        {/* Main Content */}
        <div className="px-8 pt-5 pb-8 lg:p-16 lg:pt-24 max-w-4xl mx-auto">
          <h1 className="text-3xl lg:text-6xl font-medium leading-[1.1] mb-6 lg:mb-16 text-white tracking-tight">
            {post.title}
          </h1>
          <div className="prose prose-invert prose-lg text-neutral-400 font-sans leading-relaxed">
            {processedContent ? (
              <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            ) : (
              <>
                <p className="mb-6">Whether you're a hopefully software developer or a thrill-seeker fascinated by the world of cryptocurrency, artificial intelligence (AI), or non-fungible tokens (NFTs), it's important to learn how to develop NFT tokens. NFTs made their debut in 2014 and have exploded in popularity ever since.</p>
                <div className="flex items-center justify-center py-12">
                  <span className="text-2xl text-neutral-700">✢</span>
                </div>
                <p className="mb-6">Now, enter our current fan-favorite in the world of tech: AI. While AI-generated art revealed its earliest iterations in the late 1960s, it wasn't until early 2022 that the world was in awe of AI-generated art. With just a few keywords, AI programs could craft photo-realistic images in just minutes.</p>
                <p>Combine the efficiency and imagination of AI-generated art with the digital ownership and representation of real-world assets.</p>
              </>
            )}
          </div>
          {/* Mobile-only Share Button */}
          <ShareButton post={post} />
        </div>
      </div>
    </div>
    </>
  );
};

export default BlogPostPage;

