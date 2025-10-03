export const isIncognitoMode = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return false;
  } catch (e) {
    return true;
  }
};

class MemoryStorage implements Storage {
  private data: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  key(index: number): string | null {
    return Object.keys(this.data)[index] || null;
  }

  get length(): number {
    return Object.keys(this.data).length;
  }
}

export const getStorage = () => {
  if (isIncognitoMode()) {
    return new MemoryStorage();
  }
  return localStorage;
};