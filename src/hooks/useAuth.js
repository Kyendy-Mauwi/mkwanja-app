import * as LocalAuthentication from 'expo-local-authentication';

export const useAuth = () => {
  const authenticate = async () => {
    try {
      // Check if hardware supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback: If no biometrics, we let them in (or you can prompt for PIN)
        console.warn("No biometrics detected on this device.");
        return true; 
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate Mkwanja',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (e) {
      console.error("Auth Error:", e);
      return false;
    }
  };

  return { authenticate };
};