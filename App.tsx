import React, { useEffect } from 'react';
import { Button, LogBox, Text, View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Add error fallback component
const ErrorFallback = (props: { error: Error; resetError: () => void }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Something went wrong:</Text>
    <Text>{props.error.toString()}</Text>
    <Button title="Try again" onPress={props.resetError} />
  </View>
);

function App(): React.JSX.Element {
  useEffect(() => {
    // Log all warnings in development
    if (__DEV__) {
      LogBox.ignoreAllLogs(false);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SafeAreaProvider>
        {/* ...existing code... */}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;