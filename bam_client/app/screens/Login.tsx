import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import { NavigationProp } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { API_URL_ANDROID, API_URL_WEB } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/AuthContext'

interface RouterProps {
	navigation: NavigationProp<any, any>
	setIsLogged: (value: boolean) => void
}

interface ILoginResponse {
	username: string
	token: string
}

const saveLoggedUser = async (username: string, token: string) => {
	try {
		await AsyncStorage.setItem('username', username)
		await AsyncStorage.setItem('userToken', token)
	} catch (error) {
		console.error('Error saving token:', error)
	}
}

const Login = ({ navigation, setIsLogged }: RouterProps) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const API_URL = Platform.OS === 'android' ? API_URL_ANDROID : API_URL_WEB

	const { setToken } = useAuth()

	const handleLogin = async () => {
		setLoading(true)
		console.log(`${API_URL}/account/login`)
		try {
			const response = await fetch(`${API_URL}/account/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors',
				body: JSON.stringify({ username: email, password: password }),
			})

			const data: ILoginResponse = await response.json()
			console.log(data)

			if (response.ok) {
				console.log('Login successful')
				setToken(data.token)
				saveLoggedUser(data.username, data.token)
				setIsLogged(true)
			} else {
				Alert.alert('Login failed')
			}
		} catch (error) {
			console.error('Error logging in:', error)
			Alert.alert('Login failed', 'An error occurred. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateAccount = () => {
		navigation.navigate('Register')
	}

	return (
		<View style={styles.container}>
			<Image source={require('../../assets/cryptodocs.png')} style={styles.image} />
			<View style={styles.inputContainer}>
				<Icon name='envelope' size={20} color='#000000' style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder='Wprowadź email'
					placeholderTextColor='#929292'
					value={email}
					onChangeText={setEmail}
					keyboardType='email-address'
					autoCapitalize='none'
				/>
			</View>
			<View style={styles.inputContainer}>
				<Icon name='lock' size={30} color='#000000' style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder='Wprowadź hasło'
					placeholderTextColor='#929292'
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>
			</View>
			<View style={styles.buttons}>
				<TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleLogin} disabled={loading}>
					<Text style={styles.buttonText}>{loading ? 'Logowanie...' : 'Zaloguj się'}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
					<Text style={styles.buttonText}>Utwórz konto</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		backgroundColor: '#25293C',
	},
	image: {
		width: 300,
		height: 150,
		marginTop: 50,
		marginBottom: 100,
	},
	label: {
		fontSize: 16,
		marginBottom: 8,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 12,
		paddingHorizontal: 8,
		borderRadius: 5,
		backgroundColor: '#FFFFFF',
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		height: 40,
		color: '#929292',
	},
	button: {
		width: '100%',
		marginTop: 12,
		padding: 10,
		alignItems: 'center',
		borderRadius: 5,
	},
	loginButton: {
		backgroundColor: '#42608A',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	buttons: {
		width: '100%',
	},
})

export default Login
