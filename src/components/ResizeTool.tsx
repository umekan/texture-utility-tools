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
  Alert,
  FormControlLabel,
  Checkbox,
  Chip
} from '@mui/material'
import { Download, PhotoSizeSelectLarge } from '@mui/icons-material'
import { resizeImage, fileToBase64, base64ToDataUrl, downloadImage, getImageInfo, formatFileSize } from '../utils/imageUtils'
import type { ProcessedImage, ImageInfo } from '../utils/imageUtils'

interface ResizeToolProps {
  file: File
}

const ResizeTool: React.FC<ResizeToolProps> = ({ file }) => {
  const [originalImage, setOriginalImage] = useState<string>('')
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [targetWidth, setTargetWidth] = useState<number>(800)
  const [targetHeight, setTargetHeight] = useState<number>(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const presetSizes = [
    { name: 'HD', width: 1920, height: 1080 },
    { name: 'FHD', width: 1920, height: 1080 },
    { name: '4K', width: 3840, height: 2160 },
    { name: 'Instagram', width: 1080, height: 1080 },
    { name: 'Twitter', width: 1200, height: 675 },
    { name: 'Facebook', width: 1200, height: 630 },
  ]

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        const base64 = await fileToBase64(file)
        setOriginalImage(base64)
        const info = await getImageInfo(base64)
        setImageInfo(info)
        setTargetWidth(info.width)
        setTargetHeight(info.height)
      } catch {
        setError('画像の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [file])

  const handleResize = useCallback(async () => {
    if (!originalImage) return

    setIsProcessing(true)
    setError('')

    try {
      const result = await resizeImage(originalImage, {
        width: targetWidth,
        height: targetHeight,
        maintain_aspect_ratio: maintainAspectRatio
      })
      setProcessedImage(result)
    } catch (err) {
      setError('リサイズ処理に失敗しました: ' + (err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }, [originalImage, targetWidth, targetHeight, maintainAspectRatio])

  const handleDownload = () => {
    if (processedImage) {
      downloadImage(processedImage.data, processedImage.format, `resized_${file.name.split('.')[0]}`)
    }
  }

  const handlePresetSize = (preset: { width: number; height: number }) => {
    setTargetWidth(preset.width)
    setTargetHeight(preset.height)
  }

  const calculateAspectRatio = (width: number, height: number) => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(width, height)
    return `${width / divisor}:${height / divisor}`
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
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {imageInfo.width} × {imageInfo.height} | {formatFileSize(imageInfo.size_bytes)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  アスペクト比: {calculateAspectRatio(imageInfo.width, imageInfo.height)}
                </Typography>
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img
                src={base64ToDataUrl(originalImage, 'png')}
                alt="Original"
                style={{
                  maxWidth: '100%',
                  maxHeight: 250,
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              プリセットサイズ
            </Typography>
            <Box sx={{ mb: 2 }}>
              {presetSizes.map((preset) => (
                <Chip
                  key={preset.name}
                  label={`${preset.name} (${preset.width}×${preset.height})`}
                  onClick={() => handlePresetSize(preset)}
                  sx={{ m: 0.5 }}
                  variant="outlined"
                />
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              カスタムサイズ
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label="幅"
                  type="number"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="高さ"
                  type="number"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                />
              }
              label="アスペクト比を維持"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              startIcon={isProcessing ? <CircularProgress size={20} /> : <PhotoSizeSelectLarge />}
              onClick={handleResize}
              disabled={isProcessing}
              fullWidth
            >
              {isProcessing ? 'リサイズ中...' : 'リサイズ実行'}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              リサイズ結果
            </Typography>
            {processedImage ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {processedImage.width} × {processedImage.height} | {formatFileSize(processedImage.size_bytes)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    アスペクト比: {calculateAspectRatio(processedImage.width, processedImage.height)}
                  </Typography>
                  {imageInfo && (
                    <Typography variant="body2" color="text.secondary">
                      サイズ変化: {((processedImage.size_bytes / imageInfo.size_bytes - 1) * 100).toFixed(1)}%
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={base64ToDataUrl(processedImage.data, processedImage.format)}
                    alt="Resized"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 250,
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
                リサイズ結果がここに表示されます
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

export default ResizeTool