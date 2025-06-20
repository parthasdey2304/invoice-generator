const SummaryCards = ({ analytics, loading, isDarkTheme }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`p-6 rounded-lg shadow ${
              isDarkTheme ? 'bg-gray-800' : 'bg-white'
            } animate-pulse`}
          >
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Invoices',
      value: analytics?.totalInvoices || 0,
      icon: '📄',
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: `₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: '💰',
      color: 'green'
    },
    {
      title: 'Total Taxes',
      value: `₹${(analytics?.totalTaxAmount || 0).toLocaleString('en-IN')}`,
      icon: '🧮',
      color: 'purple'
    },
    {
      title: 'CGST Total',
      value: `₹${(analytics?.totalTaxes?.cgst || 0).toLocaleString('en-IN')}`,
      icon: '📊',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: isDarkTheme 
        ? 'bg-blue-800 text-blue-100' 
        : 'bg-blue-50 text-blue-600',
      green: isDarkTheme 
        ? 'bg-green-800 text-green-100' 
        : 'bg-green-50 text-green-600',
      purple: isDarkTheme 
        ? 'bg-purple-800 text-purple-100' 
        : 'bg-purple-50 text-purple-600',
      indigo: isDarkTheme 
        ? 'bg-indigo-800 text-indigo-100' 
        : 'bg-indigo-50 text-indigo-600'
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg shadow-sm border ${
            isDarkTheme 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
