import { Search } from "lucide-react";

const categories = ["All", "Food", "Groceries", "Pharmacy", "Beauty", "Courier"];

export const SearchFilters = ({ filters, onChange }) => (
  <div className="space-y-5 rounded-[1.8rem] bg-white/[0.05] p-5">
    <div className="flex items-center gap-3 rounded-2xl bg-base-950/60 px-4 py-4">
      <Search size={18} className="text-base-400" />
      <input
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        placeholder="Search vendors, cuisine, or essentials"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-base-400"
      />
    </div>
    <div className="flex gap-3 overflow-x-auto pb-1">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange({ category })}
          className={`rounded-full px-4 py-2 text-sm transition ${
            filters.category === category ? "bg-white text-base-950" : "bg-white/10 text-base-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);
