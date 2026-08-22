'use client'

import { AppDispatch, RootState } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

function usegetMe() {
    const dispatch = useDispatch<AppDispatch>()
    const userData = useSelector((state: RootState) => state.user.userData)
    const fetchedRef = useRef(false)

    useEffect(() => {
        if (userData || fetchedRef.current) return;
        fetchedRef.current = true;

        const getMe = async () => {
            try {
                const result = await axios.get("/api/me")
                if (result.data?.user) {
                    dispatch(setUserData(result.data.user))
                }
            } catch (error) {
                // Guest user / unauthorized
            }
        }
        getMe()
    }, [userData, dispatch])
}

export default usegetMe
