import { useState } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid2 as Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Paper,
  Button,
  IconButton,
  styled
} from '@mui/material'
import {
  ContentCut,
  Compare,
  PhotoSizeSelectLarge,
  Transform,
  ArrowBack,
  CloudUpload,
  Image as ImageIcon
} from '@mui/icons-material'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.1)',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            background: 'rgba(255, 255, 255, 0.25)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
})

const GradientBackground = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
})

const DropZone = styled(Paper)(({ theme, isDragOver }: { theme?: any; isDragOver: boolean }) => ({
  border: `2px dashed ${isDragOver ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)'}`,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  minHeight: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  background: isDragOver ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
  cursor: 'pointer',
}))

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: 300,
  borderRadius: 8,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
})

type Tool = 'crop' | 'diff' | 'resize' | 'convert' | null

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>(null)
  const [draggedFile, setDraggedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const tools = [
    { 
      id: 'crop', 
      name: 'トリミング', 
      description: '画像の一部を切り取ります', 
      icon: <ContentCut fontSize="large" />,
      color: '#FF6B6B'
    },
    { 
      id: 'diff', 
      name: '差分表示', 
      description: '2つの画像の差分を表示します', 
      icon: <Compare fontSize="large" />,
      color: '#4ECDC4'
    },
    { 
      id: 'resize', 
      name: 'リサイズ', 
      description: '画像のサイズを変更します', 
      icon: <PhotoSizeSelectLarge fontSize="large" />,
      color: '#45B7D1'
    },
    { 
      id: 'convert', 
      name: 'フォーマット変換', 
      description: '画像形式を変換します', 
      icon: <Transform fontSize="large" />,
      color: '#96CEB4'
    }
  ] as const

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
      setDraggedFile(imageFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setDraggedFile(file)
    }
  }

  const currentTool = tools.find(t => t.id === selectedTool)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GradientBackground>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Toolbar>
            <ImageIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Texture Utility Tools
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              画像ファイルの便利ツール集
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {!selectedTool ? (
            <Grid container spacing={3}>
              {tools.map((tool) => (
                <Grid xs={12} sm={6} md={3} key={tool.id}>
                  <Card>
                    <CardActionArea
                      onClick={() => setSelectedTool(tool.id as Tool)}
                      sx={{ p: 3, textAlign: 'center', minHeight: 200 }}
                    >
                      <Box sx={{ color: tool.color, mb: 2 }}>
                        {tool.icon}
                      </Box>
                      <Typography variant="h6" component="div" gutterBottom>
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, minHeight: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton 
                  onClick={() => setSelectedTool(null)}
                  sx={{ mr: 2 }}
                >
                  <ArrowBack />
                </IconButton>
                <Box sx={{ color: currentTool?.color, mr: 2 }}>
                  {currentTool?.icon}
                </Box>
                <Typography variant="h5" component="div">
                  {currentTool?.name}
                </Typography>
              </Box>

              <DropZone
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {draggedFile ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      選択されたファイル: {draggedFile.name}
                    </Typography>
                    <PreviewImage 
                      src={URL.createObjectURL(draggedFile)} 
                      alt="Preview" 
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <CloudUpload sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} />
                    <Typography variant="h6" gutterBottom>
                      画像ファイルをドラッグ&ドロップ
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                      または下のボタンからファイルを選択してください
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      size="large"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ファイルを選択
                    </Button>
                  </Box>
                )}
              </DropZone>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-input"
              />
            </Paper>
          )}
        </Container>
      </GradientBackground>
    </ThemeProvider>
  )
}

export default App
