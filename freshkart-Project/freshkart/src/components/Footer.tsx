import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 text-slate-400 font-sans border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/60">
          
          {/* Brand Column */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-xs font-black">
                🛒
              </div>
              <span className="text-base font-black text-white tracking-tight">
                Fresh<span className="text-emerald-400">Kart</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Fast and reliable grocery delivery. Fresh daily essentials delivered straight to your doorstep in minutes.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Home & Products
                </Link>
              </li>
              <li>
                <Link href="/user/cart" className="hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/user/my-orders" className="hover:text-emerald-400 transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Account
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/edit-profile" className="hover:text-emerald-400 transition-colors">
                  Edit Profile & Role
                </Link>
              </li>
              <li>
                <Link href="/user/my-orders" className="hover:text-emerald-400 transition-colors">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Service
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>10-Minute Express Delivery</li>
              <li>100% Safe Payments</li>
              <li>Fresh Quality Guaranteed</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} FreshKart Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>Privacy & Terms</span>
            <span>•</span>
            <span>Instant Grocery Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
