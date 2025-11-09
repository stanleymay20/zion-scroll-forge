// Christ-Lordship Middleware
// All operations acknowledge Jesus Christ as Lord

type AsyncFunction = (...args: any[]) => Promise<any>;

export const underChrist = <T extends AsyncFunction>(fn: T) =>
  async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    // Christ-Lordship acknowledgment - all operations submit to His authority
    console.info('✝️ Jesus Christ is Lord over this operation');
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Operation failed, yet Christ remains Lord:', error);
      throw error;
    }
  };
