import React, { useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageBookings = () => {

  const { currency, axios } = useAppContext()
  const [bookings, setBookings] = useState([])

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/owner')
      data.success ? setBookings(data.bookings) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/bookings/change-status', { bookingId, status })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])

  // Helper to get vehicle info depending on type
  const getVehicleInfo = (booking) => {
    switch (booking.vehicleType) {
      case 'car':
        return {
          image: booking.car?.image,
          name: `${booking.car?.brand || ''} ${booking.car?.model || ''}`.trim(),
          category: booking.car?.category || '',
        }
      case 'bike':
        return {
          image: booking.bike?.image,
          name: `${booking.bike?.brand || ''} ${booking.bike?.model || ''}`.trim(),
          category: booking.bike?.category || '',
        }
      case 'helmet':
        return {
          image: booking.helmet?.image,
          name: booking.helmet?.name || '',
          category: booking.helmet?.category || '',
        }
      default:
        return {
          image: null,
          name: 'Unknown Vehicle',
          category: '',
        }
    }
  }

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>

      <Title title="Manage Bookings" subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses." />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">Vehicle</th>
              <th className="p-3 font-medium max-md:hidden">Date Range</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium max-md:hidden">Payment</th>
              <th className="p-3 font-medium">Mobile</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => {
              const vehicle = getVehicleInfo(booking)

              return (
                <tr key={index} className='border-t border-borderColor text-gray-500'>

                  <td className='p-3 flex items-center gap-3'>
                    {vehicle.image ? (
                      <img src={vehicle.image} alt={vehicle.name} className='h-12 w-12 aspect-square rounded-md object-cover' />
                    ) : (
                      <div className='h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400'>
                        No Image
                      </div>
                    )}
                    <p className='font-medium max-md:hidden'>{vehicle.name}</p>
                  </td>

                  <td className='p-3 max-md:hidden'>
                    {booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}
                  </td>

                  <td className='p-3'>{currency}{booking.price}</td>

                  <td className='p-3 max-md:hidden'>
                    <span className='bg-gray-100 px-3 py-1 rounded-full text-xs'>offline</span>
                  </td>

                  <td className='p-3'>{booking.mobile || "N/A"}</td>

                  <td className='p-3'>
                    <select
                      onChange={e => changeBookingStatus(booking._id, e.target.value)}
                      value={booking.status || 'pending'}
                      className='px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none'
                    >
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
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

export default ManageBookings
