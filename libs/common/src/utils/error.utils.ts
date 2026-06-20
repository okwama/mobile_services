export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function errorIncludesKeyword(error: unknown, keyword: string): boolean {
  return getErrorMessage(error).toLowerCase().includes(keyword.toLowerCase());
}

export function getErrorStatusCode(error: unknown): number {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const code = (error as any).statusCode;
    if (typeof code === 'number') return code;
  }
  return 400;
}
