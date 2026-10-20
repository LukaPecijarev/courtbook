import { Outlet, useLocation } from 'react-router-dom'
import { PageTransition } from './components/PageTransition'
import { AccentCursor } from './components/landing/AccentCursor'
import { pageKey } from './utils/paths'

function App() {
  const { pathname } = useLocation()

  return (
    <>
      <PageTransition>
        <Outlet />
      </PageTransition>
      <AccentCursor key={pageKey(pathname)} />
    </>
  )
}

export default App
