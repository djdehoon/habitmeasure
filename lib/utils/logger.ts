/**
 * Development-only logger
 * Logs only when NODE_ENV === 'development'
 */
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export const devError = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error(...args);
  }
};
