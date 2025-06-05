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
  Paper
} from '@mui/material'
import { Download, Compare, CloudUpload } from '@mui/icons-material'
import { compareImages, fileToBase64, base64ToDataUrl, downloadImage, getImageInfo, formatFileSize } from '../utils/imageUtils'
import type { ProcessedImage, ImageInfo } from '../utils/imageUtils'

interface DiffToolProps {
  file: File
}

const DiffTool: React.FC<DiffToolProps> = ({ file }) => {
  const [originalImage, setOriginalImage] = useState<string>('')
  const [secondImage, setSecondImage] = useState<string>('')
  const [secondFile, setSecondFile] = useState<File | null>(null)
  const [diffImage, setDiffImage] = useState<ProcessedImage | null>(null)
  const [originalInfo, setOriginalInfo] = useState<ImageInfo | null>(null)
  const [secondInfo, setSecondInfo] = useState<ImageInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        const base64 = await fileToBase64(file)
        setOriginalImage(base64)
        const info = await getImageInfo(base64)
        setOriginalInfo(info)
      } catch {
        setError('画像の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [file])

  const handleSecondFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    try {
      setSecondFile(selectedFile)
      const base64 = await fileToBase64(selectedFile)
      setSecondImage(base64)
      const info = await getImageInfo(base64)
      setSecondInfo(info)
      setError('')
    } catch {
      setError('2番目の画像の読み込みに失敗しました')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    if (imageFile) {
      handleSecondFileSelect(imageFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleSecondFileSelect(selectedFile)
    }
  }

  const handleCompare = useCallback(async () => {
    if (!originalImage || !secondImage) return

    setIsProcessing(true)
    setError('')

    try {
      const result = await compareImages(originalImage, secondImage)
      setDiffImage(result)
    } catch (err) {
      setError('画像比較に失敗しました: ' + (err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }, [originalImage, secondImage])

  const handleDownload = () => {
    if (diffImage && secondFile) {
      downloadImage(diffImage.data, diffImage.format, `diff_${file.name.split('.')[0]}_vs_${secondFile.name.split('.')[0]}`)
    }
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
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              画像1（ベース）
            </Typography>
            {originalInfo && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {originalInfo.width} × {originalInfo.height} | {formatFileSize(originalInfo.size_bytes)}
              </Typography>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img
                src={base64ToDataUrl(originalImage, 'png')}
                alt="Original"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {file.name}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              画像2（比較対象）
            </Typography>
            {secondImage ? (
              <>
                {secondInfo && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {secondInfo.width} × {secondInfo.height} | {formatFileSize(secondInfo.size_bytes)}
                  </Typography>
                )}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={base64ToDataUrl(secondImage, 'png')}
                    alt="Second"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                  {secondFile?.name}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={isProcessing ? <CircularProgress size={20} /> : <Compare />}
                  onClick={handleCompare}
                  disabled={isProcessing}
                  fullWidth
                >
                  {isProcessing ? '比較中...' : '差分を表示'}
                </Button>
              </>
            ) : (
              <Paper
                sx={{
                  border: `2px dashed ${isDragOver ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)'}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: isDragOver ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('second-file-input')?.click()}
              >
                <Box>
                  <CloudUpload sx={{ fontSize: 48, mb: 1, opacity: 0.6 }} />
                  <Typography variant="body1" gutterBottom>
                    比較する画像をドロップ
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    またはクリックして選択
                  </Typography>
                </Box>
              </Paper>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              id="second-file-input"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              差分結果
            </Typography>
            {diffImage ? (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {diffImage.width} × {diffImage.height} | {formatFileSize(diffImage.size_bytes)}
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img
                    src={base64ToDataUrl(diffImage.data, diffImage.format)}
                    alt="Difference"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    白い部分が差分のない領域、色付きの部分が差分のある領域です
                  </Typography>
                </Alert>
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
                差分結果がここに表示されます
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

      {originalInfo && secondInfo && (
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="body2">
              画像情報比較 - 
              画像1: {originalInfo.width}×{originalInfo.height} ({originalInfo.format.toUpperCase()}) | 
              画像2: {secondInfo.width}×{secondInfo.height} ({secondInfo.format.toUpperCase()})
              {originalInfo.width !== secondInfo.width || originalInfo.height !== secondInfo.height && 
                ' - サイズが異なるため、大きい方に合わせてリサイズして比較します'}
            </Typography>
          </Alert>
        </Grid>
      )}
    </Grid>
  )
}

export default DiffTool