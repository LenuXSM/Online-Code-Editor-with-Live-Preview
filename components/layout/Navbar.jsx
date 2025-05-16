import React, { useState } from 'react';

const Navbar = ({
                    projectName,
                    setProjectName,
                    onSave,
                    projectId,
                    onToggleHistory,
                    onToggleTemplates,
                    onToggleLibraries,
                    autoSaveEnabled,
                    setAutoSaveEnabled,
                    lastSaved
                }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave();
            alert('Projekt zapisany pomyślnie!');
        } catch (error) {
            alert('Wystąpił błąd podczas zapisywania projektu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (!projectId) {
            try {
                setIsSaving(true);
                const savedProject = await onSave();
                generateShareLink(savedProject._id);
            } catch (error) {
                alert('Najpierw zapisz projekt, aby móc go udostępnić.');
            } finally {
                setIsSaving(false);
            }
        } else {
            generateShareLink(projectId);
        }
    };

    const generateShareLink = (id) => {
        const shareUrl = `${window.location.origin}/view/${id}`;
        setShareLink(shareUrl);
        setIsShareModalOpen(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        alert('Link skopiowany do schowka!');
    };

    const formatLastSaved = () => {
        if (!lastSaved) return '';

        const now = new Date();
        const diff = Math.floor((now - lastSaved) / 1000); // różnica w sekundach

        if (diff < 60) {
            return 'przed chwilą';
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} ${minutes === 1 ? 'minutę' : minutes < 5 ? 'minuty' : 'minut'} temu`;
        } else {
            return lastSaved.toLocaleTimeString();
        }
    };

    return (
        <nav className="navbar">
            <div className="logo">CodeEditor</div>

            <div className="project-name">
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nazwa projektu"
                />
            </div>

            <div className="auto-save">
                <label>
                    <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    />
                    Auto-zapis
                </label>
                {lastSaved && (
                    <span className="last-saved">
                        Zapisano: {formatLastSaved()}
                    </span>
                )}
            </div>

            <div className="actions">
                <button onClick={onToggleHistory}>Historia</button>
                <button onClick={onToggleTemplates}>Szablony</button>
                <button onClick={onToggleLibraries}>Biblioteki</button>
                <button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
                <button onClick={handleShare}>Udostępnij</button>
            </div>

            {isShareModalOpen && (
                <div className="share-modal">
                    <div className="share-modal-content">
                        <h3>Udostępnij projekt</h3>
                        <p>Skopiuj poniższy link, aby udostępnić swój projekt:</p>
                        <div className="share-link-container">
                            <input type="text" value={shareLink} readOnly />
                            <button onClick={copyToClipboard}>Kopiuj</button>
                        </div>
                        <button
                            className="close-modal"
                            onClick={() => setIsShareModalOpen(false)}
                        >
                            Zamknij
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
