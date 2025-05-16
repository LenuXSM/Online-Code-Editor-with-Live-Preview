const Project = require('../models/Project');

// Pobierz wszystkie projekty
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Pobierz pojedynczy projekt
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nie znaleziony' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Utwórz nowy projekt
exports.createProject = async (req, res) => {
    try {
        const { name, description, htmlContent, cssContent, jsContent, externalLibraries, isPublic } = req.body;

        const newProject = new Project({
            name,
            description,
            htmlContent,
            cssContent,
            jsContent,
            externalLibraries, // Dodane pole z drugiego fragmentu
            isPublic
        });

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Aktualizuj projekt
exports.updateProject = async (req, res) => {
    try {
        const { name, description, htmlContent, cssContent, jsContent, externalLibraries, isPublic } = req.body;

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                htmlContent,
                cssContent,
                jsContent,
                externalLibraries, // Dodane pole z drugiego fragmentu
                isPublic,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Projekt nie znaleziony' });
        }

        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Usuń projekt
exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Projekt nie znaleziony' });
        }

        res.json({ message: 'Projekt usunięty' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
