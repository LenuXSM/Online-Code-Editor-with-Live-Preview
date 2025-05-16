import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import CodeEditor from './components/Editor';
import LivePreview from './components/Preview';
import Navbar from './components/Layout/Navbar';
import HistoryPanel from './components/History/HistoryPanel';
import TemplatePanel from './components/Templates/TemplatePanel';
import socketService from './services/socket';
import { projectService } from './services/api';
import './App.css';

function App() {
    const [html, setHtml] = useState('<div>\n  <h1>Hello, World!</h1>\n  <p>Start coding here</p>\n</div>');
    const [css, setCss] = useState('body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}');
    const [js, setJs] = useState('// JavaScript code here\nconsole.log("Hello from JavaScript!");');
    const [activeTab, setActiveTab] = useState('html');
    const [projectId, setProjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState('history'); // 'history' or 'templates'

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
                    const { htmlContent, cssContent, jsContent } = response.data;
                    setHtml(htmlContent);
                    setCss(cssContent);
                    setJs(jsContent);
                })
                .catch(error => {
                    console.error('Błąd podczas wczytywania projektu:', error);
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
    }, [projectId]);

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

    const handleRestoreVersion = (project) => {
        setHtml(project.htmlContent);
        setCss(project.cssContent);
        setJs(project.jsContent);
    };

    const handleApplyTemplate = (template) => {
        setHtml(template.htmlContent);
        setCss(template.cssContent);
        setJs(template.jsContent);
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
        <div className="app">
            <Navbar
                html={html}
                css={css}
                js={js}
                projectId={projectId}
                setProjectId={setProjectId}
                onToggleHistory={() => toggleSidebar('history')}
                onToggleTemplates={() => toggleSidebar('templates')}
            />

            <div className="main-container">
                {sidebarOpen && (
                    <div className="sidebar">
                        {activeSidebar === 'history' ? (
                            <HistoryPanel
                                projectId={projectId}
                                onRestoreVersion={handleRestoreVersion}
                            />
                        ) : (
                            <TemplatePanel
                                onApplyTemplate={handleApplyTemplate}
                                onSaveAsTemplate={() => {}}
                                projectData={{ html, css, js }}
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
                            <LivePreview html={html} css={css} js={js} />
                        </div>
                    </SplitPane>
                </div>
            </div>
        </div>
    );
}

export default App;
