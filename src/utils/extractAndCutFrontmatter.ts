import type { ComponentDoc } from 'vue-docgen-api';

import type { GrayMatterOption } from 'gray-matter';
import matter from 'gray-matter';
import { defu } from 'defu';


const editLinkRegexp = /^<a href="[^"]+" class="docgen-edit-link">[^<]+<\/a>/im;

// Extract all frontmatter comments from content and doc.docsBlocks
// and inject it back to content
export const extractAndCutFrontmatter = (
  // doc.docsBlocks will modified by this function
  doc: Partial<Pick<ComponentDoc, 'docsBlocks'>>,
  grayMatterOptions: GrayMatterOption<any, any>,
  // Base markdown content (for example result of original templates.component)
  content = '',
): {
  // Content with injected all frontmatter
  content: string;
  // Separated frontmatter
  frontmatter: Record<any, any>;
} => {
  const {
    data: topContentFrontmatter = {},
    content: cuttedTopContent,
    // Without .trim() matter ignore some files
  } = matter(content.trim(), grayMatterOptions);

  let frontmatter = topContentFrontmatter;

  doc.docsBlocks?.forEach((blockContent, index) => {
    let formattedContent = blockContent.trim();
    const editLinkMatch = formattedContent.match(editLinkRegexp);

    // Cut edit-link for injection after parsing
    if (editLinkMatch) {
      formattedContent = formattedContent
        .replace(editLinkRegexp, '')
        .trim();
    }

    let {
      data,
      content: cuttedBlockContent
    } = matter(formattedContent, grayMatterOptions);

    if (editLinkMatch) {
      cuttedBlockContent = [
        editLinkMatch[0],
        cuttedBlockContent,
      ].join('\n\n');
    }

    frontmatter = defu(data, frontmatter);
    doc.docsBlocks[index] = cuttedBlockContent;
  });


  return {
    content: matter.stringify(cuttedTopContent, frontmatter, grayMatterOptions),
    frontmatter,
  };
};
