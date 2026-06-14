// Admin layout — fully isolated. No Navbar, no global site chrome.
// The admin dashboard manages its own full-screen UI.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
