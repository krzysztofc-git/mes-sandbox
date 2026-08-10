import { Provider } from '@/components/ui/provider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Box } from '@chakra-ui/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <Box padding="10px" maxWidth="720px" marginInline="auto">
        <App />
      </Box>
    </Provider>
  </StrictMode>
)
