import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="how-it-works" />
            <Stack.Screen name="slides" />
            <Stack.Screen name="permissions" />
            <Stack.Screen name="signup" />
            <Stack.Screen
                name="login"
                options={{
                    presentation: 'transparentModal',
                    animation: 'none',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
