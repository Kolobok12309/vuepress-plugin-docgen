import { access } from 'fs/promises';
import { constants } from 'fs';


export const isFileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, constants.R_OK);

    return true;
  } catch {
    return false;
  }
};
