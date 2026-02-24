import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from './slider'
import Map from './map.jsx'
import Navbar from '../Navbar';
import Footer from '../Footer';
import PropertyCard from './PropertyCard';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PropertyDetails = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [imageIndex, setImageIndex] = useState(null);
    const [similarProperties, setSimilarProperties] = useState([]);
    const [showVisitForm, setShowVisitForm] = useState(false);
    const [visitDate, setVisitDate] = useState('');
    const [visitNotes, setVisitNotes] = useState('');
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);

    const handleRequestVisit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error("Please login to request a visit.");
            return;
        }
        try {
            await axios.post(`${BASE_URL}/api/requests`,
                { propertyId: id, preferredDate: visitDate, notes: visitNotes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Visit request submitted successfully!");
            setShowVisitForm(false);
        } catch (error) {
            toast.error("Failed to submit visit request.");
        }
    };

    const handleVisitRequest = () => {
        const token = localStorage.getItem('userToken');

        if (token) {
            navigate(`/properties/${id}/request-visit`);
        } else {
            setShowLogin(true);
        }
    };

    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post(`${BASE_URL}/api/user/auth/google-login`, {
                token: credentialResponse.credential,
            });

            if (res.data.token) {
                localStorage.setItem('userToken', res.data.token);
                setShowLogin(false);
                navigate(`/properties/${id}/request-visit`);
            } else {
                console.error('Login failed: No token received:', res.data.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    // Lock scroll when popup is active
    useEffect(() => {
        if (imageIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Clean up on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [imageIndex]);

    // Fetch property details
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/properties/${id}`);
                setProperty(res.data.data);
            } catch (error) {
                console.error('Failed to fetch property', error);
            }
        };

        fetchProperty();
    }, [id]);

    useEffect(() => {
        const fetchSimilarProperties = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/properties/similar/${id}`);
                const filteredProperties = res.data.data.sort(() => 0.5 - Math.random()).slice(0, 2);
                setSimilarProperties(filteredProperties);
            } catch (error) {
                console.error('Failed to fetch similar properties', error);
            }
        };

        fetchSimilarProperties();
    }, [id]);

    if (!property) return <p>Property not found</p>

    return (
        <div className='w-full'>
            <Navbar />  
            <div className='px-4 sm:px-8 md:px-12 lg:px-20 w-full h-full flex flex-col lg:flex-row gap-5 py-6'>
                <div className='flex-1 lg:flex-[3]'>
                    <div className='flex flex-col gap-5'>
                        <Slider
                            thumbnail={property.property_thumbnail}
                            images={property.images} 
                            imageIndex={imageIndex} 
                            setImageIndex={setImageIndex} />
                        <div className='info'>
                            <div className='flex flex-col sm:flex-row justify-between gap-5'>
                                <div className='flex flex-col gap-3 w-full'>
                                    <h1 className='font-semibold text-xl md:text-2xl lg:text-[27px]'>{property.title}</h1>
                                    <div className='flex gap-2 items-center text-xs sm:text-sm md:text-[14px] text-gray-500'>
                                        <img className='w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]' src="/pin.png" alt="" />
                                        <span>{property.address}, {property.city}</span>
                                    </div>
                                    <div className='w-max rounded-[5px] font-semibold text-lg md:text-xl lg:text-[20px] text-green-600'>$ {Number(property.price).toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={handleVisitRequest}
                                    className="bg-blue-900 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-800 transition h-fit w-full sm:w-auto"
                                >
                                    Request Visit
                                </button>
                            </div>
                            {showLogin && (
                                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 bg-black/50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                        <p className="mb-4">Please login to continue</p>
                                        <GoogleLogin
                                            onSuccess={handleLoginSuccess}
                                            onError={() => {
                                                console.log('Login Failed');
                                            }}
                                        />
                                        <button
                                            className="mt-4 text-sm text-red-600 underline"
                                            onClick={() => setShowLogin(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                            {showVisitForm && (
                                <form onSubmit={handleRequestVisit} className="mt-4 p-4 border rounded-lg">
                                    <h3 className="font-semibold mb-2">Request a Visit</h3>
                                    <div className="mb-2">
                                        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">Preferred Date</label>
                                        <input type="date" id="visitDate" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="visitNotes" className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea id="visitNotes" value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                                    </div>
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Submit Request</button>
                                    <button type="button" onClick={() => setShowVisitForm(false)} className="ml-2 text-gray-600">Cancel</button>
                                </form>
                            )}
                            <div className='mt-[15px] text-xs sm:text-sm md:text-[14px] text-gray-500 leading-[18px] sm:leading-[20px]'>
                                {property.description}
                            </div>

                            <div className='details flex flex-col gap-5 md:gap-7 mt-6 md:mt-10'>
                                <div className='Details '>
                                    <h1 className='font-semibold text-base md:text-lg'>Details</h1>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-7 mt-5'>
                                        <div className='utility flex gap-3 items-center'>
                                            <img className='w-[30px] h-[30px]' src="/size.png" alt="" />
                                            <div>
                                                <h1>{property.size} m²</h1>
                                            </div>
                                        </div>
                                        <div className='pet flex gap-3 items-center'>
                                            <img className='w-[30px] h-[30px]' src="/bed.png" alt="" />
                                            <div>
                                                <h1>{property.bedrooms} Beds</h1>
                                            </div>
                                        </div>
                                        <div className='property fee flex gap-3 items-center'>
                                            <img className='w-[30px] h-[30px]' src="/bath.png" alt="" />
                                            <div>
                                                <h1>{property.bathrooms} Bathrooms</h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(property.swimming_pool || property.gym || property.parking_lot || property.garden || property.balcony || property.elevator) && (
                                    <div className='General'>
                                        <h1 className='font-semibold text-base md:text-lg'>Amenities</h1>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-7 mt-5'>
                                            {property.swimming_pool && (
                                                <div className='w-full flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/swimming.png" alt="" />
                                                    <div>
                                                        <h1 className='w-[50px]'>Swimming Pool</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.parking_lot && (
                                                <div className='flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/garage.png" alt="" />
                                                    <div>
                                                        <h1>Parking Lot</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.garden && (
                                                <div className='property fee flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/garden.png" alt="" />
                                                    <div>
                                                        <h1>Garden</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.gym && (
                                                <div className='property fee flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/gym.png" alt="" />
                                                    <div>
                                                        <h1>Gym</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.balcony && (
                                                <div className='property fee flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/balcony.png" alt="" />
                                                    <div>
                                                        <h1>Balcony</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.elevator && (
                                                <div className='property fee flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/elevator.png" alt="" />
                                                    <div>
                                                        <h1>Elevator</h1>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(property.security || property.fire_security || property.non_flooding) && (
                                    <div className='security'>
                                        <h1 className='font-semibold text-base md:text-lg'>Security</h1>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-7 mt-5'>
                                            {property.fire_security && (
                                                <div className='utility flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/fire.png" alt="" />
                                                    <div>
                                                        <h1>Fire Security</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.security && (
                                                <div className='pet flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/security.png" alt="" />
                                                    <div>
                                                        <h1>Security</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.non_flooding && (
                                                <div className='property fee flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/nonflooding.png" alt="" />
                                                    <div>
                                                        <h1>Non-Flooding</h1>
                                                    </div>
                                                </div>                                        
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(property.commercial_area || property.playground || property.common_area) && (
                                    <div className='community'>
                                        <h1 className='font-semibold text-base md:text-lg'>Community Area</h1>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-7 mt-5'>
                                            {property.commercial_area && (
                                                <div className='utility flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/commercial.png" alt="" />
                                                    <div>
                                                        <h1 className='w-[50px]'>Commercial Area</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {(property.playground) && (
                                                <div className='pet flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/playground.png" alt="" />
                                                    <div>
                                                        <h1>Playground</h1>
                                                    </div>
                                                </div>
                                            )}
                                            {property.common_area && (
                                                <div className='property fee flex gap-3 items-center'>
                                                    <img className='w-[30px] h-[30px]' src="/common.png" alt="" />
                                                    <div>
                                                        <h1>Common Area</h1>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='mt-8 md:mt-12'>
                        <h1 className='font-semibold text-lg md:text-xl lg:text-[22px] mb-4'>Similar Properties</h1>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'>
                            {similarProperties.map(property => (
                                <PropertyCard key={property.id} property={property} className='flex flex-col gap-3' />
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex flex-col flex-1 lg:flex-[2] mt-6 lg:mt-0'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='font-semibold text-lg md:text-[20px]'>Location</h1>
                        <Map key={property.location_url} src={property.location_url}/>
                    </div>
                    {/* end */}
                </div>
            </div>
            <Footer />
        </div>
    )
};

export default PropertyDetails;