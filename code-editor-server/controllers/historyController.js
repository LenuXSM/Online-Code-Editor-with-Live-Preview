const ChangeHistory = require('../models/ChangeHistory');
const Project = require('../models/Project');

// Pobierz historię zmian dla projektu
exports.getProjectHistory = async (req, res) => {
    try {
        const history = await ChangeHistory.find({ projectId: req.params.projectId })
            .sort({ timestamp: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Zapisz nową wersję projektu
exports.saveVersion = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, message } = req.body;

        // Pobierz aktualny stan projektu
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Projekt nie znaleziony' });
        }

        // Utwórz nowy wpis w historii
        const newVersion = new ChangeHistory({
            projectId,
            userId: userId || 'anonymous',
            htmlContent: project.htmlContent,
            cssContent: project.cssContent,
            jsContent: project.jsContent,
            message: message || 'Ręczny zapis wersji'
        });

        await newVersion.save();

        res.status(201).json(newVersion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Przywróć wersję z historii
exports.restoreVersion = async (req, res) => {
    try {
        const { projectId, versionId } = req.params;

        // Pobierz wersję z historii
        const version = await ChangeHistory.findById(versionId);

        if (!version || version.projectId.toString() !== projectId) {
            return res.status(404).json({ message: 'Wersja nie znaleziona' });
        }

        // Aktualizuj projekt
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            {
                htmlContent: version.htmlContent,
                cssContent: version.cssContent,
                jsContent: version.jsContent,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
