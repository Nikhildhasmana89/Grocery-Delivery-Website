import React from 'react'
import { useEffect } from 'react';
import axios from 'axios';

function DeliveryBoyDashboard() {
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const result = await axios.get('/api/delivery/get-assignment');
        console.log('Assignment:', result);

      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    fetchAssignment();
  }, []);

  return (
    <div>
      
    </div>
  )
}

export default DeliveryBoyDashboard
