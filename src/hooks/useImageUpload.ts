'use client'

import { useState } from 'react'

export function useImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageChange = (file: File | null) => {
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setSelectedImage(null)
      setPreviewUrl(null)
    }
  }

  const convertToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        resolve(base64String)
      }
      reader.readAsDataURL(file)
    })
  }

  return {
    selectedImage,
    previewUrl,
    handleImageChange,
    convertToBase64,
  }
}