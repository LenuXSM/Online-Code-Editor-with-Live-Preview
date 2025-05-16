import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Editor from './pages/Editor';
import ViewProject from './pages/ViewProject';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Editor />} />
                <Route path="/edit/:id" element={<Editor />} />
                <Route path="/view/:id" element={<ViewProject />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
