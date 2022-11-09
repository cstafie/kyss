import { v4 as uuidv4 } from 'uuid';

class Entity {
  id: string;
  createdAt: Date;

  constructor(id?: string) {
    this.id = id ? id : uuidv4();
    this.createdAt = new Date();
  }
}

export default Entity;
