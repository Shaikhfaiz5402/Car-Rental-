import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])
    const [bikes, setBikes] = useState([])
    const [helmets, setHelmets] = useState([])  // ✅ Added helmets state

    // Function to check if user is logged in
    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/user/data')
            if (data.success) {
                setUser(data.user)
                setIsOwner(data.user.role === 'owner')
            } else {
                navigate('/')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch all cars from the server
    const fetchCars = async () => {
        try {
            const { data } = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to fetch all bikes from the server
    const fetchBikes = async () => {
        try {
            const { data } = await axios.get('/api/user/bikes')
            data.success ? setBikes(data.bikes) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ✅ Function to fetch all helmets from the server
    const fetchHelmets = async () => {
        try {
            const { data } = await axios.get('/api/user/helmets')
            data.success ? setHelmets(data.helmets) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to log out the user
    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }

    // Retrieve token & fetch data
    useEffect(() => {
        const token = localStorage.getItem('token')
        setToken(token)
        fetchCars()
        fetchBikes()
        fetchHelmets()   // ✅ Fetch helmets on load
    }, [])

    // Fetch user data when token is available
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    }, [token])

    const value = {
        navigate,
        currency,
        axios,
        user,
        setUser,
        token,
        setToken,
        isOwner,
        setIsOwner,
        fetchUser,
        showLogin,
        setShowLogin,
        logout,
        fetchCars,
        cars,
        setCars,
        fetchBikes,
        bikes,
        setBikes,
        fetchHelmets,  // ✅ Added to context
        helmets,       // ✅ Added to context
        setHelmets,    // ✅ Added to context
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}
