import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ComponentPage } from './pages/ComponentPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/components/range" />,
      },
      {
        path: 'components/:componentName',
        element: <ComponentPage />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
