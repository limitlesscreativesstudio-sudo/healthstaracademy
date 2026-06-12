import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

/**
 * Instructor landing page wrapper.
 * Renders the real Dashboard (course list + To Do) and routes course entry
 * into the CourseView at /portal/teach/courses/:id.
 */
const TeachHome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Dashboard
      onEnterCourse={(course) => navigate(`/portal/teach/courses/${course.id}`)}
    />
  );
};

export default TeachHome;
