import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  Search,
  Code2,
  Database,
  ArrowRight,
  FolderSearch
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Compass },
  { id: 'analytics', name: 'Business Analytics', icon: BarChart3 },
  { id: 'sales', name: 'Sales & Revenue', icon: TrendingUp },
  { id: 'customers', name: 'Customer Insights', icon: Users },
  { id: 'exploration', name: 'Data Exploration', icon: FolderSearch },
  { id: 'trends', name: 'Trends & Aggregations', icon: Sparkles },
  { id: 'advanced', name: 'Advanced SQL', icon: Code2 }
];

export default function ExploreSection({
  currentDbName,
  tables = [],
  onSelectPrompt
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically generate schema-aware suggestions based on active database tables
  const generatedSuggestions = useMemo(() => {
    const tableNames = tables.map(t => t.name.toLowerCase());
    const hasStudents = tableNames.includes('students');
    const hasDepts = tableNames.includes('departments');

    const items = [];

    // 1. If students/departments are present (the default college DB)
    if (hasStudents && hasDepts) {
      items.push(
        {
          category: 'analytics',
          title: 'Department GPA Performance',
          question: 'Calculate the average GPA of students grouped by department name.',
          description: 'Aggregates student academic scores by joining departments and students.',
          complexity: 'Intermediate'
        },
        {
          category: 'analytics',
          title: 'Top Performing Department',
          question: 'Which department has the highest average student GPA?',
          description: 'Calculates department averages and orders by highest rank.',
          complexity: 'Intermediate'
        },
        {
          category: 'customers',
          title: 'High Honor Students',
          question: 'Find all students with a GPA greater than 9.0 sorted in descending order.',
          description: 'Filters for top achievers with custom threshold criteria.',
          complexity: 'Basic'
        },
        {
          category: 'customers',
          title: 'Computer Science Cohort',
          question: "List all students enrolled in the 'Computer Science' department.",
          description: 'Relational filter linking students to specific department title.',
          complexity: 'Basic'
        },
        {
          category: 'trends',
          title: 'Enrollment Distribution',
          question: 'Count the total number of students registered in each department.',
          description: 'Grouped aggregation displaying departmental headcounts.',
          complexity: 'Basic'
        },
        {
          category: 'trends',
          title: 'Academic Score Summary',
          question: 'Calculate the minimum, maximum, and average GPA across all students.',
          description: 'Multi-aggregate statistical summary of student metrics.',
          complexity: 'Basic'
        },
        {
          category: 'exploration',
          title: 'Student Roster Overview',
          question: 'Show the top 5 students ordered by GPA with their department name.',
          description: 'Joined multi-column view with limit and sorting applied.',
          complexity: 'Intermediate'
        },
        {
          category: 'exploration',
          title: 'Registered Departments List',
          question: 'SELECT * FROM departments ORDER BY name ASC;',
          description: 'Inspects all existing department records in alphabetized sequence.',
          complexity: 'Basic'
        },
        {
          category: 'advanced',
          title: 'Above Department Average',
          question: 'Find students whose GPA is higher than the average GPA of their department.',
          description: 'Correlated subquery comparing individual values against group averages.',
          complexity: 'Advanced'
        },
        {
          category: 'advanced',
          title: 'Department Enrollment Percentage',
          question: 'Calculate what percentage of all students belongs to each department.',
          description: 'Window function or subquery calculating relative proportions.',
          complexity: 'Advanced'
        }
      );
    }

    // 2. Additional schema-aware prompts for any detected custom tables
    if (tables.length > 0) {
      tables.forEach(t => {
        if (t.name.toLowerCase() !== 'students' && t.name.toLowerCase() !== 'departments') {
          items.push(
            {
              category: 'exploration',
              title: `Inspect Table: ${t.name}`,
              question: `SELECT * FROM "${t.name}" LIMIT 20;`,
              description: `Retrieve initial sample rows from the ${t.name} table.`,
              complexity: 'Basic'
            },
            {
              category: 'trends',
              title: `Total Count in ${t.name}`,
              question: `SELECT COUNT(*) AS total_count FROM "${t.name}";`,
              description: `Quickly tally the total row count of ${t.name}.`,
              complexity: 'Basic'
            }
          );
        }
      });
    }

    // 3. Fallback / General database analytics questions (if empty or generic)
    if (items.length < 6) {
      items.push(
        {
          category: 'analytics',
          title: 'Revenue by Product Category',
          question: 'Calculate total revenue grouped by product category for the last quarter.',
          description: 'Typical analytics query grouping transactions by categorical classification.',
          complexity: 'Intermediate'
        },
        {
          category: 'sales',
          title: 'Top 10 Customers by Spend',
          question: 'Find the top 10 customers ranked by total spend with their order counts.',
          description: 'Identifies high-value accounts through joined aggregations.',
          complexity: 'Intermediate'
        },
        {
          category: 'sales',
          title: 'Monthly Sales Trajectory',
          question: 'Calculate monthly sales totals for the past 12 months.',
          description: 'Time-series aggregation utilizing date truncation functions.',
          complexity: 'Intermediate'
        },
        {
          category: 'customers',
          title: 'Inactive Customers',
          question: 'Which registered customers have never placed an order?',
          description: 'LEFT JOIN with NULL verification or NOT EXISTS clause.',
          complexity: 'Intermediate'
        },
        {
          category: 'advanced',
          title: 'Running Total Calculation',
          question: 'Calculate a cumulative running total of daily transaction values.',
          description: 'Window aggregation using OVER (ORDER BY date ROWS UNBOUNDED PRECEDING).',
          complexity: 'Advanced'
        },
        {
          category: 'exploration',
          title: 'Schema Table Inventory',
          question: "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view');",
          description: 'Inspects metadata catalog for active tables and views.',
          complexity: 'Basic'
        }
      );
    }

    return items;
  }, [tables]);

  // Filter by category & search query
  const filteredSuggestions = useMemo(() => {
    return generatedSuggestions.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [generatedSuggestions, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-5xl w-full mx-auto space-y-8 animate-in fade-in duration-150">
      {/* SECTION HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/30 text-xs font-mono text-theme-accent">
          <Database size={13} />
          <span>Active Schema: <strong>{currentDbName}</strong> ({tables.length} tables)</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-theme-primary">
            Explore your data
          </h1>
          <p className="text-sm text-theme-secondary max-w-2xl leading-relaxed">
            Discover analytical queries, schema-aware patterns, and advanced SQL questions tailored to your active database. Click any prompt to stage it in the Studio.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="text"
            placeholder="Filter suggestions by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-surface border border-theme-border rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition flex items-center gap-1.5 ${isSelected
                  ? 'bg-theme-accent text-black font-semibold shadow-sm'
                  : 'bg-theme-surface hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-border'
                }`}>
                <Icon size={12} className={isSelected ? 'text-black' : 'text-theme-muted'} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PROMPT CARDS GRID */}
      {filteredSuggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPrompt(item.question)}
              className="rounded-2xl border border-theme-border bg-theme-surface hover:bg-theme-elevated/70 hover:border-theme-accent/40 p-5 cursor-pointer transition-all duration-150 group shadow-sm flex flex-col justify-between space-y-3 hover:-translate-y-0.5">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-theme-elevated border border-theme-border text-theme-secondary uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.complexity === 'Advanced' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25' : item.complexity === 'Intermediate' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'}`}>
                    {item.complexity}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-theme-primary group-hover:text-theme-accent transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-theme-secondary font-mono bg-theme-elevated/50 p-2.5 rounded-lg border border-theme-border/50 text-slate-300 dark:text-slate-300">
                  "{item.question}"
                </p>

                <p className="text-[11px] text-theme-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end text-xs font-mono text-theme-accent opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Stage question <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-theme-border bg-theme-surface space-y-2">
          <p className="text-sm font-medium text-theme-primary">No suggestions match your search criteria.</p>
          <p className="text-xs text-theme-muted font-mono">Try searching with a different term or select 'All Categories'.</p>
        </div>
      )}
    </div>
  );
}
