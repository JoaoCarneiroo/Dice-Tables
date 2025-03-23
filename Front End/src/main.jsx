import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'


// Criar uma nova instância do Router
const router = createRouter({ routeTree })

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </QueryClientProvider>
)
