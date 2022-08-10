import createIntl from '../../../../src/test/createIntl';
import { book } from '../../../test/mocks/archiveLoader';
import * as downloadFileModule from '../utils/downloadFile';
import * as generateBookPageSpreadsheetModule from '../utils/generateBookPageSpreadsheet';
import { exportBookHandler } from './Books';

describe('export book', () => {
  it('works', async() => {
    const downloadFile = jest.spyOn(downloadFileModule, 'downloadFile');
    const generateBookPageSpreadsheet = jest.spyOn(generateBookPageSpreadsheetModule, 'generateBookPageSpreadsheet');

    const intl = createIntl();

    const handler = exportBookHandler(book, intl);

    const spreadsheet = 'spreadsheet';
    generateBookPageSpreadsheet.mockImplementation(async() => spreadsheet);

    await handler();

    expect(generateBookPageSpreadsheet).toHaveBeenCalled();
    expect(downloadFile).toHaveBeenCalledWith('Test Book 1.csv', spreadsheet);
  });
});
