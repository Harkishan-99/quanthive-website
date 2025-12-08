export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  author: string;
  authorAvatar: string;
  date: string;
  category: string;
  imageUrl: string;
  featured?: boolean;
  slug?: string; // URL-friendly version of title
}

export interface User {
  name: string;
  avatar: string;
}

