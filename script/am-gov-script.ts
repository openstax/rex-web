import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import amGov from '../src/canonicalBookMap/test';

(global as any).fetch = fetch;

const parseAmGov = (file: any) => {
    const amGovNew = path.resolve(__dirname, './am-gov-dump.ts');
    const amgov1e = file['5bcc0e59-7345-421d-8507-a1e4608685e8'][0][1];
    const amgov2e = file['9d8df601-4f12-4ac1-8224-b450bf739e5f'][0][1];
    // include comments

    (Object.keys(amgov1e) as Array<keyof typeof amgov1e>).forEach((key1e: any) => {
        const value1e = amgov1e[key1e];
        const first = `'${key1e}'`;
        let second;
        if (amgov2e[value1e]) {
            second = `'${amgov2e[value1e]}'`;
        } else {
            second = `'${value1e}'`;
        }
        const full = `${first}: ${second}`;
        fs.appendFileSync(amGovNew, full + ',\n');
    });
};

parseAmGov(amGov);
