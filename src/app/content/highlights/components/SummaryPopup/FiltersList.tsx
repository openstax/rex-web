import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import Times from '../../../../components/Times';
import { textStyle } from '../../../../components/Typography';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { book as bookSelector } from '../../../selectors';
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../../../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  flattenArchiveTree,
} from '../../../utils/archiveTreeUtils';
import { setSummaryFilters } from '../../actions';
import { summaryFilters } from '../../selectors';

// tslint:disable-next-line: variable-name
const RemoveIcon = styled.span`
  padding: 0.5rem;
  cursor: pointer;

  svg {
    height: 1rem;
    width: 1rem;
  }
`;

// tslint:disable-next-line: variable-name
const ItemLabel = styled.span`
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
`;

interface FiltersListColorProps {
  color: HighlightColorEnum;
  onRemove: (color: HighlightColorEnum) => void;
}

// tslint:disable-next-line: variable-name
const FiltersListColor = (props: FiltersListColorProps) => {
  const handleClick = () => {
    props.onRemove(props.color);
  };

  return <li>
    <RemoveIcon onClick={handleClick}><Times /></RemoveIcon>
    <ItemLabel>
      <FormattedMessage id={`i18n:highlighting:colors:${props.color}`}>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </ItemLabel>
  </li>;
};

interface FiltersListChapterProps {
  title: string;
  chapterId: string;
  onRemove: (chapterId: string) => void;
}

// tslint:disable-next-line: variable-name
const FiltersListChapter = (props: FiltersListChapterProps) => {
  const handleClick = () => {
    props.onRemove(props.chapterId);
  };

  return <li>
    <RemoveIcon onClick={handleClick}><Times /></RemoveIcon>
    <ItemLabel dangerouslySetInnerHTML={{ __html: props.title }} />
  </li>;
};

interface FiltersListProps {
  className?: string;
}

type SectionsMap = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>;

// tslint:disable-next-line: variable-name
const FiltersList = ({className}: FiltersListProps) => {
  const [sections, setSections] = React.useState<SectionsMap>(new Map());

  const book = useSelector(bookSelector);
  const filters = useSelector(summaryFilters);

  const dispatch = useDispatch();

  const onRemoveChapter = (chapterId: string) => {
    dispatch(setSummaryFilters({
      ...filters,
      chapters: filters.chapters.filter(not(match(chapterId))),
    }));
  };

  const onRemoveColor = (color: HighlightColorEnum) => {
    dispatch(setSummaryFilters({
      ...filters,
      colors: filters.colors.filter(not(match(color))),
    }));
  };

  React.useEffect(() => {
    if (book) {
      const newSections = new Map(
        flattenArchiveTree(book.tree).filter((section) =>
          (section.parent && archiveTreeSectionIsBook(section.parent))
          || archiveTreeSectionIsChapter(section)).map((s) => [s.id, s])
        );
      setSections(newSections);
    }
  }, [book]);

  return <ul className={className}>
    {filters.chapters.map((chapterId) => sections.has(chapterId) && <FiltersListChapter
      key={chapterId}
      title={sections.get(chapterId)!.title}
      chapterId={chapterId}
      onRemove={onRemoveChapter}
    />)}
    {filters.colors.map((color) => <FiltersListColor
      key={color}
      color={color}
      onRemove={onRemoveColor}
    />)}
  </ul>;
};

export default styled(FiltersList)`
  ${textStyle}
  font-size: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 0;
  padding: 2rem 0;
  list-style: none;

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}

  li {
    margin-right: 2rem;
    display: flex;
    align-items: center;
  }
`;
