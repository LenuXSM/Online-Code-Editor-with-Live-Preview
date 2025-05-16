import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LivePreview from '../components/Preview/LivePreview';
import axios from 'axios';
import './ViewProject.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ViewProject = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [activeTab, setActiveTab] = useState('preview');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(`${API_URL}/projects/${id}`);
                setProject(response.data);
            } catch (err) {
                console.error('Błąd podczas pobierania projektu:', err);
                setError('Nie udało się pobrać projektu. Sprawdź, czy link jest poprawny.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (isLoading) {
        return <div className="loading">Wczytywanie projektu...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!project) {
        return <div className="error">Projekt nie został znaleziony.</div>;
    }

    return (
        <div className="view-project">
            <div className="view-header">
                <h1>{project.name}</h1>
                <div className="view-actions">
                    <button onClick={() => setShowCode(!showCode)}>
                        {showCode ? 'Ukryj kod' : 'Pokaż kod'}
                    </button>
                    <a href={`/edit/${id}`} className="edit-button">Edytuj</a>
                </div>
            </div>

            <div className="view-content">
                {showCode ? (
                    <div className="code-tabs">
                        <div className="tabs">
                            <button
                                className={activeTab === 'preview' ? 'active' : ''}
                                onClick={() => setActiveTab('preview')}
                            >
                                Podgląd
                            </button>
                            <button
                                className={activeTab === 'html' ? 'active' : ''}
                                onClick={() => setActiveTab('html')}
                            >
                                HTML
                            </button>
                            <button
                                className={activeTab === 'css' ? 'active' : ''}
                                onClick={() => setActiveTab('css')}
                            >
                                CSS
                            </button>
                            <button
                                className={activeTab === 'js' ? 'active' : ''}
                                onClick={() => setActiveTab('js')}
                            >
                                JavaScript
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'preview' ? (
                                <LivePreview
                                    html={project.htmlContent}
                                    css={project.cssContent}
                                    js={project.jsContent}
                                    libraries={project.externalLibraries || []}
                                />
                            ) : activeTab === 'html' ? (
                                <pre className="code-display">{project.htmlContent}</pre>
                            ) : activeTab === 'css' ? (
                                <pre className="code-display">{project.cssContent}</pre>
                            ) : (
                                <pre className="code-display">{project.jsContent}</pre>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="preview-only">
                        <LivePreview
                            html={project.htmlContent}
                            css={project.cssContent}
                            js={project.jsContent}
                            libraries={project.externalLibraries || []}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewProject;
