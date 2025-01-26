import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import * as DocumentPicker from 'expo-document-picker'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
	navigation: NavigationProp<any, any>
}

const Home = ({ navigation }: RouterProps) => {
	const pickDocument = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: '*/*',
				copyToCacheDirectory: true,
			})

			if (result.canceled) {
				// console.log('Wybór pliku anulowany.')
			} else {
				// console.log('Wybrano plik:', result.assets[0].uri)
			}
		} catch (error) {
			console.error('Błąd przy wyborze pliku:', error)
		}
	}

	return (
		<View style={styles.container}>
			<Image source={require('../../assets/cryptodocs.png')} resizeMode='contain' style={styles.image} />
			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Documents')}>
				<Icon name='file' size={20} color='#fff' />
				<Text style={styles.buttonText}>Moje dokumenty</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SendDocument')}>
				<Icon name='upload' size={20} color='#fff' />
				<Text style={styles.buttonText}>Prześlij dokument</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddShared')}>
				<Icon name='plus' size={20} color='#fff' />
				<Text style={styles.buttonText}>Dodaj udostępniony</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
				<Icon name='cog' size={20} color='#fff' />
				<Text style={styles.buttonText}>Ustawienia</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#25293C',
	},
	image: {
		width: 300,
		height: 150,
		marginTop: 100,
		marginBottom: 100,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#42608A',
		padding: 10,
		marginVertical: 10,
		width: '80%',
		borderRadius: 5,
	},
	buttonText: {
		color: '#fff',
		marginLeft: 10,
		fontSize: 16,
	},
})

export default Home
