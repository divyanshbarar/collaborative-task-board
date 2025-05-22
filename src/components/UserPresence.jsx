import React from 'react';

const UserPresence = ({ users }) => {
  const onlineUsers = Object.values(users || {}).filter(user => user.isOnline);
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorClass = (color) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      teal: 'bg-teal-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  if (onlineUsers.length === 0) {
    return (
      <div className="flex items-center text-gray-500">
        <span className="text-sm">No users online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 mr-2">Online:</span>
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((user, index) => (
          <div key={user.id} className="relative">
            <div className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium ${getColorClass(user.color)}`}>
              {getInitials(user.name)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className="flex items-center justify-center h-8 w-8 bg-gray-200 border-2 border-white rounded-full text-xs font-medium text-gray-600">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
      {onlineUsers.length <= 3 && (
        <div className="flex flex-col space-y-1 ml-3">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${getColorClass(user.color)}`}></div>
              <span className="text-xs text-gray-600">{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPresence;