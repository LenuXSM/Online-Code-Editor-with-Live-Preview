import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TemplatePanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TemplatePanel = ({ onApplyTemplate, onSaveAsTemplate, projectData }) => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateDesc, setNewTemplateDesc] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);

    const categories = ['All', 'General', 'Frontend', 'CSS', 'JavaScript', 'React', 'Vue', 'Other'];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/templates`);
            setTemplates(response.data);
        } catch (err) {
            console.error('Błąd podczas pobierania szablonów:', err);
            setError('Nie udało się pobrać szablonów.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyTemplate = (template) => {
        if (window.confirm(`Czy na pewno chcesz zastosować szablon "${template.name}"? Spowoduje to zastąpienie obecnego kodu.`)) {
            onApplyTemplate(template);
        }
    };

    const handleSaveAsTemplate = async () => {
        if (!newTemplateName.trim()) {
            alert('Nazwa szablonu jest wymagana.');
            return;
        }

        try {
            const templateData = {
                name: newTemplateName,
                description: newTemplateDesc,
                category: selectedCategory === 'All' ? 'General' : selectedCategory,
                htmlContent: projectData.html,
                cssContent: projectData.css,
                jsContent: projectData.js,
                isPublic: true
            };

            await axios.post(`${API_URL}/templates`, templateData);

            setNewTemplateName('');
            setNewTemplateDesc('');
            setShowSaveForm(false);
            fetchTemplates();

            alert('Szablon zapisany pomyślnie!');
        } catch (err) {
            console.error('Błąd podczas zapisywania szablonu:', err);
            alert('Nie udało się zapisać szablonu.');
        }
    };

    const filteredTemplates = selectedCategory === 'All'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    if (isLoading) {
        return <div className="templates-loading">Wczytywanie szablonów...</div>;
    }

    if (error) {
        return <div className="templates-error">{error}</div>;
    }

    return (
        <div className="templates-panel">
            <div className="templates-header">
                <h3>Szablony kodu</h3>
                <button
                    onClick={() => setShowSaveForm(!showSaveForm)}
                    className="save-template-btn"
                >
                    {showSaveForm ? 'Anuluj' : 'Zapisz jako szablon'}
                </button>
            </div>

            {showSaveForm && (
                <div className="save-template-form">
                    <input
                        type="text"
                        placeholder="Nazwa szablonu"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                    <textarea
                        placeholder="Opis szablonu"
                        value={newTemplateDesc}
                        onChange={(e) => setNewTemplateDesc(e.target.value)}
                    />
                    <select
                        value={selectedCategory === 'All' ? 'General' : selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.filter(c => c !== 'All').map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <button onClick={handleSaveAsTemplate}>Zapisz</button>
                </div>
            )}

            <div className="template-categories">
                {categories.map(category => (
                    <button
                        key={category}
                        className={selectedCategory === category ? 'active' : ''}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {filteredTemplates.length === 0 ? (
                <p className="templates-empty">Brak dostępnych szablonów w wybranej kategorii.</p>
            ) : (
                <ul className="templates-list">
                    {filteredTemplates.map((template) => (
                        <li key={template._id} className="template-item">
                            <div className="template-item-info">
                                <h4>{template.name}</h4>
                                <p>{template.description}</p>
                                <span className="template-category">{template.category}</span>
                            </div>
                            <button
                                onClick={() => handleApplyTemplate(template)}
                                className="apply-template-btn"
                            >
                                Zastosuj
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TemplatePanel;
