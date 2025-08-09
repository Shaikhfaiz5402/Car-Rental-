import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Cars = () => {
  // Get URL search params for filtering availability
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  // Get cars and axios instance from app context, default cars to empty array
  const { cars = [], axios } = useAppContext()

  // Input for search/filter box
  const [input, setInput] = useState('')

  // State to hold filtered cars shown in UI
  const [filteredCars, setFilteredCars] = useState([])

  // Flag to check if search data is complete (to trigger availability check)
  const isSearchData = pickupLocation && pickupDate && returnDate

  // Apply filter based on search input
  const applyFilter = async () => {
    if (!cars || cars.length === 0) {
      setFilteredCars([])
      return
    }
    if (input === '') {
      setFilteredCars(cars)
      return
    }
    const filtered = cars.filter(car => {
      return car.brand.toLowerCase().includes(input.toLowerCase())
        || car.model.toLowerCase().includes(input.toLowerCase())
        || car.category.toLowerCase().includes(input.toLowerCase())
        || car.transmission.toLowerCase().includes(input.toLowerCase())
    })
    setFilteredCars(filtered)
  }

  // Search car availability via API call
  const searchCarAvailability = async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate,
        returnDate
      })

      if (data.success) {
        setFilteredCars(data.availableCars || [])
        if (!data.availableCars || data.availableCars.length === 0) {
          toast('No cars available')
        }
      } else {
        setFilteredCars([])
        toast.error('Failed to check car availability')
      }
    } catch (error) {
      setFilteredCars([])
      toast.error(error.message)
    }
  }

  // On component mount, if search data exists, fetch availability
  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability()
    }
  }, []) // run once

  // Whenever cars or input changes, update filtered cars if no searchData
  useEffect(() => {
    if (cars.length > 0 && !isSearchData) {
      applyFilter()
    }
  }, [input, cars])

  return (
    <div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='flex flex-col items-center py-20 bg-light max-md:px-4'
      >
        <Title
          title='Available Vehicles'
          subTitle='Browse our selection of premium vehicles available for your next adventure'
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'
        >
          <img src={assets.search_icon} alt="Search Icon" className='w-4.5 h-4.5 mr-2' />

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder='Search by make, model, or features'
            className='w-full h-full outline-none text-gray-500'
          />

          <img src={assets.filter_icon} alt="Filter Icon" className='w-4.5 h-4.5 ml-2' />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'
      >
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>
          Showing {filteredCars ? filteredCars.length : 0} Vehicles
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars && filteredCars.length > 0 ? (
            filteredCars.map((car, index) => (
              <motion.div
                key={car._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <CarCard car={car} />
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-8">No vehicles found.</p>
          )}
        </div>
      </motion.div>

    </div>
  )
}

export default Cars
