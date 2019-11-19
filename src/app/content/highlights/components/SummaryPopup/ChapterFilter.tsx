import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import { textStyle } from '../../../../components/Typography/base';
import { match, not } from '../../../../utils';
import { isArchiveTree } from '../../../guards';
import * as selectContent from '../../../selectors';
import {
  archiveTreeContainsNode,
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  flattenArchiveTree
} from '../../../utils/archiveTreeUtils';
import ColorIndicator from '../ColorIndicator';

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const ChapterTitle = styled.span`
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  margin-left: 0.8rem;

  .os-divider {
    margin: 0 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
const ChapterFilter = ({className}: Props) => {
  const book = useSelector(selectContent.book);
  const page = useSelector(selectContent.page);

  const sections = book ? flattenArchiveTree(book.tree).filter((section) =>
    (section.parent && archiveTreeSectionIsBook(section.parent))
    || archiveTreeSectionIsChapter(section)
  ) : [];
  const sectionIds = sections.map((chapter) => chapter.id);
  const currentChapter = sections.find((section) =>
    page && isArchiveTree(section) && archiveTreeContainsNode(section, page.id)
  );
  const [selectedChapters, setSelectedChapters] = React.useState<string[]>(currentChapter ? [currentChapter.id] : []);

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedChapters([])}
      onAll={() => setSelectedChapters(sectionIds)}
    />
    {sections.map((chapter) => <Checkbox
      key={chapter.id}
      checked={selectedChapters.includes(chapter.id)}
      onChange={() => selectedChapters.includes(chapter.id)
        ? setSelectedChapters(selectedChapters.filter(not(match(chapter.id))))
        : setSelectedChapters([...selectedChapters, chapter.id])
      }
    >
      <ChapterTitle dangerouslySetInnerHTML={{__html: chapter.title}} />
    </Checkbox>)}
  </div>;
};

export default styled(ChapterFilter)`
  display: flex;
  flex-direction: column;
  ${textStyle}
  font-size: 1.4rem;
  padding: 0.8rem 1.6rem;
  outline: none;

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
