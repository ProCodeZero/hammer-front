import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import MainLayout from './layout/MainLayout/MainLayout';
import { Compare } from './pages/Compare/Compare';
import FactionDetail from './pages/FactionDetail/FactionDetail';
import Factions from './pages/Factions/Factions';
import Home from './pages/Home/Home';
import NotFound from './pages/NotFound/NotFound';
import StatsPage from './pages/Stats/LazyStats';
import { UnitDetail } from './pages/UnitDetail/UnitDetail';
import Units from './pages/Units/Units';
import Weapons from './pages/Weapons/Weapons';
import { store } from './store/store';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'units', element: <Units /> },
      {
        path: 'units/:id',
        element: <UnitDetail />,
        errorElement: <NotFound message="Unit not found" />,
      },
      { path: 'factions', element: <Factions /> },
      {
        path: 'factions/:name',
        element: <FactionDetail />,
        errorElement: <NotFound message="Failed to load faction" />,
      },
      { path: 'weapons', element: <Weapons /> },
      { path: 'compare', element: <Compare /> },
      {
        path: 'stats',
        element: (
          <Suspense fallback={<div>Loading stats...</div>}>
            <StatsPage />
          </Suspense>
        ),
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
