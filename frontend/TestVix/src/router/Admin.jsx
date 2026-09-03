import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../pages/admin/AdminLayout';
import Dashboard from '../pages/admin/pages/Dashboard';
import Users from '../pages/admin/pages/Users';
import Tests from '../pages/admin/pages/Tests';
import TestQuestions from '../pages/admin/pages/TestQuestions';
import QuestionVariants from '../pages/admin/pages/QuestionVariants';
import Hashtags from '../pages/admin/pages/Hashtags';
import Results from '../pages/admin/pages/Results';
import Settings from '../pages/admin/pages/Settings';
import Logout from '../pages/user/Logout';

export default function Admin() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="tests" element={<Tests />} />
                <Route path="tests/:testId/questions" element={<TestQuestions />} />
                <Route path="tests/:testId/questions/:questionId/variants" element={<QuestionVariants />} />
                <Route path="hashtags" element={<Hashtags />} />
                <Route path="results" element={<Results />} />
                <Route path="settings" element={<Settings />} />
                <Route path="logout" element={<Logout />} />
            </Route>
        </Routes>
    );
}
