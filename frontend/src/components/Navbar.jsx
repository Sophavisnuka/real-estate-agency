import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className='w-full'>
            <div className='w-full mx-auto flex justify-between items-center py-4 px-4 md:px-12 lg:px-20'>
                <Link to="/" className='cursor-pointer transition duration-250 ease-in-out hover:scale-110'>
                    <img src="/logo-blue-full.svg" alt="" className='w-16 md:w-20 py-2 px-2 transition duration-250 ease-in-out hover:scale-110'/>
                </Link>
                
                {/* Desktop Menu */}
                <ul className='hidden md:flex gap-8 text-[16px] text-black'>
                    <Link to="/"  className='cursor-pointer transition duration-250 ease-in-out hover:scale-110'>Home</Link>                    
                    <Link to="../properties"  className='cursor-pointer transition duration-250 ease-in-out hover:scale-110'>Properties</Link>                    
                    <Link to="/Contact" className='text-black cursor-pointer transition duration-250 ease-in-out hover:scale-110'>Contact</Link>
                    <Link to="/About"  className='cursor-pointer transition duration-250 ease-in-out hover:scale-110'>About Us</Link>                    
                </ul>

                {/* Mobile Menu Button */}
                <button 
                    className='md:hidden p-2 text-black'
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className='md:hidden bg-white border-t border-gray-200'>
                    <ul className='flex flex-col gap-4 px-4 py-4 text-[16px] text-black'>
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className='py-2 hover:bg-gray-100 px-2 rounded'>Home</Link>                    
                        <Link to="../properties" onClick={() => setIsMenuOpen(false)} className='py-2 hover:bg-gray-100 px-2 rounded'>Properties</Link>                    
                        <Link to="/Contact" onClick={() => setIsMenuOpen(false)} className='py-2 hover:bg-gray-100 px-2 rounded'>Contact</Link>
                        <Link to="/About" onClick={() => setIsMenuOpen(false)} className='py-2 hover:bg-gray-100 px-2 rounded'>About Us</Link>                    
                    </ul>
                </div>
            )}
        </div>
    )
}
export default Navbar;