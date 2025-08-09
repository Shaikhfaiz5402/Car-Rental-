import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import HelmetCard from '../components/helmetCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Helmet = () => {

  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const { helmets = [], axios } = useAppContext()  // Default to [] if undefined

  const [input, setInput] = useState('')
  const [filteredHelmets, setFilteredHelmets] = useState([])

  const isSearchData = pickupLocation && pickupDate && returnDate

  const applyFilter = async () => {
    if(input === ''){
      setFilteredHelmets(helmets)
      return
    }

    const filtered = helmets.filter((helmet) => {
      return helmet.brand.toLowerCase().includes(input.toLowerCase())
        || helmet.model.toLowerCase().includes(input.toLowerCase())
        || helmet.category.toLowerCase().includes(input.toLowerCase())
        || (helmet.type && helmet.type.toLowerCase().includes(input.toLowerCase()))
    })

    setFilteredHelmets(filtered)
  }

  const searchHelmetAvailability = async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', { location: pickupLocation, pickupDate, returnDate })
      if (data.success) {
        setFilteredHelmets(data.availableHelmets || [])
        if ((data.availableHelmets || []).length === 0) {
          toast('No helmets available')
        }
      } else {
        toast.error('Failed to check helmet availability')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isSearchData) {
      searchHelmetAvailability()
    }
  }, [])

  useEffect(() => {
    if (helmets.length > 0 && !isSearchData) {
      applyFilter()
    }
  }, [input, helmets])

  return (
    <div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='flex flex-col items-center py-20 bg-light max-md:px-4'
      >
        <Title
          title='Available Helmets'
          subTitle='Browse our selection of premium helmets for your safety and comfort'
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
            placeholder='Search by brand, model, or features'
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
          Showing {filteredHelmets?.length ?? 0} Helmets
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredHelmets && filteredHelmets.length > 0 ? (
            filteredHelmets.map((helmet, index) => (
              <motion.div
                key={helmet._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <HelmetCard helmet={helmet} />
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-8">No helmets found.</p>
          )}
        </div>
      </motion.div>

    </div>
  )
}

export default Helmet
