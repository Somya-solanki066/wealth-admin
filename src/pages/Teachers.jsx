import { useState, useEffect } from 'react';
import { teacherService } from '../services/teacherService';
import { userService } from '../services/userService';
import { getProfilePictureUrl } from '../utils/imageHelper';
import './Teachers.css';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(1, 100);
      
      // Handle both array and object responses
      const allUsers = Array.isArray(response) 
        ? response 
        : (response.success ? (response.data || response.users || []) : []);
      
      // Filter teachers (don't fetch profiles for all - too slow)
      const teacherUsers = allUsers.filter(user => user.role === 'teacher');
      
      setTeachers(teacherUsers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teachers-page">
      <div className="page-header">
        <h2>Teachers Management</h2>
      </div>

      {loading ? (
        <div className="loading">Loading teachers...</div>
      ) : (
        <div className="teachers-table-container">
          <table className="teachers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Headline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={getProfilePictureUrl(teacher, 32)} 
                          alt={teacher.name || 'Teacher'}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        <span>{teacher.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{teacher.email || 'N/A'}</td>
                    <td>{teacher.headline || 'N/A'}</td>
                    <td>
                      <button className="btn-view" onClick={async () => {
                        try {
                          const response = await teacherService.getTeacherProfile(teacher.id);
                          alert(`Teacher Profile:\n${JSON.stringify(response.data || response, null, 2)}`);
                        } catch (error) {
                          alert('Error fetching teacher profile');
                        }
                      }}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Teachers;

