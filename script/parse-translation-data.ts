import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import pl from '../src/app/messages/pl/pl.json';

(global as any).fetch = fetch;

const parseTranslationData = (file: any) => {
    const polish = file.reduce((acc: {[key: string]: string}, row: {[key: string]: string}) => {
        acc[row.title] = row.polish;
        return acc;
      }, {});
    const plMessages = path.resolve(__dirname, '../src/app/messages/pl/messages.json');
    fs.writeFileSync(plMessages, JSON.stringify(polish, undefined, 2) + '\n', 'utf8');
};

parseTranslationData(pl);
