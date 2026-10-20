import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import { AddVenuePage } from './pages/AddVenuePage'
import { LandingPage } from './pages/LandingPage'
import { ManageVenuePage } from './pages/ManageVenuePage'
import { SportPage } from './pages/SportPage'
import { VenuePage } from './pages/VenuePage'
import { DEFAULT_SPORT_PATH } from './utils/paths'

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/sports', element: <Navigate to={DEFAULT_SPORT_PATH} replace /> },
      { path: '/sports/:sportId', element: <SportPage /> },
      { path: '/sports/:sportId/venues/new', element: <AddVenuePage /> },
      { path: '/venues/:venueId', element: <VenuePage /> },
      { path: '/venues/:venueId/manage', element: <ManageVenuePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
