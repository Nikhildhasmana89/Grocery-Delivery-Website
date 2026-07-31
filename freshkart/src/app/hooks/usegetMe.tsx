'use client'

import { AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

function usegetMe() {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        const getMe = async () => {
            try {
                const result = await axios.get("/api/me")
                dispatch(setUserData(result.data))
                console.log(result.data);
                
            } catch (error) {
                console.log(error);
                
            }
        }
        getMe()
    },[])
  
}

export default usegetMe
