import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import CodeEditor from '../components/Editor';
import LivePreview from '../components/Preview';
import Navbar from '../components/Layout/Navbar';
import HistoryPanel from '../components/History/HistoryPanel';
import TemplatePanel from '../components/Templates/TemplatePanel';
import LibrarySelector from '../components/ExternalLibs/LibrarySelector';
import socketService from '../services/socket';
import { projectService } from '../services/api';
import './Editor.css';

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [html, setHtml] = useState('<div>\n  <h1>Hello, World!</h1>\n  <p>Start coding here</p>\n</div>');
    const [css, setCss] = useState('body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}');
    const [js, setJs] = useState('// JavaScript code here\nconsole.log("Hello from JavaScript!");');
    const [activeTab, setActiveTab] = useState('html');
    const [projectId, setProjectId] = useState(id || null);
    const [projectName, setProjectName] = useState('Untitled Project');
    const [isLoading, setIsLoading] = useState(!!id);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState('history'); // 'history', 'templates', 'libraries'
    const [libraries, setLibraries] = useState([]);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);

    // Inicjalizacja Socket.io przy montowaniu komponentu
    useEffect(() => {
        socketService.connect();

        return () => {
            socketService.disconnect();
        };
    }, []);

    // Dołączanie do pokoju projektu, gdy projectId się zmienia
    useEffect(() => {
        if (projectId) {
            socketService.joinProject(projectId);

            // Wczytywanie projektu z bazy danych
            setIsLoading(true);
            projectService.getProject(projectId)
                .then(response => {
                    const { name, htmlContent, cssContent, jsContent, externalLibraries } = response.data;
                    setProjectName(name);
                    setHtml(htmlContent);
                    setCss(cssContent);
                    setJs(jsContent);
                    setLibraries(externalLibraries || []);

                    // Aktualizacja URL, jeśli nie zawiera ID projektu
                    if (!id) {
                        navigate(`/edit/${projectId}`, { replace: true });
                    }
                })
                .catch(error => {
                    console.error('Błąd podczas wczytywania projektu:', error);
                    alert('Nie udało się wczytać projektu. Sprawdź, czy link jest poprawny.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

        return () => {
            if (projectId) {
                socketService.leaveProject();
            }
        };
    }, [projectId, id, navigate]);

    // Nasłuchiwanie na aktualizacje kodu od innych użytkowników
    useEffect(() => {
        socketService.onCodeUpdate(({ language, content }) => {
            switch (language) {
                case 'html':
                    setHtml(content);
                    break;
                case 'css':
                    setCss(content);
                    break;
                case 'js':
                    setJs(content);
                    break;
                default:
                    break;
            }
        });
    }, []);

    // Funkcje do aktualizacji kodu z uwzględnieniem Socket.io
    const handleHtmlChange = (value) => {
        setHtml(value);
        socketService.sendCodeUpdate('html', value);
    };

    const handleCssChange = (value) => {
        setCss(value);
        socketService.sendCodeUpdate('css', value);
    };

    const handleJsChange = (value) => {
        setJs(value);
        socketService.sendCodeUpdate('js', value);
    };

    const handleSaveProject = async () => {
        try {
            const projectData = {
                name: projectName,
                htmlContent: html,
                cssContent: css,
                jsContent: js,
                externalLibraries: libraries,
                isPublic: true
            };

            let response;

            if (projectId) {
                // Aktualizuj istniejący projekt
                response = await projectService.updateProject(projectId, projectData);
            } else {
                // Utwórz nowy projekt
                response = await projectService.createProject(projectData);
                setProjectId(response.data._id);
                navigate(`/edit/${response.data._id}`, { replace: true });
            }

            setLastSaved(new Date());
            return response.data;
        } catch (error) {
            console.error('Błąd podczas zapisywania projektu:', error);
            throw error;
        }
    };

    // Funkcja automatycznego zapisywania
    const autoSave = useCallback(async () => {
        if (!autoSaveEnabled || !projectId) return;

        try {
            const projectData = {
                name: projectName,
                htmlContent: html,
                cssContent: css,
                jsContent: js,
                externalLibraries: libraries,
                isPublic: true
            };

            await projectService.updateProject(projectId, projectData);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Błąd automatycznego zapisywania:', error);
        }
    }, [autoSaveEnabled, projectId, projectName, html, css, js, libraries]);

    // Uruchamianie automatycznego zapisywania co 30 sekund
    useEffect(() => {
        if (!autoSaveEnabled || !projectId) return;

        const interval = setInterval(() => {
            autoSave();
        }, 30000); // 30 sekund

        return () => clearInterval(interval);
    }, [autoSaveEnabled, projectId, autoSave]);

    const handleRestoreVersion = (project) => {
        setHtml(project.htmlContent);
        setCss(project.cssContent);
        setJs(project.jsContent);
        if (project.externalLibraries) {
            setLibraries(project.externalLibraries);
        }
    };

    const handleApplyTemplate = (template) => {
        setHtml(template.htmlContent);
        setCss(template.cssContent);
        setJs(template.jsContent);
        if (template.externalLibraries) {
            setLibraries(template.externalLibraries);
        }
    };

    const toggleSidebar = (type) => {
        if (sidebarOpen && activeSidebar === type) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
            setActiveSidebar(type);
        }
    };

    const renderEditor = () => {
        switch (activeTab) {
            case 'html':
                return <CodeEditor language="html" value={html} onChange={handleHtmlChange} />;
            case 'css':
                return <CodeEditor language="css" value={css} onChange={handleCssChange} />;
            case 'js':
                return <CodeEditor language="javascript" value={js} onChange={handleJsChange} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="loading">Wczytywanie projektu...</div>;
    }

    return (
        <div className="editor-page">
            <Navbar
                projectName={projectName}
                setProjectName={setProjectName}
                onSave={handleSaveProject}
                projectId={projectId}
                onToggleHistory={() => toggleSidebar('history')}
                onToggleTemplates={() => toggleSidebar('templates')}
                onToggleLibraries={() => toggleSidebar('libraries')}
                autoSaveEnabled={autoSaveEnabled}
                setAutoSaveEnabled={setAutoSaveEnabled}
                lastSaved={lastSaved}
            />

            <div className="main-container">
                {sidebarOpen && (
                    <div className="sidebar">
                        {activeSidebar === 'history' ? (
                            <HistoryPanel
                                projectId={projectId}
                                onRestoreVersion={handleRestoreVersion}
                            />
                        ) : activeSidebar === 'templates' ? (
                            <TemplatePanel
                                onApplyTemplate={handleApplyTemplate}
                                projectData={{ html, css, js }}
                            />
                        ) : (
                            <LibrarySelector
                                selectedLibraries={libraries}
                                onChange={setLibraries}
                            />
                        )}
                    </div>
                )}

                <div className="editor-container">
                    <div className="tabs">
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

                    <SplitPane split="vertical" minSize={300} defaultSize="50%">
                        <div className="editor-pane">
                            {renderEditor()}
                        </div>
                        <div className="preview-pane">
                            <LivePreview html={html} css={css} js={js} libraries={libraries} />
                        </div>
                    </SplitPane>
                </div>
            </div>
        </div>
    );
};

export default Editor;
