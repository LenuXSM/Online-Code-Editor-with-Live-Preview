import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const projectService = {
    getProjects: () => api.get('/projects'),
    getProject: (id) => api.get(`/projects/${id}`),
    createProject: (project) => api.post('/projects', project),
    updateProject: (id, project) => api.put(`/projects/${id}`, project),
    deleteProject: (id) => api.delete(`/projects/${id}`),
};

export default api;
