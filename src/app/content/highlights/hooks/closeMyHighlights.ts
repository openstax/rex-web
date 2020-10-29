import { AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { closeMyHighlights } from '../actions';

export const hookBody = (services: MiddlewareAPI & AppServices) => services.history.goBack;

export const closeMyHighlightsHook = actionHook(closeMyHighlights, hookBody);
