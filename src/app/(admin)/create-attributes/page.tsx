"use client";

import FormAttributes from '@/components/story-creation/formAttributes'
import  { useState } from 'react'
import { Attributes } from '../../../../roomsStore';

function page() {
    const [formAttributeData, setFormAttributeData] = useState<Attributes>({
        id: "-1", // id es string
        name: "",
        unlockable: false,
        unlock_threshold: 1,
      });
  return (
     <FormAttributes
        formAttributeData={formAttributeData}
        setFormAttributeData={setFormAttributeData}
     />

  )
}

export default page