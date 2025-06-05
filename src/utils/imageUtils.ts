import { invoke } from '@tauri-apps/api/core'

export interface CropParams {
  x: number
  y: number
  width: number
  height: number
}

export interface ResizeParams {
  width: number
  height: number
  maintain_aspect_ratio: boolean
}

export interface ConvertParams {
  format: string
  quality?: number
}

export interface ProcessedImage {
  data: string
  format: string
  width: number
  height: number
  size_bytes: number
}

export interface ImageInfo {
  width: number
  height: number
  format: string
  size_bytes: number
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const base64ToDataUrl = (base64: string, format: string): string => {
  return `data:image/${format};base64,${base64}`
}

export const downloadImage = (base64: string, format: string, filename: string) => {
  const dataUrl = base64ToDataUrl(base64, format)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${filename}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Tauri command wrappers
export const cropImage = async (base64Data: string, params: CropParams): Promise<ProcessedImage> => {
  console.log('Calling crop_image_command with params:', params)
  return await invoke('crop_image_command', { base64Data, params })
}

export const resizeImage = async (base64Data: string, params: ResizeParams): Promise<ProcessedImage> => {
  return await invoke('resize_image_command', { base64Data, params })
}

export const convertImage = async (base64Data: string, params: ConvertParams): Promise<ProcessedImage> => {
  return await invoke('convert_image_command', { base64Data, params })
}

export const compareImages = async (base64Data1: string, base64Data2: string): Promise<ProcessedImage> => {
  return await invoke('compare_images_command', { base64Data1, base64Data2 })
}

export const getImageInfo = async (base64Data: string): Promise<ImageInfo> => {
  return await invoke('get_image_info_command', { base64Data })
}