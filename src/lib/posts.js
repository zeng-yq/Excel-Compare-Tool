import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { i18n } from './i18n-config'

const postsDirectory = path.join(process.cwd(), 'data', 'md')

export function getSortedPostsData(locale = 'en') {
  // Read articles.json to check for deleted items
  const articlesJsonPath = path.join(process.cwd(), 'data', 'json', 'articles.json')
  let articlesIndex = []
  try {
    const articlesJson = fs.readFileSync(articlesJsonPath, 'utf8')
    articlesIndex = JSON.parse(articlesJson)
  } catch (error) {
    console.error('Error reading articles.json:', error)
  }

  // Get file names under language-specific directory
  const languageDirectory = path.join(postsDirectory, locale)

  // If language directory doesn't exist, return empty array
  if (!fs.existsSync(languageDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(languageDirectory)
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(languageDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Check if this article is deleted
    const articlePath = `data/md/${locale}/${fileName}`
    const articleInIndex = articlesIndex.find(a => a.path === articlePath)
    const isDeleted = articleInIndex?.deleted === true

    // Combine the data with the id
    return {
      id,
      title: matterResult.data.title,
      description: matterResult.data.description,
      date: matterResult.data.date,
      coverImage: matterResult.data.coverImage || null,
      deleted: isDeleted,
      locale,
    }
  })

  // Filter out deleted posts and sort by date
  return allPostsData
    .filter(post => !post.deleted)
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1
      } else {
        return -1
      }
    })
}

export async function getPostData(slug, locale = 'en') {
  // Try to load from requested language directory first
  let languageDirectory = path.join(postsDirectory, locale)
  let fullPath = path.join(languageDirectory, `${slug}.md`);
  let actualLocale = locale;
  let fileContents;

  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    // If file doesn't exist in requested language and it's not English, try fallback to English
    if (locale !== 'en') {
      languageDirectory = path.join(postsDirectory, 'en');
      fullPath = path.join(languageDirectory, `${slug}.md`);
      try {
        fileContents = fs.readFileSync(fullPath, 'utf8');
        actualLocale = 'en';
      } catch (fallbackError) {
        // If English version also doesn't exist, throw the original error
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    slug,
    contentHtml,
    title: matterResult.data.title,
    description: matterResult.data.description,
    date: matterResult.data.date,
    coverImage: matterResult.data.coverImage || null,
    locale: actualLocale,
    originalLocale: locale,
    // ... any other fields you want to include
  };
}

export async function getPostData2(id, locale = 'en') {
  // Try to load from requested language directory first
  let languageDirectory = path.join(postsDirectory, locale)
  let fullPath = path.join(languageDirectory, `${id}.md`);
  let actualLocale = locale;
  let fileContents;

  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    // If file doesn't exist in requested language and it's not English, try fallback to English
    if (locale !== 'en') {
      languageDirectory = path.join(postsDirectory, 'en');
      fullPath = path.join(languageDirectory, `${id}.md`);
      try {
        fileContents = fs.readFileSync(fullPath, 'utf8');
        actualLocale = 'en';
      } catch (fallbackError) {
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    locale: actualLocale,
    originalLocale: locale,
    ...matterResult.data
  }
}