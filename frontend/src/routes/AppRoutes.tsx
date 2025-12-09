import { Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import { routeConfig } from './routeConfig';
import type { Route as RouteT } from './type';

function renderRoutes(routes: RouteT[]) {
  return routes.map(({ path, component, isProtected, index, children }) => {
    const Component = component as React.ComponentType<any>;
    const element = isProtected ? (
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    ) : (
      <Component />
    );
      
    return index ? (
      <Route key='index' index element={element}></Route>
    ): (
      <Route key={path} path={path} element={element}>
        {children && renderRoutes(children)}
      </Route>
    );
  });
}

export default function AppRoutes() {
  return <Routes>{renderRoutes(routeConfig)}</Routes>;
}