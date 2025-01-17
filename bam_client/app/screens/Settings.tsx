import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
	navigation: NavigationProp<any, any>
}

const Settings = ({ navigation }: RouterProps) => {
	const [notificationsEnabled, setNotificationsEnabled] = useState(false)

	const toggleNotifications = () => {
		setNotificationsEnabled(previousState => !previousState)
	}

	const handleLogout = () => {
		console.log('Wylogowano')
		navigation.navigate('Login')
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
				<Icon name='lock' size={20} color='#FFFFFF' style={styles.icon} />
				<Text style={styles.settingText}>Zmień hasło</Text>
			</TouchableOpacity>
			<View style={styles.settingItem}>
				<Icon name='bell' size={20} color='#FFFFFF' style={styles.icon} />
				<Text style={styles.settingText}>Powiadomienia</Text>
				<Switch value={notificationsEnabled} onValueChange={toggleNotifications} style={styles.switch} />
			</View>
			<TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('PrivacySettings')}>
				<Icon name='user-secret' size={20} color='#FFFFFF' style={styles.icon} />
				<Text style={styles.settingText}>Ustawienia prywatności</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
				<Icon name='sign-out' size={20} color='#FFFFFF' style={styles.icon} />
				<Text style={styles.settingText}>Wyloguj się</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#25293C',
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
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
})

export default Settings
