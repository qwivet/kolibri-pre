import * as path from 'path';
import { IKolibriFileReader } from './interfaces';
import { IKolibriFile } from '../interfaces';

export const createKolibriFile = (filePath: string, fileReader: IKolibriFileReader): IKolibriFile => {
  const fullPath = path.resolve(filePath);
  const file: IKolibriFile = {
    fullLocation: (): string => fullPath,
    relativeLocation: (): string => path.relative(process.cwd(), fullPath),
    fileType: (): string => path.extname(fullPath) || '',
    readFile: (): string => fileReader.readFile(file),
  };
  return file;
};
