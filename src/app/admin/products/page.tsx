import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/actions/products";
import { format } from "date-fns";

export default async function AdminProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your luxury hair inventory and variants.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-[#1A1A1D] text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>
// ... (filters)
      {/* Filters & Search */}
      <div className="bg-white p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 text-sm border-gray-100 focus:border-[#1A1A1D] focus:ring-0 transition-colors bg-gray-50/50"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 text-sm font-medium hover:bg-gray-50 transition-all bg-white whitespace-nowrap">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <select className="px-4 py-2 border border-gray-100 text-sm font-medium hover:bg-gray-50 transition-all bg-white outline-none">
            <option>All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Base Price</th>
                <th className="px-8 py-5">Created At</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Package className="w-10 h-10 stroke-1" />
                      <p className="text-sm font-medium uppercase tracking-widest">No products found</p>
                      <Link href="/admin/products/new" className="text-xs text-blue-600 hover:underline mt-2">Create your first product</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-[#FAF9F6] border border-gray-100 flex-shrink-0 overflow-hidden relative">
                          <Image 
                            src={product.image || "/hero_luxury_wig_1773402385371.png"} 
                            alt={product.name} 
                            fill
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold uppercase tracking-wide truncate max-w-[200px]">{product.name}</span>
                          <span className="text-[11px] text-gray-400 font-mono tracking-tighter truncate max-w-[200px]">{product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-medium text-gray-600 uppercase tracking-widest">
                      {product.category}
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold">
                      ${Number(product.base_price).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-[12px] text-gray-400">
                      {product.created_at ? format(new Date(product.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/${product.id}`} className="p-2 border border-gray-100 hover:bg-white hover:border-[#1A1A1D] transition-all">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="p-2 border border-gray-100 hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
