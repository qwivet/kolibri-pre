import { IKolibriFile } from './commonDataTypes';

export interface IKolibriFileReader {
  readFile: (file: IKolibriFile) => string;
}

export type IKolibriFileFactory = (file: string, fileReader: IKolibriFileReader) => IKolibriFile;

