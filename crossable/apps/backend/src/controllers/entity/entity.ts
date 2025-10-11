class Entity {
  id: string;
  createdAt: Date;

  constructor(id?: string) {
    this.id = id ? id : crypto.randomUUID();
    this.createdAt = new Date();
  }
}

export default Entity;
