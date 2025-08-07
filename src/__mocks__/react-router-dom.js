const React = require('react');

const mockBrowserRouter = ({ children }) =>
  React.createElement('div', { 'data-testid': 'browser-router' }, children);

const mockRoutes = ({ children }) =>
  React.createElement('div', { 'data-testid': 'routes' }, children);

const mockRoute = ({ children }) =>
  React.createElement('div', { 'data-testid': 'route' }, children);

const mockNavigate = () =>
  React.createElement('div', { 'data-testid': 'navigate' }, 'Navigate');

const mockLink = ({ children, to, ...props }) =>
  React.createElement('a', { href: to, ...props }, children);

const mockNavLink = ({ children, to, ...props }) =>
  React.createElement('a', { href: to, ...props }, children);

module.exports = {
  BrowserRouter: mockBrowserRouter,
  Routes: mockRoutes,
  Route: mockRoute,
  Navigate: mockNavigate,
  Link: mockLink,
  NavLink: mockNavLink,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useMatch: () => null,
  useMatches: () => [],
  useOutlet: () => null,
  useOutletContext: () => ({}),
  useResolvedPath: () => ({ pathname: '/', search: '', hash: '' }),
  useHref: () => '/',
  useInRouterContext: () => true,
  useNavigationType: () => 'POP',
  matchPath: () => null,
  resolvePath: () => ({ pathname: '/', search: '', hash: '' }),
  generatePath: () => '/',
  createPath: () => '/',
  parsePath: () => ({ pathname: '/', search: '', hash: '' }),
};
