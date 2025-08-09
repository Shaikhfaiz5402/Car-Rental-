import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageVehicles = () => {
  const { isOwner, axios, currency } = useAppContext()

  const [vehicles, setVehicles] = useState([])

  // Fetch cars, bikes, helmets and merge
  const fetchOwnerVehicles = async () => {
    try {
      const [carsRes, bikesRes, helmetsRes] = await Promise.all([
        axios.get('/api/owner/cars'),
        axios.get('/api/owner/bikes'),
        axios.get('/api/owner/helmets'),
      ])

      if (carsRes.data.success && bikesRes.data.success && helmetsRes.data.success) {
        // Add vehicleType field for all
        const cars = carsRes.data.cars.map(car => ({ ...car, vehicleType: 'car' }))
        const bikes = bikesRes.data.bikes.map(bike => ({ ...bike, vehicleType: 'bike' }))
        const helmets = helmetsRes.data.helmets.map(helmet => ({ ...helmet, vehicleType: 'helmet' }))

        setVehicles([...cars, ...bikes, ...helmets])
      } else {
        toast.error('Failed to fetch vehicles')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleAvailability = async (vehicleId, vehicleType) => {
    try {
      // Your backend might have separate routes or unified
      const urlMap = {
        car: '/api/owner/toggle-car',
        bike: '/api/owner/toggle-bike',
        helmet: '/api/owner/toggle-helmet',
      }
      const { data } = await axios.post(urlMap[vehicleType], { id: vehicleId })

      if (data.success) {
        toast.success(data.message)
        fetchOwnerVehicles()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteVehicle = async (vehicleId, vehicleType) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this vehicle?')
      if (!confirmDelete) return null

      const urlMap = {
        car: '/api/owner/delete-car',
        bike: '/api/owner/delete-bike',
        helmet: '/api/owner/delete-helmet',
      }
      const { data } = await axios.post(urlMap[vehicleType], { id: vehicleId })

      if (data.success) {
        toast.success(data.message)
        fetchOwnerVehicles()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchOwnerVehicles()
    }
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>

      <Title
        title="Manage Vehicles"
        subTitle="View all listed vehicles, update their details, or remove them from the booking platform."
      />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">Vehicle</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle, index) => {
              // Normalize fields depending on vehicleType
              const {
                _id,
                image,
                brand,
                model,
                category,
                pricePerDay,
                isAvaliable,
                vehicleType,
                seating_capacity,
                transmission,
              } = vehicle

              return (
                <tr key={index} className='border-t border-borderColor'>

                  <td className='p-3 flex items-center gap-3'>
                    <img src={image} alt={`${brand} ${model}`} className="h-12 w-12 aspect-square rounded-md object-cover" />
                    <div className='max-md:hidden'>
                      {/* For helmet, brand/model might not exist */}
                      <p className='font-medium'>
                        {vehicleType === 'helmet'
                          ? model || brand || 'Helmet'
                          : `${brand} ${model}`}
                      </p>
                      {vehicleType !== 'helmet' && (
                        <p className='text-xs text-gray-500'>{seating_capacity} • {transmission}</p>
                      )}
                    </div>
                  </td>

                  <td className='p-3 max-md:hidden'>{category}</td>
                  <td className='p-3'>{currency}{pricePerDay}/day</td>

                  <td className='p-3 max-md:hidden'>
                    <span className={`px-3 py-1 rounded-full text-xs ${isAvaliable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                      {isAvaliable ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  <td className='flex items-center p-3 gap-3'>

                    <img
                      onClick={() => toggleAvailability(_id, vehicleType)}
                      src={isAvaliable ? assets.eye_close_icon : assets.eye_icon}
                      alt="Toggle Availability"
                      className='cursor-pointer'
                      title={isAvaliable ? "Make Unavailable" : "Make Available"}
                    />

                    <img
                      onClick={() => deleteVehicle(_id, vehicleType)}
                      src={assets.delete_icon}
                      alt="Delete Vehicle"
                      className='cursor-pointer'
                      title="Delete Vehicle"
                    />
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>

      </div>

    </div>
  )
}

export default ManageVehicles
