import React, { useState } from 'react';
import './LibrarySelector.css';

const popularLibraries = [
    { name: 'jQuery', version: '3.6.0', url: 'https://code.jquery.com/jquery-3.6.0.min.js' },
    { name: 'React', version: '18.2.0', url: 'https://unpkg.com/react@18.2.0/umd/react.production.min.js' },
    { name: 'React DOM', version: '18.2.0', url: 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js' },
    { name: 'Vue.js', version: '3.2.36', url: 'https://unpkg.com/vue@3.2.36/dist/vue.global.prod.js' },
    { name: 'Bootstrap CSS', version: '5.2.0', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css' },
    { name: 'Bootstrap JS', version: '5.2.0', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js' },
    { name: 'Tailwind CSS', version: '3.1.8', url: 'https://cdn.tailwindcss.com/3.1.8' },
    { name: 'Font Awesome', version: '6.1.2', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css' },
    { name: 'Lodash', version: '4.17.21', url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js' },
    { name: 'Axios', version: '0.27.2', url: 'https://cdn.jsdelivr.net/npm/axios@0.27.2/dist/axios.min.js' }
];

const LibrarySelector = ({ selectedLibraries, onChange }) => {
    const [customLibUrl, setCustomLibUrl] = useState('');

    const handleToggleLibrary = (library) => {
        const isSelected = selectedLibraries.some(lib => lib.url === library.url);

        if (isSelected) {
            // Usuń bibliotekę
            onChange(selectedLibraries.filter(lib => lib.url !== library.url));
        } else {
            // Dodaj bibliotekę
            onChange([...selectedLibraries, library]);
        }
    };

    const handleAddCustomLib = () => {
        if (!customLibUrl.trim()) return;

        // Sprawdź, czy URL jest już na liście
        if (selectedLibraries.some(lib => lib.url === customLibUrl)) {
            alert('Ta biblioteka jest już dodana.');
            return;
        }

        // Spróbuj uzyskać nazwę biblioteki z URL
        const urlParts = customLibUrl.split('/');
        let name = urlParts[urlParts.length - 1];

        // Usuń parametry zapytania i rozszerzenie pliku
        name = name.split('?')[0];
        name = name.split('.').slice(0, -1).join('.') || name;

        const newLib = {
            name: name || 'Custom Library',
            version: 'custom',
            url: customLibUrl
        };

        onChange([...selectedLibraries, newLib]);
        setCustomLibUrl('');
    };

    const handleRemoveLibrary = (url) => {
        onChange(selectedLibraries.filter(lib => lib.url !== url));
    };

    const isLibrarySelected = (url) => {
        return selectedLibraries.some(lib => lib.url === url);
    };

    return (
        <div className="library-selector">
            <h3>Biblioteki zewnętrzne</h3>

            <div className="custom-library">
                <input
                    type="text"
                    value={customLibUrl}
                    onChange={(e) => setCustomLibUrl(e.target.value)}
                    placeholder="Wklej URL do biblioteki (CSS lub JS)"
                />
                <button onClick={handleAddCustomLib}>Dodaj</button>
            </div>

            <div className="selected-libraries">
                <h4>Wybrane biblioteki:</h4>
                {selectedLibraries.length === 0 ? (
                    <p className="no-libraries">Brak wybranych bibliotek</p>
                ) : (
                    <ul>
                        {selectedLibraries.map((lib, index) => (
                            <li key={index}>
                                <span className="lib-name">{lib.name}</span>
                                <span className="lib-version">{lib.version}</span>
                                <button
                                    onClick={() => handleRemoveLibrary(lib.url)}
                                    className="remove-lib"
                                >
                                    Usuń
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="popular-libraries">
                <h4>Popularne biblioteki:</h4>
                <ul>
                    {popularLibraries.map((lib, index) => (
                        <li
                            key={index}
                            className={isLibrarySelected(lib.url) ? 'selected' : ''}
                            onClick={() => handleToggleLibrary(lib)}
                        >
                            <span className="lib-name">{lib.name}</span>
                            <span className="lib-version">{lib.version}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LibrarySelector;
