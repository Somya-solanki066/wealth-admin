import { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { userService } from '../services/userService';
import { getProfilePictureUrl } from '../utils/imageHelper';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(1, 100);
      
      // Handle both array and object responses
      const allUsers = Array.isArray(response) 
        ? response 
        : (response.success ? (response.data || response.users || []) : []);
      
      // Filter students (don't fetch profiles for all - too slow)
      const studentUsers = allUsers.filter(user => user.role === 'student');
      
      setStudents(studentUsers);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-page">
      <div className="page-header">
        <h2>Students Management</h2>
      </div>

      {loading ? (
        <div className="loading">Loading students...</div>
      ) : (
        <div className="students-table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Interests</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={getProfilePictureUrl(student, 32)} 
                          alt={student.name || 'Student'}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                        <span>{student.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{student.email || 'N/A'}</td>
                    <td>
                      {student.interests && student.interests.length > 0
                        ? student.interests.slice(0, 3).join(', ')
                        : 'N/A'}
                    </td>
                    <td>
                      <button className="btn-view" onClick={async () => {
                        try {
                          const response = await studentService.getStudentProfile(student.id);
                          alert(`Student Profile:\n${JSON.stringify(response.data || response, null, 2)}`);
                        } catch (error) {
                          alert('Error fetching student profile');
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

export default Students;

