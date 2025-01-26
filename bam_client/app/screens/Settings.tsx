import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { NavigationProp } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface RouterProps {
	navigation: NavigationProp<any, any>
	setIsLogged: (value: boolean) => void
}

const Settings = ({ navigation, setIsLogged }: RouterProps) => {
	const [notificationsEnabled, setNotificationsEnabled] = useState(false)

	const toggleNotifications = () => {
		setNotificationsEnabled(previousState => !previousState)
	}

	const handleLogout = async () => {
		// console.log('Wylogowano')
		await AsyncStorage.removeItem('userToken')
		setIsLogged(false)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Ustawienia</Text>
			<View>
				<TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('')}>
					<Icon name='envelope' size={17} color='#FFFFFF' style={[styles.icon, styles.changePassword]} />
					<Text style={[styles.settingText]}>Zmień adres email</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('')}>
					<Icon name='lock' size={27} color='#FFFFFF' style={[styles.icon, styles.changePassword]} />
					<Text style={[styles.settingText]}>Zmień hasło</Text>
				</TouchableOpacity>
				<View style={styles.settingItem}>
					<Icon name='bell' size={21} color='#FFFFFF' style={styles.icon} />
					<Text style={styles.settingText}>Powiadomienia</Text>
					<Switch value={notificationsEnabled} onValueChange={toggleNotifications} style={styles.switch} />
				</View>
				<TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('')}>
					<Icon name='user-secret' size={24} color='#FFFFFF' style={styles.icon} />
					<Text style={styles.settingText}>Ustawienia prywatności</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
					<Icon name='sign-out' size={24} color='#FFFFFF' style={styles.icon} />
					<Text style={styles.settingText}>Wyloguj się</Text>
				</TouchableOpacity>
			</View>
			<View>
				<TouchableOpacity style={[styles.button, styles.buttonBack]} onPress={() => navigation.goBack()}>
					<Text style={styles.buttonText}>Powrót</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#25293C',
		justifyContent: 'space-between',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 16,
		textAlign: 'center',
		marginTop: 50,
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
		height: 70,
	},
	icon: {
		marginRight: 10,
	},
	settingText: {
		flex: 1,
		fontSize: 16,
		color: '#FFFFFF',
	},
	switch: {
		marginLeft: 'auto',
	},
	button: {
		width: '100%',
		marginTop: 12,
		padding: 10,
		alignItems: 'center',
		borderRadius: 5,
		backgroundColor: '#42608A',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	buttonBack: {
		marginBottom: 50,
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
	},
	changePassword: {
		marginLeft: 3,
	},
})

export default Settings
