import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material'
import { Download, Crop } from '@mui/icons-material'
import { cropImage, fileToBase64, base64ToDataUrl, downloadImage, getImageInfo, formatFileSize } from '../utils/imageUtils'
import type { ProcessedImage, ImageInfo } from '../utils/imageUtils'

interface CropToolProps {
  file: File
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const CropTool: React.FC<CropToolProps> = ({ file }) => {
  const [originalImage, setOriginalImage] = useState<string>('')
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        const base64 = await fileToBase64(file)
        setOriginalImage(base64)
        const info = await getImageInfo(base64)
        setImageInfo(info)
        setCropArea({
          x: 0,
          y: 0,
          width: Math.min(info.width, 200),
          height: Math.min(info.height, 200)
        })
      } catch {
        setError('画像の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [file])

  const handleCrop = useCallback(async () => {
    if (!originalImage || !imageInfo) return

    setIsProcessing(true)
    setError('')

    try {
      const result = await cropImage(originalImage, {
        x: cropArea.x,
        y: cropArea.y,
        width: cropArea.width,
        height: cropArea.height
      })
      setProcessedImage(result)
    } catch (err) {
      setError('トリミング処理に失敗しました: ' + (err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }, [originalImage, cropArea, imageInfo])

  const handleDownload = () => {
    if (processedImage) {
      downloadImage(processedImage.data, processedImage.format, `cropped_${file.name.split('.')[0]}`)
    }
  }

  const handleCropAreaChange = (field: keyof CropArea) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(event.target.value) || 0)
    setCropArea(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              元画像
            </Typography>
            {imageInfo && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {imageInfo.width} × {imageInfo.height} | {formatFileSize(imageInfo.size_bytes)}
              </Typography>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img
                src={base64ToDataUrl(originalImage, 'png')}
                alt="Original"
                style={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              トリミング範囲
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="X座標"
                  type="number"
                  value={cropArea.x}
                  onChange={handleCropAreaChange('x')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: imageInfo?.width || 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Y座標"
                  type="number"
                  value={cropArea.y}
                  onChange={handleCropAreaChange('y')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: imageInfo?.height || 0 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="幅"
                  type="number"
                  value={cropArea.width}
                  onChange={handleCropAreaChange('width')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: imageInfo ? imageInfo.width - cropArea.x : 100 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="高さ"
                  type="number"
                  value={cropArea.height}
                  onChange={handleCropAreaChange('height')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: imageInfo ? imageInfo.height - cropArea.y : 100 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={isProcessing ? <CircularProgress size={20} /> : <Crop />}
                onClick={handleCrop}
                disabled={isProcessing}
                fullWidth
              >
                {isProcessing ? 'トリミング中...' : 'トリミング実行'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              トリミング結果
            </Typography>
            {processedImage ? (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {processedImage.width} × {processedImage.height} | {formatFileSize(processedImage.size_bytes)}
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={base64ToDataUrl(processedImage.data, processedImage.format)}
                    alt="Cropped"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  fullWidth
                >
                  ダウンロード
                </Button>
              </>
            ) : (
              <Box
                sx={{
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                  color: 'text.secondary'
                }}
              >
                トリミング結果がここに表示されます
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Grid>
      )}
    </Grid>
  )
}

export default CropTool