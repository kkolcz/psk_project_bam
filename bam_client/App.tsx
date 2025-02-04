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
import { AuthProvider, useAuth } from './app/context/AuthContext'
import SendDocument from './app/screens/SendDocument'

const Stack = createStackNavigator()
const LoggedInStack = createStackNavigator()

function Inside({ setIsLogged }: { setIsLogged: (value: boolean) => void }) {
	const { token } = useAuth()

	return (
		<LoggedInStack.Navigator>
			<LoggedInStack.Screen
				name='Home'
				component={Home}
				options={{ headerShown: false, title: 'Start' }}></LoggedInStack.Screen>
			<LoggedInStack.Screen name='Documents' options={{ headerShown: true, title: 'Dokumenty' }}>
				{props => <Documents {...props} token={token} />}
			</LoggedInStack.Screen>
			<LoggedInStack.Screen
				name='DocDetails'
				component={DocDetails as React.ComponentType<any>}
				options={{ headerShown: false, title: 'Szczegóły' }}
			/>
			<LoggedInStack.Screen
				name='AddShared'
				component={AddShared}
				options={{ headerShown: false, title: 'Dodaj dokument' }}
			/>
			<LoggedInStack.Screen
				name='SendDocument'
				component={SendDocument}
				options={{ headerShown: false, title: 'Prześlij dokument' }}
			/>
			<LoggedInStack.Screen name='Settings' options={{ headerShown: false, title: 'Ustawienia' }}>
				{props => <Settings {...props} setIsLogged={setIsLogged} />}
			</LoggedInStack.Screen>
		</LoggedInStack.Navigator>
	)
}

function AppContent() {
	const [isLogged, setIsLogged] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const { setToken } = useAuth()

	useEffect(() => {
		checkIsUserLogged()
	}, [])

	const checkIsUserLogged = async () => {
		try {
			const token = await AsyncStorage.getItem('userToken')
			if (token) {
				authenticateUser()
				setIsLogged(true)
				setToken(token)
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
			<Stack.Navigator initialRouteName={isLogged ? 'LoggedIn' : 'Login'}>
				{isLogged ? (
					<Stack.Screen name='LoggedIn' options={{ headerShown: false }}>
						{props => <Inside {...props} setIsLogged={setIsLogged} />}
					</Stack.Screen>
				) : (
					<>
						<Stack.Screen name='Login' options={{ headerShown: false }}>
							{props => <Login {...props} setIsLogged={setIsLogged} />}
						</Stack.Screen>
						<Stack.Screen name='Register' options={{ headerShown: false }}>
							{props => <Register {...props} setIsLogged={setIsLogged} />}
						</Stack.Screen>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	)
}
