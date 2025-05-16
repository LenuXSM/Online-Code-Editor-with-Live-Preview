import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistoryPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HistoryPanel = ({ projectId, onRestoreVersion }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchHistory();
        }
    }, [projectId]);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/history`);
            setHistory(response.data);
        } catch (err) {
            console.error('Błąd podczas pobierania historii:', err);
            setError('Nie udało się pobrać historii zmian.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveVersion = async () => {
        try {
            await axios.post(`${API_URL}/projects/${projectId}/versions`, {
                message: 'Ręczny zapis wersji'
            });

            fetchHistory();
            alert('Wersja zapisana pomyślnie!');
        } catch (err) {
            console.error('Błąd podczas zapisywania wersji:', err);
            alert('Nie udało się zapisać wersji.');
        }
    };

    const handleRestoreVersion = async (versionId) => {
        try {
            const response = await axios.post(`${API_URL}/projects/${projectId}/versions/${versionId}/restore`);

            if (onRestoreVersion) {
                onRestoreVersion(response.data);
            }

            alert('Wersja przywrócona pomyślnie!');
        } catch (err) {
            console.error('Błąd podczas przywracania wersji:', err);
            alert('Nie udało się przywrócić wersji.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (isLoading) {
        return <div className="history-loading">Wczytywanie historii...</div>;
    }

    if (error) {
        return <div className="history-error">{error}</div>;
    }

    return (
        <div className="history-panel">
            <div className="history-header">
                <h3>Historia zmian</h3>
                <button onClick={handleSaveVersion}>Zapisz obecną wersję</button>
            </div>

            {history.length === 0 ? (
                <p className="history-empty">Brak zapisanych wersji.</p>
            ) : (
                <ul className="history-list">
                    {history.map((version) => (
                        <li key={version._id} className="history-item">
                            <div className="history-item-info">
                                <span className="history-item-date">{formatDate(version.timestamp)}</span>
                                <span className="history-item-message">{version.message}</span>
                            </div>
                            <button
                                onClick={() => handleRestoreVersion(version._id)}
                                className="history-item-restore"
                            >
                                Przywróć
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryPanel;
