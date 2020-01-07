import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import { typesetMath } from '../../../../helpers/mathjax';
import Button from '../../../components/Button';
import { DropdownItem, DropdownList } from '../../../components/Dropdown';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import { MenuToggle } from './DisplayNote';
import * as Styled from './ShowMyHighlightsStyles';
import Filters from './SummaryPopup/Filters';

interface Props {
  highlights: HighlightData[];
  deleteHighlight: typeof actions.deleteHighlight;
  updateHighlight: typeof actions.updateHighlight;
}

interface State {
  highlightIdToDelete: string | null;
  highlightIdToEdit: string | null;
  showGoToTop: boolean;
}

class ShowMyHighlights extends Component<Props, State> {
  public myHighlightsBodyRef = React.createRef<HTMLElement>();

  public state: State = {
    highlightIdToDelete: null,
    highlightIdToEdit: null,
    showGoToTop: false,
  };

  private scrollHandler: (() => void) | undefined;

  public scrollToTop = () => {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!highlightsBodyRef) {
      return;
    }

    highlightsBodyRef.scrollTop = 0;
  };

  public updateGoToTop = (bodyElement: HTMLElement) => () => {
    if (bodyElement.scrollTop > 0) {
      this.setState({ showGoToTop: true });
    } else {
      this.setState({ showGoToTop: false });
    }
  };

  public onHighlightEdit = (id: string) => {
    this.setState({ highlightIdToEdit: id });
  };

  public updateAnnotation = (annotation: string, highlight: HighlightData) => {
    this.props.updateHighlight({
      highlight: {annotation, color: highlight.color as string as HighlightUpdateColorEnum},
      id: highlight.id,
    });
    this.cancelEdit();
  };

  public updateColor = (color: string, id: string) => {
    this.props.updateHighlight({
      highlight: {color: color as HighlightUpdateColorEnum},
      id,
    });
    this.cancelEdit();
  };

  public cancelEdit = () => {
    this.setState({ highlightIdToEdit: null });
  };

  public onHighlightDelete = (id: string) => {
    this.setState({ highlightIdToDelete: id });
  };

  public deleteHighlight = () => {
    if (this.state.highlightIdToDelete) {
      this.props.deleteHighlight(this.state.highlightIdToDelete);
    }
    this.cancelDelete();
  };

  public cancelDelete = () => {
    this.setState({ highlightIdToDelete: null });
  };

  public componentDidMount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (isHtmlElement(highlightsBodyRef)) {
      this.scrollHandler = this.updateGoToTop(highlightsBodyRef);
      highlightsBodyRef.addEventListener('scroll', this.scrollHandler);
      typesetMath(highlightsBodyRef, assertWindow());
    }

  }

  public componentWillUnmount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (this.scrollHandler && isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.removeEventListener('scroll', this.scrollHandler);
    }
  }

  public render() {
    return (
      <Styled.ShowMyHighlightsBody
        ref={this.myHighlightsBodyRef}
        data-testid='show-myhighlights-body'
      >
        <Filters />
        <Styled.HighlightsChapter>2. Kinematics</Styled.HighlightsChapter>
        <Styled.HighlightWrapper>
          <Styled.HighlightSection>2.1 Displacement</Styled.HighlightSection>
          {this.props.highlights.map((item) => {
            return (
              <Styled.HighlightOuterWrapper key={item.id}>
                <HighlightToggleEdit
                  color={item.color}
                  onDelete={() => this.onHighlightDelete(item.id)}
                  onEdit={() => this.onHighlightEdit(item.id)}
                  onColorChange={(color) => this.updateColor(color, item.id)}
                />
                <Styled.HighlightContentWrapper color={item.color}>
                  <Styled.HighlightContent className='summary-highlight-content'
                    dangerouslySetInnerHTML={{ __html: item.highlightedContent }}
                  />
                  {item.annotation ? (
                    <HighlightAnnotation
                      annotation={item.annotation}
                      isEditable={this.state.highlightIdToEdit === item.id}
                      onSave={(anno) => this.updateAnnotation(anno, item)}
                      onCancel={this.cancelEdit}
                    />
                  ) : null}
                </Styled.HighlightContentWrapper>
                {this.state.highlightIdToDelete === item.id && <Styled.HighlightDeleteWrapper>
                  <FormattedMessage id='i18n:highlighting:confirmation:delete-both'>
                    {(msg: string) => <span>{msg}</span>}
                  </FormattedMessage>
                  <Styled.HighlightEditButtons>
                    <FormattedMessage id='i18n:highlighting:button:delete'>
                      {(msg: Element | string) => <Button
                        data-testid='delete'
                        data-analytics-label='delete'
                        size='medium'
                        variant='primary'
                        onClick={this.deleteHighlight}
                      >{msg}</Button>}
                    </FormattedMessage>
                    <FormattedMessage id='i18n:highlighting:button:cancel'>
                      {(msg: Element | string) => <Button
                        size='medium'
                        data-analytics-label='cancel'
                        data-testid='cancel'
                        onClick={this.cancelDelete}
                      >{msg}</Button>}
                    </FormattedMessage>
                  </Styled.HighlightEditButtons>
                </Styled.HighlightDeleteWrapper>}
              </Styled.HighlightOuterWrapper>
            );
          })}
        </Styled.HighlightWrapper>
        {this.state.showGoToTop && (
          <Styled.GoToTopWrapper
            onClick={this.scrollToTop}
            data-testid='back-to-top-highlights'
          >
            <Styled.GoToTop>
              <Styled.GoToTopIcon />
            </Styled.GoToTop>
          </Styled.GoToTopWrapper>
        )}
      </Styled.ShowMyHighlightsBody>
    );
  }
}

