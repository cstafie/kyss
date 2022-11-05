import { v4 as uuidv4 } from 'uuid';

export const charToTile = (char: string) => ({ id: uuidv4(), char });
