import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material'
import { Download, Transform } from '@mui/icons-material'
import { convertImage, fileToBase64, base64ToDataUrl, downloadImage, getImageInfo, formatFileSize } from '../utils/imageUtils'
import type { ProcessedImage, ImageInfo } from '../utils/imageUtils'

interface ConvertToolProps {
  file: File
}

const ConvertTool: React.FC<ConvertToolProps> = ({ file }) => {
  const [originalImage, setOriginalImage] = useState<string>('')
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>('png')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const supportedFormats = [
    { value: 'png', label: 'PNG', description: 'ロスレス圧縮、透明度サポート' },
    { value: 'jpg', label: 'JPEG', description: 'ロッシー圧縮、小ファイルサイズ' },
    { value: 'webp', label: 'WebP', description: '高効率圧縮、モダンブラウザー対応' },
    { value: 'bmp', label: 'BMP', description: '無圧縮、大ファイルサイズ' },
    { value: 'gif', label: 'GIF', description: 'アニメーション対応、256色制限' },
  ]

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        const base64 = await fileToBase64(file)
        setOriginalImage(base64)
        const info = await getImageInfo(base64)
        setImageInfo(info)
        
        // Set target format to something different from original
        const currentFormat = info.format.toLowerCase()
        if (currentFormat !== 'png') {
          setTargetFormat('png')
        } else {
          setTargetFormat('jpg')
        }
      } catch {
        setError('画像の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [file])

  const handleConvert = useCallback(async () => {
    if (!originalImage) return

    setIsProcessing(true)
    setError('')

    try {
      const result = await convertImage(originalImage, {
        format: targetFormat
      })
      setProcessedImage(result)
    } catch (err) {
      setError('フォーマット変換に失敗しました: ' + (err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }, [originalImage, targetFormat])

  const handleDownload = () => {
    if (processedImage) {
      downloadImage(processedImage.data, processedImage.format, `converted_${file.name.split('.')[0]}`)
    }
  }


  const getCompressionEstimate = (originalFormat: string, targetFormat: string) => {
    const compressionMap: { [key: string]: number } = {
      'bmp': 100,
      'png': 30,
      'jpg': 10,
      'webp': 8,
      'gif': 20
    }
    
    const originalSize = compressionMap[originalFormat.toLowerCase()] || 30
    const targetSize = compressionMap[targetFormat.toLowerCase()] || 30
    
    return Math.round((targetSize / originalSize) * 100)
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
                <Chip 
                  label={`現在のフォーマット: ${imageInfo.format.toUpperCase()}`} 
                  color="primary" 
                  size="small"
                  sx={{ mt: 1 }}
                />
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>変換先フォーマット</InputLabel>
              <Select
                value={targetFormat}
                label="変換先フォーマット"
                onChange={(e) => setTargetFormat(e.target.value)}
              >
                {supportedFormats.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    <Box>
                      <Typography variant="body1">{format.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {imageInfo && targetFormat !== imageInfo.format.toLowerCase() && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  予想ファイルサイズ変化: 
                  {getCompressionEstimate(imageInfo.format, targetFormat) > 100 ? '+' : ''}
                  {getCompressionEstimate(imageInfo.format, targetFormat) - 100}%
                </Typography>
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={isProcessing ? <CircularProgress size={20} /> : <Transform />}
              onClick={handleConvert}
              disabled={isProcessing || (imageInfo && targetFormat === imageInfo.format.toLowerCase())}
              fullWidth
            >
              {isProcessing ? '変換中...' : 'フォーマット変換'}
            </Button>

            {imageInfo && targetFormat === imageInfo.format.toLowerCase() && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                同じフォーマットが選択されています
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              変換結果
            </Typography>
            {processedImage ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {processedImage.width} × {processedImage.height} | {formatFileSize(processedImage.size_bytes)}
                  </Typography>
                  <Chip 
                    label={`新しいフォーマット: ${processedImage.format.toUpperCase()}`} 
                    color="secondary" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  {imageInfo && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ファイルサイズ変化: {((processedImage.size_bytes / imageInfo.size_bytes - 1) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {processedImage.size_bytes < imageInfo.size_bytes ? '✅ ファイルサイズが削減されました' : '⚠️ ファイルサイズが増加しました'}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={base64ToDataUrl(processedImage.data, processedImage.format)}
                    alt="Converted"
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
                変換結果がここに表示されます
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

export default ConvertTool