export default connect((state: AppState) => ({
  highlights: selectors.highlights(state),
}), (dispatch: Dispatch) => ({
  deleteHighlight: flow(actions.deleteHighlight, dispatch),
  updateHighlight: flow(actions.updateHighlight, dispatch),
}))(ShowMyHighlights);

interface HighlightToggleEditProps {
  color: HighlightColorEnum;
  onDelete: () => void;
  onEdit: () => void;
  onColorChange: (color: string) => void;
}

// tslint:disable-next-line:variable-name
const HighlightToggleEdit = ({ color, onColorChange, onEdit, onDelete }: HighlightToggleEditProps) => {
  const [open, setOpen] = React.useState(false);

  return <Styled.HighlightToggleEdit>
    <MenuToggle onClick={() => setOpen(!open)}/>
    {open && <Styled.HighlightToggleEditContent>
        <ColorPicker
          color={color}
          onChange={onColorChange}
          onRemove={() => { setOpen(false); onDelete(); }}
        />
        <DropdownList>
          <DropdownItem
            message='i18n:highlighting:dropdown:edit'
            prefix={<EditIcon/>}
            onClick={() => { setOpen(false); onEdit(); }}
          />
          <DropdownItem
            message='i18n:highlighting:dropdown:delete'
            prefix={<TrashAltIcon/>}
            onClick={() => { setOpen(false); onDelete(); }}
          />
        </DropdownList>
      </Styled.HighlightToggleEditContent>
    }
  </Styled.HighlightToggleEdit>;
};

interface HighlightAnnotationProps {
  annotation: string;
  isEditable: boolean;
  onSave: (annotation: string) => void;
  onCancel: () => void;
}

// tslint:disable-next-line:variable-name
const HighlightAnnotation = (
  { annotation, isEditable, onSave, onCancel }: HighlightAnnotationProps
) => {
  const [anno, setAnno] = React.useState(annotation);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
      return;
    } else if (e.key === 'Enter' && !e.shiftKey) {
      onSave(anno);
      return;
    }
  };

  return <Styled.HighlightNote>
    {isEditable
      ? <FormattedMessage id='i18n:highlighting:card:placeholder'>
        {(msg: string) => <textarea
          value={anno}
          placeholder={msg}
          onKeyDown={onKeyDown}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setAnno((e.target as { value: string }).value);
          }}
        />}
      </FormattedMessage>
      : <React.Fragment>
        <span>Note:</span>
        {annotation}
      </React.Fragment>
      }
    {isEditable && <Styled.HighlightEditButtons>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='medium'
          variant='primary'
          onClick={() => onSave(anno)}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='medium'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={onCancel}
        >{msg}</Button>}
      </FormattedMessage>
    </Styled.HighlightEditButtons>}
  </Styled.HighlightNote>;
};
