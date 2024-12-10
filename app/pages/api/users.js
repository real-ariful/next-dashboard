// Example usage in an API route (pages/api/users.js)
import { query } from '../../db/config';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Example usage in a page component (pages/users.js)
import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}