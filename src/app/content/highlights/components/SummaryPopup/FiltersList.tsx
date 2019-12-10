import React from 'react'
import styled, { css } from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { chaptersFilter, colorsFilter } from '../../selectors'
import { FormattedMessage } from 'react-intl'
import { HighlightColorEnum } from '@openstax/highlighter/dist/api'
import { setColorsFilter, setChaptersFilter } from '../../actions'
import { not, match } from '../../../../fpUtils'
import theme from '../../../../theme'
import { textStyle } from '../../../../components/Typography'
import { book as bookSelector } from '../../../selectors'
import { flattenArchiveTree, archiveTreeSectionIsBook, archiveTreeSectionIsChapter } from '../../../utils/archiveTreeUtils'
import { LinkedArchiveTree, LinkedArchiveTreeSection } from '../../../types'
import Times from '../../../../components/Times'
import { filtersChange } from '../../actions'

const RemoveIcon = styled.span`
  padding: 0.5rem;
  cursor: pointer;

  svg {
    height: 1rem;
    width: 1rem;
  }
`

const ItemLabel = styled.span`
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
`

interface FiltersListColorItemProps {
  type: 'colors'
  color: HighlightColorEnum
  onRemoveItem: (type: 'colors', color: HighlightColorEnum) => void
}

interface FiltersListChapterItemProps {
  type: 'chapters'
  title: string
  chapterId: string
  onRemoveItem: (type: 'chapters', chapterId: string) => void
}

type FiltersListItemProps = FiltersListColorItemProps | FiltersListChapterItemProps

const FiltersListItem = (props: FiltersListItemProps) => {
  const handleClick = () => {
    if (props.type === 'colors') {
      props.onRemoveItem(props.type, props.color)
    } else {
      props.onRemoveItem(props.type, props.chapterId)
    }
  }

  let body: JSX.Element | string
  if (props.type === 'colors') {
    body = <FormattedMessage id={`i18n:highlighting:colors:${props.color}`}>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  } else {
    body = <span dangerouslySetInnerHTML={{ __html: props.title }}/>
  }

  return <li>
    <RemoveIcon onClick={handleClick}><Times /></RemoveIcon>
    <ItemLabel>{body}</ItemLabel>
  </li>
}

interface FiltersListProps {
  className?: string
}

type SectionsMap = Map<string, LinkedArchiveTree | LinkedArchiveTreeSection>

const FiltersList = ({className}: FiltersListProps) => {
  const [sections, setSections] = React.useState<SectionsMap>(new Map())

  const book = useSelector(bookSelector);
  const selectedChapters = useSelector(chaptersFilter);
  const selectedColors = useSelector(colorsFilter);

  const dispatch = useDispatch();

  const setSelectedChapters = (chapterIds: string[]) => {
    dispatch(setChaptersFilter(chapterIds));
  }
  const setSelectedColors = (colors: HighlightColorEnum[]) => {
    dispatch(setColorsFilter(colors))
  }

  const onRemoveItem = (type: 'colors' | 'chapters', label: HighlightColorEnum | string) => {
    if (type === 'colors') {
      setSelectedColors(selectedColors.filter(not(match(label))))
    } else if (type === 'chapters') {
      setSelectedChapters(selectedChapters.filter(not(match(label))))
    }
  }

  React.useEffect(() => {
    if (book) {
      const sections = new Map(
        flattenArchiveTree(book.tree).filter((section) =>
          (section.parent && archiveTreeSectionIsBook(section.parent))
          || archiveTreeSectionIsChapter(section)).map(s => [s.id, s])
        )
      setSections(sections)
    }
  }, [book])

  React.useEffect(() => {
    dispatch(filtersChange())
  }, [selectedColors, selectedChapters])

  return <ul className={className}>
    {selectedChapters.map(chapterId => sections.has(chapterId) && <FiltersListItem
      key={chapterId}
      type="chapters"
      title={sections.get(chapterId)!.title}
      chapterId={chapterId}
      onRemoveItem={onRemoveItem}
    />)}
    {selectedColors.map(color => <FiltersListItem
      key={color}
      type="colors"
      color={color}
      onRemoveItem={onRemoveItem}
    />)}
  </ul>
}

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
`