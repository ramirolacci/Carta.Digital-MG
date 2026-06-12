// src/components/layout/Layout.jsx
import Header from './Header';
import ToastContainer from '../common/ToastContainer';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-background text-text">
    <Header />
    <main className="flex-1 mt-0 pt-0">
      {children}
    </main>
    <ToastContainer />
  </div>
);

export default Layout;
