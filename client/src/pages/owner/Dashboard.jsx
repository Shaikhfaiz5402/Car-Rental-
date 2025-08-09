import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { axios, isOwner } = useAppContext()

  const [data, setData] = useState({
    totalVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    { title: "Total Vehicles", value: data.totalVehicles, icon: assets.carIconColored },
    { title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored },
    { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed", value: data.confirmedBookings, icon: assets.listIconColored },
  ]

  const fetchDashboardData = async () => {
    try {
      // Assuming your API endpoint /api/owner/dashboard returns combined data for cars, bikes, helmets
      const { data } = await axios.get('/api/owner/dashboard')
      if (data.success) {
        // Combine totals: vehicles = cars + bikes + helmets
        const totalVehicles = (data.dashboardData.totalCars || 0) + (data.dashboardData.totalBikes || 0) + (data.dashboardData.totalHelmets || 0)

        // Combine recent bookings: assuming data.dashboardData.recentBookings is array with car, bike, helmet bookings mixed
        setData({
          totalVehicles,
          totalBookings: data.dashboardData.totalBookings || 0,
          pendingBookings: data.dashboardData.pendingBookings || 0,
          confirmedBookings: data.dashboardData.confirmedBookings || 0,
          recentBookings: data.dashboardData.recentBookings || [],
          monthlyRevenue: data.dashboardData.monthlyRevenue || 0,
        })
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData()
    }
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including total vehicles, bookings, revenue, and recent activities" />

      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor'>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* recent booking  */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full'>
          <h1 className='text-lg font-medium'>Recent Bookings</h1>
          <p className='text-gray-500'>Latest customer bookings</p>

          {data.recentBookings.length === 0 && (
            <p className='text-center text-gray-500 mt-6'>No recent bookings found.</p>
          )}

          {data.recentBookings.map((booking, index) => {
            // Identify booked item - car, bike or helmet
            const item = booking.car || booking.bike || booking.helmet
            if (!item) return null

            // Show item type for clarity
            let itemType = ''
            if (booking.car) itemType = 'Car'
            else if (booking.bike) itemType = 'Bike'
            else if (booking.helmet) itemType = 'Helmet'

            return (
              <div key={index} className='mt-4 flex items-center justify-between'>

                <div className='flex items-center gap-2'>
                  <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                    <img src={assets.listIconColored} alt="" className='h-5 w-5' />
                  </div>
                  <div>
                    <p>{item.brand} {item.model || item.name}</p>
                    <p className='text-sm text-gray-500'>{booking.createdAt.split('T')[0]}</p>
                    <p className='text-xs font-semibold text-primary'>{itemType}</p>
                  </div>
                </div>

                <div className='flex items-center gap-2 font-medium'>
                  <p className='text-sm text-gray-500'>₹{booking.price}</p>
                  <p className='px-3 py-0.5 border border-borderColor rounded-full text-sm'>{booking.status}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* monthly revenue */}
        <div className='p-4 md:p-6 mb-6 border border-borderColor rounded-md w-full md:max-w-xs'>
          <h1 className='text-lg font-medium'>Monthly Revenue</h1>
          <p className='text-gray-500'>Revenue for current month</p>
          <p className='text-3xl mt-6 font-semibold text-primary'>₹{data.monthlyRevenue}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
