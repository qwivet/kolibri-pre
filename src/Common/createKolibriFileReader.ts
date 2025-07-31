import * as fs from 'fs';
import { IKolibriFileReader } from './interfaces';
import { IKolibriFile } from '../interfaces';

export const createKolibriFileReader = (): IKolibriFileReader => ({
  readFile: (file: IKolibriFile): string => fs.readFileSync(file.fullLocation(), 'utf8'),
});
