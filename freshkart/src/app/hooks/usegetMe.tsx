'use client'

import axios from 'axios'
import { log } from 'console'
import React, { useEffect } from 'react'

function usegetMe() {
    useEffect(() => {
        const getMe = async () => {
            try {
                const result = await axios.get("/api/me")
                console.log(result.data);
                
            } catch (error) {
                console.log(error);
                
            }
        }
    })
  return (
    <div>
      
    </div>
  )
}

export default usegetMe
