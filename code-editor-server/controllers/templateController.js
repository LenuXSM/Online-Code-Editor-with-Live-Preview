const Template = require('../models/Template');

// Pobierz szablony
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find({ isPublic: true });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Pobierz pojedynczy szablon
exports.getTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Szablon nie znaleziony' });
        }

        res.json(template);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Utwórz nowy szablon
exports.createTemplate = async (req, res) => {
    try {
        const { name, description, category, htmlContent, cssContent, jsContent, isPublic } = req.body;

        const newTemplate = new Template({
            name,
            description,
            category,
            htmlContent,
            cssContent,
            jsContent,
            isPublic,
            createdBy: req.body.userId || 'anonymous'
        });

        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Usuń szablon
exports.deleteTemplate = async (req, res) => {
    try {
        const deletedTemplate = await Template.findByIdAndDelete(req.params.id);

        if (!deletedTemplate) {
            return res.status(404).json({ message: 'Szablon nie znaleziony' });
        }

        res.json({ message: 'Szablon usunięty' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
