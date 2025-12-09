import DashboardLayout from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import DocumentPage from '@/pages/DocumentPage';
import EditDocument from '@/pages/EditDocument';
import Images from '@/pages/Images';
import Login from '@/pages/Login';
import Members from '@/pages/Members';
import NewDocument from '@/pages/NewDocument';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import type { Route } from './type';

export const routeConfig: Route[] = [
  {
    path: '/',
    component: Login,
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    isProtected: true,
    children: [
      {
        index: true,
        component: Dashboard,
      },
      {
        path: 'members',
        component: Members,
      },
      {
        path: 'docs/create',
        component: NewDocument,
      },
      {
        path: 'docs/edit/:id',
        component: EditDocument,
      },
      {
        path: 'docs/:id',
        component: DocumentPage,
      },
      {
        path: 'images',
        component: Images,
      },
      {
        path: 'settings',
        component: Settings,
      },
    ],
  },
  {
    path: '*',
    component: NotFound,
  }
];