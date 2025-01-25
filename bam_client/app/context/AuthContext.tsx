import React, { createContext, useState, useContext, ReactNode } from 'react'

interface AuthContextProps {
	token: string
	setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string>('')

	return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
