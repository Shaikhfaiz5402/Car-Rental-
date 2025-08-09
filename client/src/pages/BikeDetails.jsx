import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';

const BikeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bikes, currentUser, token } = useAppContext();

  const [bike, setBike] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bikeFound = bikes.find((item) => item._id === id);
    setBike(bikeFound);
  }, [bikes, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pickupDate || !returnDate || !mobile) {
      toast.error("Please fill all fields");
      return;
    }

    if (mobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        '/api/bookings/create',
        { bike: id, pickupDate, returnDate, mobile },
        { headers: { Authorization: token || localStorage.getItem('token') || '' } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/my-bookings');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!bike) return <Loader />;

  return (
    <motion.div
      className='p-4 md:p-10 flex flex-col md:flex-row gap-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Left: Bike Image */}
      <div className='w-full md:w-1/2'>
        <img src={bike.image} alt={bike.name} className='rounded-xl w-full h-auto' />
      </div>

      {/* Right: Bike Info & Booking */}
      <div className='w-full md:w-1/2 flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold'>{bike.name}</h1>
        <p className='text-gray-600'>{bike.description}</p>

        <div className='text-lg'>
          <span className='font-medium'>Price Per Day:</span> ₹{bike.pricePerDay}
        </div>
        <div className='text-md text-gray-700'>
          <span className='font-medium'>Location:</span> {bike.location}
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-6'>
          <div className='flex flex-col'>
            <label htmlFor="pickup">Pickup Date</label>
            <input
              type='date'
              id='pickup'
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
              className='border px-3 py-2 rounded-md'
            />
          </div>

          <div className='flex flex-col'>
            <label htmlFor="return">Return Date</label>
            <input
              type='date'
              id='return'
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
              className='border px-3 py-2 rounded-md'
            />
          </div>

          <div className='flex flex-col'>
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type='tel'
              id='mobile'
              value={mobile}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,10}$/.test(val)) setMobile(val);
              }}
              maxLength={10}
              required
              placeholder='e.g. 9876543210'
              className='border px-3 py-2 rounded-md'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50'
          >
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default BikeDetails;
