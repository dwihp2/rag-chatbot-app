import Constants from 'expo-constants';

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === 'development') {
    // Handle different development environments
    let origin = 'http://localhost:8081';

    if (Constants.experienceUrl) {
      origin = Constants.experienceUrl.replace('exp://', 'http://');
    } else if (Constants.debuggerHost) {
      origin = `http://${Constants.debuggerHost.split(':')[0]}:8081`;
    }

    return origin.concat(path);
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL environment variable is not defined',
    );
  }

  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};