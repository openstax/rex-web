import attributionText from './attributionText';
import copyrightText from './footerCopyrightText';
import json from './messages.json';

export default {
  ...json,
  'i18n:attribution:text': attributionText,
  'i18n:footer:copyright:top-text': copyrightText,
};
