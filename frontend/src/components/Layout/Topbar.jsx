import React from 'react'
import {TbBrandMeta} from 'react-icons/tb'
import {IoLogoInstagram} from 'react-icons/io'
import {RiTwitterXLine} from 'react-icons/ri'


const Topbar = () => {
  return (
    <div className='bg-black text-gray-200 rubik'>
      <div className='container mx-auto flex justify-between items-center py-3'>
        <div className='hidden md:flex items-center space-x-4 ml-5'>
            <a href="#" className='hover:text-gray-300'>
                <TbBrandMeta className='h-5 w-5'/>
            </a>
            <a href="#" className='hover:text-gray-300'>
                <IoLogoInstagram className='h-5 w-5'/>
            </a>
            <a href="#" className='hover:text-gray-300'>
                <RiTwitterXLine className='h-4 w-4'/>
            </a>
        </div>
        <div className='text-sm text-center flex-grow'>
            <span>WE SHIP WORLDWIDE - FAST AND RELIABLE SHIPPING!</span>
        </div>
        <div className='text-sm hidden md:block mr-5'>
            <a href="tel:+1234567890" className='hover:text-gray-300'>
                +1 (234) 567890
            </a>
        </div>
      </div>
    </div>
  )
}

export default Topbar
