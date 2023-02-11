import type { ComponentDoc } from 'vue-docgen-api';

import type { GrayMatterOption } from 'gray-matter';
import matter from 'gray-matter';
import defu from 'defu';


// Extract all frontmatter comments from content and doc.docsBlocks
// and inject it back to content
export const extractAndCutFrontmatter = (
  // doc.docsBlocks will modified by this function
  doc: Partial<Pick<ComponentDoc, 'docsBlocks'>>,
  grayMatterOptions: GrayMatterOption<any, any>,
  content = '',
): {
  content: string;
  frontMatter: Record<any, any>;
} => {
  const {
    data: topContentFrontmatter = {},
    content: cuttedTopContent,
    // Without .trim() matter ignore some files
  } = matter(content.trim(), grayMatterOptions);

  let frontMatter = topContentFrontmatter;

  doc.docsBlocks?.forEach((blockContent, index) => {
    const {
      data,
      content: cuttedBlockContent
    } = matter(blockContent.trim(), grayMatterOptions);

    frontMatter = defu(data, frontMatter);
    doc.docsBlocks[index] = cuttedBlockContent;
  });


  return {
    content: matter.stringify(cuttedTopContent, frontMatter, grayMatterOptions),
    frontMatter,
  };
};
