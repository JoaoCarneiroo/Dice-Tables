import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { UserProvider } from './context/UserContext'


// Criar uma nova instância do Router
const router = createRouter({ routeTree })

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </UserProvider>
  </QueryClientProvider>
)
