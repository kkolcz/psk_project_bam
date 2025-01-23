import { StatusBar } from 'expo-status-bar'
import { Alert, Linking, StyleSheet, Text, View } from 'react-native'
import Settings from './app/screens/Settings'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Login from './app/screens/Login'
import Register from './app/screens/Register'
import Home from './app/screens/Home'
import Documents from './app/screens/Documents'
import React, { useEffect, useState } from 'react'
import DocDetails from './app/screens/DocDetails'
import AddShared from './app/screens/AddShared'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createStackNavigator()

const InsideStack = createStackNavigator()

function InsideLayout({ setIsLogged }: { setIsLogged: (value: boolean) => void }) {
	return (
		<InsideStack.Navigator>
			<InsideStack.Screen name='Home' component={Home} />
			<InsideStack.Screen name='Documents' component={Documents} />
			<InsideStack.Screen name='DocDetails' component={DocDetails as React.ComponentType<any>} />
			<InsideStack.Screen name='AddShared' component={AddShared} />
			<InsideStack.Screen name='Settings'>
				{props => <Settings {...props} setIsLogged={setIsLogged} />}
			</InsideStack.Screen>
		</InsideStack.Navigator>
	)
}

export default function App() {
	const [isLogged, setIsLogged] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		checkIsUserLogged()
	}, [])

	const checkIsUserLogged = async () => {
		try {
			const token = await AsyncStorage.getItem('userToken')
			if (token) {
				authenticateUser()
				setIsLogged(true)
			} else {
				setIsLogged(false)
			}
		} catch (error) {
			console.error('Error checking token:', error)
		}
	}

	const authenticateUser = async () => {
		try {
			const isCompatible = await LocalAuthentication.hasHardwareAsync()
			if (!isCompatible) {
				Alert.alert('Biometric authentication is not supported')
				return
			}

			const hasBiometrics = await LocalAuthentication.isEnrolledAsync()
			if (!hasBiometrics) {
				Alert.alert('No biometric data enrolled', 'Go to device settings to set up fingerprint or Face ID.', [
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Open settings',
						onPress: () => Linking.openSettings(),
					},
				])
				return
			}

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Log in',
				fallbackLabel: 'Use PIN',
				disableDeviceFallback: false,
			})

			if (result.success) {
				setIsAuthenticated(true)
			} else {
				Alert.alert('Authentication failed', 'Please try again.')
			}
		} catch (error: any) {
			console.error(error)
			Alert.alert('An error occurred', error.message)
		}
	}
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={isLogged ? 'Inside' : 'Login'}>
				{isLogged ? (
					<Stack.Screen name='Inside' options={{ headerShown: false }}>
						{props => <InsideLayout {...props} setIsLogged={setIsLogged} />}
					</Stack.Screen>
				) : (
					<>
						<Stack.Screen name='Login'>{props => <Login {...props} setIsLogged={setIsLogged} />}</Stack.Screen>
						<Stack.Screen name='Register'>{props => <Register {...props} setIsLogged={setIsLogged} />}</Stack.Screen>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	)
}
