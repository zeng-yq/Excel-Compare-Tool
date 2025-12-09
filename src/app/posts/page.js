import ArticleList from '@/components/ArticleList'
import { getSortedPostsData } from '@/lib/posts';
import { Metadata } from 'next';

export const metadata = {
  title: 'Articles',
  description: 'Read our latest articles on web development, GitHub tips, and best practices.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function Articles() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="container mx-auto py-12 flex-1">
      <ArticleList articles={allPostsData} showMoreLink={false} />
    </div>
  )
}

