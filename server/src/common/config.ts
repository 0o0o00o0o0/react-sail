import * as fs from 'fs';
import * as path from 'path';

console.log(path.join(__dirname, `../../config/${process.env.NODE_ENV}.json`));

const config = JSON.parse(fs.readFileSync(path.join(__dirname, `../../config/${process.env.NODE_ENV}.json`)).toString());

export default config;
