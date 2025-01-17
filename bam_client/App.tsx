import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import Settings from './app/screens/Settings'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import Login from './app/screens/Login'
import Register from './app/screens/Register'
import Home from './app/screens/Home'
import Documents from './app/screens/Documents'
import React, { useState } from 'react'
import DocDetails from './app/screens/DocDetails'
import AddShared from './app/screens/AddShared'

const Stack = createStackNavigator()

const InsideStack = createStackNavigator()

function InsideLayout() {
	return (
		<InsideStack.Navigator>
			<InsideStack.Screen name='Home' component={Home} />
			<InsideStack.Screen name='Documents' component={Documents} />
			<InsideStack.Screen name='DocDetails' component={DocDetails as React.ComponentType<any>} />
			<InsideStack.Screen name='AddShared' component={AddShared} />
			<InsideStack.Screen name='Settings' component={Settings} />
		</InsideStack.Navigator>
	)
}

export default function App() {
	const [isLogged, setIsLogged] = useState(false)

	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={isLogged ? 'Inside' : 'Login'}>
				{isLogged ? (
					<Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }} />
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
