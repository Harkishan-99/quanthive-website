'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const BlogNavbarWrapper: React.FC = () => {
  const router = useRouter();

  return (
    <Navbar
      onAboutClick={() => router.push('/about')}
      onTeamClick={() => router.push('/team')}
    />
  );
};

export default BlogNavbarWrapper;

